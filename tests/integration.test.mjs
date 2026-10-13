import { after, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}
let handle
let requests = []
const server = createServer(async (req, res) => {
  let raw = ''
  for await (const chunk of req) raw += chunk
  const request = {
    path: req.url,
    method: req.method,
    authorization: req.headers.authorization,
    body: raw ? JSON.parse(raw) : undefined,
  }
  requests.push(request)
  const json = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }
  try {
    await handle(request, json, res)
  } catch (error) {
    json(500, { error: error.message })
  }
})
// CPU-heavy component rendering can outlast Node's five-second idle timeout.
// Keep fixture sockets alive so the next Axios contract test cannot reuse a
// socket that expired while the event loop was busy rendering the previous test.
server.keepAliveTimeout = 60_000
server.listen(0, '127.0.0.1')
await once(server, 'listening')
process.env.VITE_API_BASE_URL = `http://127.0.0.1:${server.address().port}/api/v1`
const { apiClient, tokenStorage, refreshStaffSession, subscribeSession } =
  await import('../src/lib/api/client.ts')
const { authService } = await import('../src/features/auth/services/authService.ts')
const { staffService } =
  await import('../src/features/settings/services/staff.service.ts')
const { driverService, filterDrivers } =
  await import('../src/features/drivers/services/driver.service.ts')
const { verificationService } =
  await import('../src/features/drivers/services/verification.service.ts')
const { customerService } =
  await import('../src/features/customers/services/customer.service.ts')
const { supportService } =
  await import('../src/features/support/services/support.service.ts')
const { dashboardService } =
  await import('../src/features/dashboard/services/dashboard.service.ts')

test('API references, HTTP-date rate limits and field errors remain actionable', async () => {
  const { formatApiError, retryAfterSeconds, applyFieldErrors } = await import('../src/lib/api/errors.ts')
  const { maskPhone } = await import('../src/components/common/mask-phone.ts')
  assert.equal(maskPhone('+255 754 123 456'), '+255 7** *** 456')
  const now = Date.UTC(2026, 9, 13, 10, 0)
  assert.equal(retryAfterSeconds(new Date(now + 30000).toUTCString(), now), 30)
  assert.equal(retryAfterSeconds('7'), 7)
  const detail = formatApiError({ isAxiosError: true, response: {
    status: 422, data: { error: 'Invalid request', request_id: 'test-reference', fields: { reason: 'Required' } }, headers: {},
  } })
  assert.match(detail.message, /Reference: test-reference/)
  const fields = {}
  assert.equal(applyFieldErrors(detail, (field, message) => fields[field] = message), true)
  assert.deepEqual(fields, { reason: 'Required' })
})
const { mapBackendUserDetailToDriver } =
  await import('../src/features/drivers/adapters/driverAdapter.ts')
const staff = {
  id: 'staff-1',
  name: 'Admin',
  email: 'admin@example.test',
  role: 'admin',
  is_active: true,
  must_change_password: false,
  totp_enabled: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}
const profile = {
  user_id: 'driver-1',
  licence_number: 'LIC-1',
  vehicle_card_number: 'CARD-1',
  plate_number: 'T 123 ABC',
  licence_image_url: '/api/v1/files/licences/licence-1.png',
  profile_picture_url: '',
  verification_status: 'submitted',
  assigned_to: null,
  assigned_at: null,
  is_online: false,
  average_rating: 4.5,
  total_ratings: 2,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}
const user = {
  id: 'driver-1',
  name: 'Driver One',
  email: 'driver@example.test',
  role: 'driver',
  is_active: true,
}
const document = {
  id: 'document-1',
  driver_id: user.id,
  type: 'driving_licence',
  file_url: '/api/v1/files/documents/document-1',
  status: 'submitted',
  is_current: true,
  rejection_code: '',
  rejection_note: '',
  expires_at: '2027-01-01T00:00:00Z',
  reviewed_by: null,
  reviewed_at: null,
  created_at: profile.created_at,
}
const detail = {
  user,
  driver_profile: profile,
  driver_documents: [document],
  average_rating: 4.5,
  total_ratings: 2,
}
const filters = {
  search: '',
  accountStatus: 'all',
  verificationStatus: 'all',
  vehicleType: 'all',
  page: 1,
  pageSize: 10,
}
beforeEach(() => {
  requests = []
  tokenStorage.clearTokens()
  tokenStorage.setSession('access', 'refresh')
  handle = (_req, json) => json(404, { error: 'Unexpected endpoint' })
})
after(() => new Promise((resolve) => server.close(resolve)))

test('staff login sends the backend TOTP field, maps password gate, and persists rotated tokens', async () => {
  handle = (req, json) => {
    assert.equal(req.path, '/api/v1/staff/auth/login')
    assert.deepEqual(req.body, {
      email: staff.email,
      password: 'password123456',
      totp_code: '123456',
    })
    json(200, {
      access_token: 'login-access',
      refresh_token: 'login-refresh',
      must_change_password: true,
      user: { ...staff, must_change_password: true },
    })
  }
  const session = await authService.login({
    email: ` ${staff.email} `,
    password: 'password123456',
    totpCode: '123456',
  })
  assert.equal(session.user.mustChangePassword, true)
  assert.equal(session.user.totpEnabled, true)
  assert.equal(tokenStorage.getRefreshToken(), 'login-refresh')
})

test('concurrent expired requests share one refresh and each replay carries the new bearer token', async () => {
  let rotations = 0
  handle = async (req, json) => {
    if (req.path === '/api/v1/staff/auth/refresh') {
      rotations++
      assert.deepEqual(req.body, { refresh_token: 'refresh' })
      await delay(30)
      json(200, { access_token: 'new-access', refresh_token: 'new-refresh', user: staff })
    } else if (req.authorization === 'Bearer new-access') json(200, { ok: true })
    else json(401, { error: 'expired' })
  }
  await Promise.all([
    apiClient.get('/admin/stats'),
    apiClient.get('/admin/users'),
    apiClient.get('/admin/staff'),
  ])
  assert.equal(rotations, 1)
  assert.equal(
    requests.filter((req) => req.authorization === 'Bearer new-access').length,
    3
  )
  assert.equal(tokenStorage.getRefreshToken(), 'new-refresh')
})

test('refresh failure expires the session once and does not loop', async () => {
  let expired = 0
  const unsubscribe = subscribeSession((event) => {
    if (event.type === 'expired') expired++
  })
  handle = (_req, json) => json(401, { error: 'Invalid refresh token' })
  await assert.rejects(apiClient.get('/admin/stats'), /Invalid refresh token/)
  unsubscribe()
  assert.equal(tokenStorage.getAccessToken(), null)
  assert.equal(expired, 1)
  assert.equal(requests.length, 2)
})

test('logout while refresh is in flight cannot restore the old session', async () => {
  let arrived
  const waiting = new Promise((resolve) => {
    arrived = resolve
  })
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  handle = async (_req, json) => {
    arrived()
    await gate
    json(200, { access_token: 'late', refresh_token: 'late-refresh', user: staff })
  }
  const refreshing = refreshStaffSession()
  await waiting
  tokenStorage.clearTokens()
  release()
  await assert.rejects(refreshing, /session has changed/)
  assert.equal(tokenStorage.getAccessToken(), null)
})

test('logout after access expiry revokes the current rotated refresh token', async () => {
  handle = (req, json) => {
    if (req.path.endsWith('/refresh'))
      return json(200, {
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        user: staff,
      })
    if (req.authorization !== 'Bearer new-access') return json(401, { error: 'expired' })
    assert.deepEqual(req.body, { refresh_token: 'new-refresh' })
    json(200, { message: 'Logged out successfully' })
  }
  await authService.logout()
  assert.equal(tokenStorage.getAccessToken(), null)
  assert.equal(requests.length, 3)
})

test('staff management and audit calls use the exact backend verbs and payloads', async () => {
  handle = (req, json) => {
    assert.equal(req.authorization, 'Bearer access')
    if (req.path.includes('audit-logs'))
      return json(200, { total: 26, limit: 25, logs: [] })
    if (req.method === 'GET') return json(200, { count: 1, staff: [staff] })
    json(200, { staff, one_time_password: 'temporary-password', message: 'updated' })
  }
  await staffService.listStaff()
  await staffService.createStaff({
    name: 'Support',
    email: 'support@example.test',
    role: 'support',
  })
  await staffService.updateStaff(staff.id, { name: 'Renamed', is_active: false })
  await staffService.updateStaffRole(staff.id, 'support')
  await staffService.resetPassword(staff.id)
  await staffService.revokeSessions(staff.id)
  assert.equal((await staffService.listAuditLogs(25, 25)).total, 26)
  assert.deepEqual(
    requests.map(({ method, path, body }) => ({ method, path, body })),
    [
      { method: 'GET', path: '/api/v1/admin/staff', body: undefined },
      {
        method: 'POST',
        path: '/api/v1/admin/staff',
        body: { name: 'Support', email: 'support@example.test', role: 'support' },
      },
      {
        method: 'PATCH',
        path: '/api/v1/admin/staff/staff-1',
        body: { name: 'Renamed', is_active: false },
      },
      {
        method: 'PATCH',
        path: '/api/v1/admin/staff/staff-1/role',
        body: { role: 'support' },
      },
      {
        method: 'POST',
        path: '/api/v1/admin/staff/staff-1/reset-password',
        body: undefined,
      },
      {
        method: 'POST',
        path: '/api/v1/admin/staff/staff-1/revoke-sessions',
        body: undefined,
      },
      {
        method: 'GET',
        path: '/api/v1/admin/audit-logs?limit=25&offset=25',
        body: undefined,
      },
    ]
  )
})

test('driver directory enriches profiles, bounds concurrency, and does not truncate the verification queue at 100', async () => {
  const users = Array.from({ length: 105 }, (_, index) => ({
    ...user,
    id: `driver-${index}`,
  }))
  let concurrent = 0
  let peak = 0
  handle = async (req, json) => {
    if (req.path === '/api/v1/admin/verifications')
      return json(200, {
        verifications: users.map((u) => ({ ...profile, user_id: u.id })),
      })
    if (req.path.includes('?role=driver'))
      return json(200, { count: users.length, users })
    concurrent++
    peak = Math.max(peak, concurrent)
    await delay(2)
    const id = req.path.split('/').at(-1)
    concurrent--
    json(200, {
      ...detail,
      user: { ...user, id },
      driver_profile: { ...profile, user_id: id },
    })
  }
  const queue = await driverService.listVerificationRequests()
  assert.equal(queue.length, 105)
  assert.ok(peak <= 6)
  assert.equal(queue[104].documentsCount, 1)
  const driver = mapBackendUserDetailToDriver(detail)
  assert.equal(
    filterDrivers([driver], {
      ...filters,
      search: 'T 123 ABC',
      verificationStatus: 'submitted',
    }).total,
    1
  )
  assert.equal(
    filterDrivers([driver], { ...filters, verificationStatus: 'approved' }).total,
    0
  )
  assert.equal(filterDrivers([driver], { ...filters, page: 99 }).page, 1)
})

test('missing backend fields remain unavailable, and unuploaded licences are not fabricated', () => {
  const driver = mapBackendUserDetailToDriver({
    ...detail,
    driver_profile: { ...profile, licence_image_url: '', created_at: '' },
    driver_documents: [],
  })
  assert.equal(driver.documents.length, 0)
  assert.equal(driver.totalTrips, null)
  assert.equal(driver.acceptanceRate, null)
  assert.equal(driver.vehicle.type, 'unknown')
  assert.equal(driver.joinedAt, '')
})

test('driver verification, user role changes, and private files carry staff authorization', async () => {
  handle = (req, json, res) => {
    assert.equal(req.authorization, 'Bearer access')
    if (req.path.includes('/files/')) {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(Buffer.from([137, 80, 78, 71]))
      return
    }
    json(200, { driver_profile: profile, message: 'updated' })
  }
  await verificationService.review(
    user.id,
    document.id,
    'rejected',
    'blurry_image',
    'Please upload a clearer image.'
  )
  await driverService.updateUserRole(user.id, 'passenger')
  const file = await apiClient.get(`/files/documents/${document.id}`, {
    responseType: 'arraybuffer',
  })
  assert.equal(file.data.length, 4)
  assert.equal(requests[0].method, 'PATCH')
  assert.equal(requests[0].path, `/api/v1/admin/documents/${document.id}/review`)
  assert.deepEqual(requests[0].body, {
    decision: 'rejected',
    reason_code: 'blurry_image',
    note: 'Please upload a clearer image.',
  })
  assert.deepEqual(requests[1].body, { role: 'passenger' })
})

test('review claims, releases, suspension and detail requests follow the workflow contract', async () => {
  handle = (req, json) => {
    assert.equal(req.authorization, 'Bearer access')
    json(200, {
      profile,
      documents: [document],
      reviews: [],
      required_types: ['driving_licence'],
      rejection_codes: ['blurry_image'],
    })
  }
  await verificationService.get(user.id)
  await verificationService.claim(user.id)
  await verificationService.approve(user.id)
  await verificationService.release(user.id)
  await verificationService.suspend(user.id, true, 'Safety investigation')
  assert.deepEqual(
    requests.map(({ method, path, body }) => ({ method, path, body })),
    [
      {
        method: 'GET',
        path: '/api/v1/admin/drivers/driver-1/verification',
        body: undefined,
      },
      {
        method: 'POST',
        path: '/api/v1/admin/verifications/driver-1/claim',
        body: undefined,
      },
      { method: 'POST', path: '/api/v1/admin/drivers/driver-1/approve', body: undefined },
      {
        method: 'POST',
        path: '/api/v1/admin/drivers/driver-1/verification/release',
        body: undefined,
      },
      {
        method: 'PATCH',
        path: '/api/v1/admin/drivers/driver-1/suspension',
        body: { suspended: true, note: 'Safety investigation' },
      },
    ]
  )
  const rejected = mapBackendUserDetailToDriver({
    ...detail,
    driver_profile: { ...profile, verification_status: 'rejected' },
    driver_documents: [
      {
        ...document,
        status: 'rejected',
        rejection_code: 'blurry_image',
        rejection_note: 'Please upload a clearer image.',
        reviewed_by: staff.id,
        reviewed_at: profile.updated_at,
      },
    ],
  })
  assert.equal(rejected.verificationStatus, 'rejected')
  assert.equal(rejected.documents[0].rejectionReason, 'Please upload a clearer image.')
  assert.equal(rejected.documents[0].reviewedBy, staff.id)
  assert.equal(
    mapBackendUserDetailToDriver({
      ...detail,
      driver_profile: { ...profile, verification_status: 'suspended' },
    }).accountStatus,
    'suspended'
  )
})

test('account status, notes and history use the staff-only step 1 contracts', async () => {
  const { accountService } =
    await import('../src/features/customers/services/account.service.ts')
  handle = (req, json) => {
    assert.equal(req.authorization, 'Bearer access')
    if (req.path.endsWith('/notes') && req.method === 'GET')
      return json(200, { notes: [] })
    if (req.path.endsWith('/history'))
      return json(200, { status_events: [], verification_reviews: [] })
    json(200, detail)
  }
  await accountService.status(
    user.id,
    'suspend',
    'Safety investigation',
    '2026-11-01T00:00:00Z'
  )
  await accountService.status(user.id, 'reactivate', 'Appeal approved')
  await accountService.addNote(user.id, 'Internal staff context')
  await accountService.notes(user.id)
  await accountService.history(user.id)
  await accountService.deleteNote(user.id, 'note-1')
  assert.deepEqual(
    requests.map(({ method, path, body }) => ({ method, path, body })),
    [
      {
        method: 'POST',
        path: '/api/v1/admin/users/driver-1/suspend',
        body: { reason: 'Safety investigation', until: '2026-11-01T00:00:00Z' },
      },
      {
        method: 'POST',
        path: '/api/v1/admin/users/driver-1/reactivate',
        body: { reason: 'Appeal approved', until: null },
      },
      {
        method: 'POST',
        path: '/api/v1/admin/users/driver-1/notes',
        body: { body: 'Internal staff context' },
      },
      { method: 'GET', path: '/api/v1/admin/users/driver-1/notes', body: undefined },
      { method: 'GET', path: '/api/v1/admin/users/driver-1/history', body: undefined },
      {
        method: 'DELETE',
        path: '/api/v1/admin/users/driver-1/notes/note-1',
        body: undefined,
      },
    ]
  )
})

test('customer, dashboard, support lists and stub acknowledgements follow the backend contract', async () => {
  handle = (req, json) => {
    if (req.path.includes('?role=passenger'))
      return json(200, { count: 1, users: [{ ...user, role: 'passenger' }] })
    if (req.path.endsWith('/stats'))
      return json(200, {
        total_drivers: 5,
        total_passengers: 7,
        active_rides: 0,
        open_tickets: 0,
        open_complaints: 0,
      })
    if (req.path.endsWith('/rides')) return json(200, { count: 0, rides: [] })
    if (req.method === 'PATCH')
      return json(200, {
        id: 'record-1',
        status: req.path.includes('/tickets/') ? 'in_progress' : 'resolved',
        message: 'updated',
      })
    if (req.path.endsWith('/tickets')) return json(200, { count: 0, tickets: [] })
    if (req.path.endsWith('/complaints')) return json(200, { count: 0, complaints: [] })
    json(200, detail)
  }
  assert.equal((await customerService.listCustomers())[0].role, 'passenger')
  assert.equal((await customerService.getCustomer(user.id)).user.id, user.id)
  assert.equal((await dashboardService.getStats()).totalPassengers, 7)
  assert.deepEqual((await dashboardService.getRecentRides()).rides, [])
  assert.deepEqual(await supportService.list('tickets'), [])
  assert.deepEqual(await supportService.list('complaints'), [])
  await supportService.update('tickets', 'record-1')
  await supportService.update('complaints', 'record-1')
  assert.ok(
    requests
      .filter((req) => req.method === 'PATCH')
      .every((req) => req.body === undefined)
  )
})

test('2FA, password change, and logout-all endpoints use staff contracts', async () => {
  handle = (req, json) =>
    req.path.endsWith('/setup')
      ? json(200, { secret: 'SECRET', qr_code_url: 'otpauth://totp/test' })
      : json(200, { message: 'success' })
  assert.equal((await authService.setup2FA()).secret, 'SECRET')
  await authService.verify2FA('123456')
  await authService.disable2FA('password123456', '654321')
  await authService.changePassword('old-password', 'new-password123456')
  assert.equal(tokenStorage.getAccessToken(), null)
  tokenStorage.setSession('access', 'refresh')
  await authService.logoutAll()
  assert.equal(tokenStorage.getRefreshToken(), null)
  assert.deepEqual(
    requests.map((req) => req.body),
    [
      undefined,
      { code: '123456' },
      { password: 'password123456', code: '654321' },
      { current_password: 'old-password', new_password: 'new-password123456' },
      undefined,
    ]
  )
})

test('backend permission gates remain visible to the UI without a refresh attempt', async () => {
  handle = (_req, json) => json(403, { error: 'Enable 2FA first', require_2fa: true })
  await assert.rejects(
    staffService.listStaff(),
    (error) => error.require2FA === true && error.status === 403
  )
  assert.equal(requests.length, 1)
})

test('support permissions hide role management and temporary-password users are gated', async () => {
  const React = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { MemoryRouter } = await import('react-router-dom')
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
  const { UserRoleAction } =
    await import('../src/features/customers/components/UserRoleAction.tsx')
  const { AccountSupportPanel } =
    await import('../src/features/customers/components/AccountSupportPanel.tsx')
  const { ProtectedRoute } = await import('../src/components/layout/ProtectedRoute.tsx')
  const { useAuthStore } = await import('../src/stores/useAuthStore.ts')
  useAuthStore.getState().setUser({
    id: 'support',
    role: 'support',
    fullName: 'Support',
    email: 'support@example.test',
    isActive: true,
    createdAt: '',
  })
  const render = (child) =>
    renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        {},
        React.createElement(QueryClientProvider, { client: new QueryClient() }, child)
      )
    )
  assert.equal(
    render(
      React.createElement(UserRoleAction, {
        id: user.id,
        name: user.name,
        role: 'driver',
      })
    ),
    ''
  )
  const accountCache = new QueryClient()
  accountCache.setQueryData(['user', user.id], {
    ...detail,
    user: {
      ...user,
      status: 'active',
      phone: '+255712345678',
      phone_verified_at: '2026-10-12T00:00:00Z',
    },
  })
  accountCache.setQueryData(
    ['user-notes', user.id],
    [
      {
        id: 'note-1',
        author_name: 'Support',
        body: 'Staff context',
        created_at: '2026-10-12T00:00:00Z',
      },
    ]
  )
  accountCache.setQueryData(['user-history', user.id], {
    status_events: [],
    verification_reviews: [],
  })
  const supportPanel = renderToStaticMarkup(
    React.createElement(
      QueryClientProvider,
      { client: accountCache },
      React.createElement(AccountSupportPanel, { id: user.id })
    )
  )
  assert.ok(supportPanel.includes('OTP verified'))
  assert.ok(supportPanel.includes('Staff context'))
  assert.ok(!supportPanel.includes('Permanent ban'))
  assert.ok(!supportPanel.includes('Delete note'))
  useAuthStore.getState().setUser({
    id: staff.id,
    role: 'admin',
    fullName: staff.name,
    email: staff.email,
    isActive: true,
    createdAt: '',
    mustChangePassword: true,
  })
  assert.ok(
    !render(React.createElement(ProtectedRoute, {}, 'Protected admin content')).includes(
      'Protected admin content'
    )
  )
})

test('dates render in Tanzania time regardless of browser timezone', async () => {
  const { formatDateTime } = await import('../src/lib/utils/formatters.ts')
  assert.equal(
    formatDateTime('2026-10-12T22:30:00Z', 'yyyy-MM-dd HH:mm'),
    '2026-10-13 01:30'
  )
})

const promoFixture = {
  id: 'promo-1',
  code: 'WELCOME20',
  title: 'Welcome aboard',
  description: 'Your first ride',
  discount_type: 'percent',
  discount_value: 20,
  max_discount: 5000,
  min_fare: 1000,
  audience: 'all',
  first_ride_only: true,
  starts_at: '2026-10-01T00:00:00Z',
  expires_at: '2026-12-31T23:59:00Z',
  max_redemptions: 100,
  max_per_user: 1,
  redeemed_count: 2,
  total_discount_given: 2000,
  audience_count: 12,
  status: 'active',
  effective_status: 'active',
  created_at: '2026-10-01T00:00:00Z',
}
const referralSettings = {
  enabled: true,
  referee_reward_type: 'fixed',
  referee_reward_value: 1000,
  referrer_reward_type: 'percent',
  referrer_reward_value: 20,
  qualifying_min_fare: 3000,
  max_rewards_per_referrer: 10,
  reward_valid_days: 30,
}

test('promotions use every staff contract with filters, pagination and exact audience payloads', async () => {
  const { promoService } = await import('../src/features/promotions/promo.service.ts')
  handle = (_req, json) => json(200, { ...promoFixture, user, notified_count: 1 })
  await promoService.list({
    status: 'scheduled',
    audience: 'selected',
    q: 'welcome',
    limit: 20,
    offset: 40,
  })
  await promoService.detail('promo-1')
  await promoService.create({ code: 'NEW20', audience_user_ids: ['passenger-1'] })
  await promoService.update('promo-1', { title: 'Updated title' })
  for (const action of ['pause', 'resume', 'archive'])
    await promoService.action('promo-1', action)
  await promoService.audience('promo-1', 'Jane', 20, 20)
  const audience = {
    user_ids: ['passenger-1'],
    phones: ['+255712345678'],
    emails: ['jane@example.test'],
  }
  await promoService.addAudience('promo-1', audience)
  await promoService.removeAudience('promo-1', 'passenger-1')
  assert.equal((await promoService.share('promo-1')).notified_count, 1)
  await promoService.redemptions('promo-1', 20, 40)
  await promoService.passengers('Jane', 20, 20)
  await promoService.user('passenger-1')
  await promoService.userPromos('passenger-1')
  await promoService.settings()
  await promoService.saveSettings(referralSettings)
  await promoService.referrals('rewarded', 20, 20)
  assert.deepEqual(
    requests.map((r) => `${r.method} ${r.path}`),
    [
      'GET /api/v1/admin/promos?status=scheduled&audience=selected&q=welcome&limit=20&offset=40',
      'GET /api/v1/admin/promos/promo-1',
      'POST /api/v1/admin/promos',
      'PATCH /api/v1/admin/promos/promo-1',
      'POST /api/v1/admin/promos/promo-1/pause',
      'POST /api/v1/admin/promos/promo-1/resume',
      'POST /api/v1/admin/promos/promo-1/archive',
      'GET /api/v1/admin/promos/promo-1/audience?q=Jane&limit=20&offset=20',
      'POST /api/v1/admin/promos/promo-1/audience',
      'DELETE /api/v1/admin/promos/promo-1/audience/passenger-1',
      'POST /api/v1/admin/promos/promo-1/share',
      'GET /api/v1/admin/promos/promo-1/redemptions?limit=20&offset=40',
      'GET /api/v1/admin/users?role=passenger&q=Jane&limit=20&offset=20',
      'GET /api/v1/admin/users/passenger-1',
      'GET /api/v1/admin/users/passenger-1/promos',
      'GET /api/v1/admin/referral-settings',
      'PUT /api/v1/admin/referral-settings',
      'GET /api/v1/admin/referrals?status=rewarded&limit=20&offset=20',
    ]
  )
  assert.deepEqual(requests[8].body, audience)
  assert.deepEqual(requests[16].body, referralSettings)
  assert.ok(requests.every((r) => r.authorization === 'Bearer access'))
})

test('promo queries reuse the shared refresh flow when the 15 minute staff token expires', async () => {
  const { promoService } = await import('../src/features/promotions/promo.service.ts')
  let refreshes = 0
  handle = async (req, json) => {
    if (req.path === '/api/v1/staff/auth/refresh') {
      refreshes++
      await delay(20)
      json(200, {
        access_token: 'promo-fresh',
        refresh_token: 'promo-refresh',
        user: staff,
      })
    } else if (req.authorization !== 'Bearer promo-fresh')
      json(401, { error: 'Token expired' })
    else json(200, { ...promoFixture, promos: [promoFixture], total: 1 })
  }
  await Promise.all([
    promoService.list(),
    promoService.detail('promo-1'),
    promoService.settings(),
  ])
  assert.equal(refreshes, 1)
  assert.equal(requests.filter((r) => r.authorization === 'Bearer promo-fresh').length, 3)
})

test('backend field errors and duplicate code conflicts survive normalization', async () => {
  const { promoService } = await import('../src/features/promotions/promo.service.ts')
  handle = (_req, json) =>
    json(400, {
      error: 'Invalid expiry',
      fields: { expires_at: 'Expiry must be after start' },
    })
  await assert.rejects(
    promoService.update('promo-1', {}),
    (e) =>
      e.status === 400 &&
      e.validationErrors.expires_at[0] === 'Expiry must be after start'
  )
  handle = (_req, json) =>
    json(409, { error: 'code already exists', fields: { code: 'code already exists' } })
  await assert.rejects(
    promoService.create({ code: 'WELCOME20' }),
    (e) => e.status === 409 && e.validationErrors.code[0] === 'code already exists'
  )
})

test('promotion form validation, field locking, CSV parsing and Tanzania input dates', async () => {
  const {
    validatePromo,
    validateSettings,
    parseAudienceText,
    lockedPromoPatch,
    money,
    localDateInput,
    dateInputISO,
    discountLabel,
    generatePromoCode,
  } = await import('../src/features/promotions/utils.ts')
  assert.deepEqual(validatePromo(promoFixture), {})
  for (const [field, value] of [
    ['code', 'bad!'],
    ['title', ''],
    ['discount_value', 101],
    ['max_discount', 0],
    ['min_fare', -1],
    ['max_per_user', 0],
    ['max_redemptions', 0],
    ['expires_at', promoFixture.starts_at],
  ]) {
    assert.ok(validatePromo({ ...promoFixture, [field]: value })[field], field)
  }
  assert.ok(
    validatePromo({
      ...promoFixture,
      discount_type: 'fixed',
      discount_value: 1.5,
      max_discount: null,
    }).discount_value
  )
  assert.ok(
    validatePromo({ ...promoFixture, discount_value: Number.MAX_SAFE_INTEGER + 1 })
      .discount_value
  )
  assert.deepEqual(validateSettings(referralSettings), {})
  assert.ok(
    validateSettings({ ...referralSettings, referrer_reward_value: 101 })
      .referrer_reward_value
  )
  assert.ok(
    validateSettings({ ...referralSettings, reward_valid_days: 3651 }).reward_valid_days
  )
  const patch = lockedPromoPatch(promoFixture, promoFixture)
  for (const field of [
    'code',
    'discount_type',
    'discount_value',
    'max_discount',
    'audience',
    'id',
    'status',
    'redeemed_count',
    'effective_status',
    'created_at',
  ])
    assert.ok(!(field in patch), field)
  assert.equal(patch.title, promoFixture.title)
  assert.equal(
    lockedPromoPatch(promoFixture, { ...promoFixture, redeemed_count: 0 }).code,
    'WELCOME20'
  )
  assert.deepEqual(
    parseAudienceText(
      'phone,email\n"+255 712 345678",Jane@Example.test\n+255712345678;jane@example.test'
    ),
    { user_ids: [], phones: ['+255712345678'], emails: ['jane@example.test'] }
  )
  assert.equal(money(5000), 'TSh 5,000')
  assert.equal(discountLabel(promoFixture), '20% off, up to TSh 5,000')
  assert.equal(
    discountLabel({ ...promoFixture, discount_type: 'fixed', discount_value: 3000 }),
    'TSh 3,000 off'
  )
  assert.equal(localDateInput('2026-10-12T22:30:00Z'), '2026-10-13T01:30')
  assert.equal(dateInputISO('2026-10-13T01:30'), '2026-10-12T22:30:00.000Z')
  assert.match(generatePromoCode(), /^[A-Z0-9-]{4,20}$/)
})

test('promotion summary follows all pages and sums applied discount detail totals', async () => {
  const { promoService } = await import('../src/features/promotions/promo.service.ts')
  let active = 0,
    maxActive = 0
  handle = async (req, json) => {
    const url = new URL(req.path, 'http://test')
    if (url.pathname === '/api/v1/admin/promos') {
      const offset = Number(url.searchParams.get('offset'))
      const promos = Array.from({ length: offset === 0 ? 100 : 1 }, (_, i) => ({
        ...promoFixture,
        id: `promo-${offset + i}`,
        effective_status: offset === 0 ? 'active' : 'expired',
      }))
      json(200, { promos, total: 101, limit: 100, offset })
    } else {
      active++
      maxActive = Math.max(active, maxActive)
      await delay(1)
      active--
      json(200, { ...promoFixture, total_discount_given: 10 })
    }
  }
  assert.deepEqual(await promoService.summary(), {
    active: 100,
    scheduled: 0,
    expired: 1,
    discount: 1010,
  })
  assert.ok(maxActive <= 6)
  assert.equal(requests.filter((r) => r.path.includes('limit=100')).length, 2)
})

test('403 switches promotions to read-only and support sees no promo write controls', async () => {
  const React = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { MemoryRouter } = await import('react-router-dom')
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
  const { useAuthStore } = await import('../src/stores/useAuthStore.ts')
  const { usePromotionAccess, canWritePromotions } =
    await import('../src/features/promotions/access.ts')
  const { promoService } = await import('../src/features/promotions/promo.service.ts')
  const { PromoActions } =
    await import('../src/features/promotions/components/PromoActions.tsx')
  const { ReadOnlyNotice } =
    await import('../src/features/promotions/components/shared.tsx')
  const { default: PromotionsPage } =
    await import('../src/features/promotions/pages/PromotionsPage.tsx')
  const { PassengerPromos } =
    await import('../src/features/promotions/components/PassengerPromos.tsx')
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const render = (child) => {
    // Server rendering reads Zustand's initial snapshot; point it at the test's
    // current session to exercise the same role gates as a hydrated browser.
    const authInitial = useAuthStore.getInitialState(),
      accessInitial = usePromotionAccess.getInitialState()
    const authSnapshot = { ...authInitial },
      accessSnapshot = { ...accessInitial }
    Object.assign(authInitial, useAuthStore.getState())
    Object.assign(accessInitial, usePromotionAccess.getState())
    try {
      return renderToStaticMarkup(
        React.createElement(
          MemoryRouter,
          {},
          React.createElement(QueryClientProvider, { client: cache }, child)
        )
      )
    } finally {
      Object.assign(authInitial, authSnapshot)
      Object.assign(accessInitial, accessSnapshot)
    }
  }
  usePromotionAccess.setState({ deniedFor: null })
  const setRole = (role) =>
    useAuthStore.getState().setUser({
      id: 'promo-staff',
      role,
      fullName: 'Promo staff',
      email: 'promo@example.test',
      isActive: true,
      createdAt: '',
    })
  setRole('admin')
  assert.ok(
    render(React.createElement(PromoActions, { promo: promoFixture })).includes('Archive')
  )
  handle = (_req, json) => json(403, { error: 'Admin permission required' })
  await assert.rejects(promoService.share('promo-1'))
  assert.equal(usePromotionAccess.getState().deniedFor, 'promo-staff')
  assert.equal(canWritePromotions('admin', true), false)
  assert.equal(render(React.createElement(PromoActions, { promo: promoFixture })), '')
  assert.ok(render(React.createElement(ReadOnlyNotice)).includes('Read-only access'))
  setRole('support')
  usePromotionAccess.setState({ deniedFor: null })
  cache.setQueryData(
    ['promotions', 'list', { q: '', status: '', audience: '', offset: 0 }],
    { promos: [promoFixture], total: 1, limit: 20, offset: 0 }
  )
  cache.setQueryData(['promotions', 'summary'], {
    active: 1,
    scheduled: 0,
    expired: 0,
    discount: 2000,
  })
  const page = render(React.createElement(PromotionsPage))
  assert.ok(page.includes('WELCOME20'))
  assert.ok(!page.includes('Create promo'))
  assert.ok(page.includes('Read-only access'))
  cache.setQueryData(['promotions', 'user', 'passenger-1'], {
    granted: [promoFixture],
    redemptions: [],
  })
  const passenger = render(React.createElement(PassengerPromos, { id: 'passenger-1' }))
  assert.ok(passenger.includes('Granted promos'))
  assert.ok(passenger.includes('WELCOME20'))
  cache.clear()
})

test('promo edit locks used financial fields and referral settings are read-only for support', async () => {
  const React = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { createMemoryRouter, RouterProvider } = await import('react-router-dom')
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
  const { useAuthStore } = await import('../src/stores/useAuthStore.ts')
  const { usePromotionAccess } = await import('../src/features/promotions/access.ts')
  const { default: PromoEditorPage } =
    await import('../src/features/promotions/pages/PromoEditorPage.tsx')
  const { ReferralSettingsForm } =
    await import('../src/features/promotions/pages/ReferralsPage.tsx')
  const cache = new QueryClient()
  const render = (child, path = '/') => {
    const router = createMemoryRouter(
      [{ path: path === '/' ? '/' : '/promotions/:id/edit', element: child }],
      { initialEntries: [path] }
    )
    const authInitial = useAuthStore.getInitialState(),
      accessInitial = usePromotionAccess.getInitialState()
    const authSnapshot = { ...authInitial },
      accessSnapshot = { ...accessInitial }
    Object.assign(authInitial, useAuthStore.getState())
    Object.assign(accessInitial, usePromotionAccess.getState())
    try {
      return renderToStaticMarkup(
        React.createElement(
          QueryClientProvider,
          { client: cache },
          React.createElement(RouterProvider, { router })
        )
      )
    } finally {
      router.dispose()
      Object.assign(authInitial, authSnapshot)
      Object.assign(accessInitial, accessSnapshot)
    }
  }
  usePromotionAccess.setState({ deniedFor: null })
  useAuthStore.getState().setUser({
    id: 'editor-admin',
    role: 'admin',
    fullName: 'Admin',
    email: 'admin@example.test',
    isActive: true,
    createdAt: '',
  })
  cache.setQueryData(['promotions', 'detail', 'promo-1'], promoFixture)
  const editor = render(React.createElement(PromoEditorPage), '/promotions/promo-1/edit')
  assert.match(editor, /<input[^>]*id="promo-code"[^>]*disabled/)
  assert.match(editor, /<input[^>]*id="promo-discount_value"[^>]*disabled/)
  assert.ok(editor.includes('locked because this promo has already been used'))
  assert.ok(editor.includes('Save changes'))
  useAuthStore.getState().setUser({
    id: 'editor-support',
    role: 'support',
    fullName: 'Support',
    email: 'support@example.test',
    isActive: true,
    createdAt: '',
  })
  const settings = render(
    React.createElement(ReferralSettingsForm, { initial: referralSettings })
  )
  assert.ok(settings.includes('Reward for invited passenger'))
  assert.ok(!settings.includes('Save changes'))
  assert.match(settings, /<input[^>]*role="switch"[^>]*disabled/)
  cache.clear()
})

test('report operations use staff contracts, respect 403 and mask phone labels', async () => {
  const { operationsApi, useOperationsAccess } =
    await import('../src/features/operations/api.ts')
  const { maskPhone } = await import('../src/features/operations/shared.tsx')
  handle = (req, json) =>
    json(
      200,
      req.path.includes('/reports/')
        ? { id: 'report', action: 'note' }
        : { reports: [], total: 0, limit: 20, offset: 0 }
    )
  await operationsApi.reports({ status: 'open', category: 'fraud', offset: 20 })
  await operationsApi.reportAction('report', 'resolve', {
    outcome: 'suspended',
    note: 'Review completed',
    until: '2026-10-15T09:00:00Z',
  })
  assert.ok(requests.some((r) => r.path.includes('/admin/reports?status=open')))
  assert.deepEqual(requests.at(-1).body, {
    outcome: 'suspended',
    note: 'Review completed',
    until: '2026-10-15T09:00:00Z',
  })
  assert.equal(maskPhone('+255712345123'), '+2557** *** 123')
  handle = (_req, json) => json(403, { error: 'Read only' })
  await assert.rejects(operationsApi.reportAction('report', 'note', { note: 'Note' }))
  assert.equal(
    useOperationsAccess.getState().deniedFor,
    (await import('../src/stores/useAuthStore.ts')).useAuthStore.getState().user?.id ||
      null
  )
})

test('safety, finance and fraud API clients send staff contracts and stable idempotency headers', async () => {
  const { safetyApi } = await import('../src/features/operations/safety.api.ts')
  const { financeApi, moneyHeaders } =
    await import('../src/features/operations/finance.api.ts')
  const { fraudApi, canResolveFraud, canEditFraudRules } =
    await import('../src/features/operations/fraud.api.ts')
  handle = (req, json) =>
    json(
      200,
      req.path.includes('/fraud/rules')
        ? { rules: [], total: 0, limit: 100, offset: 0 }
        : {
            alerts: [],
            payouts: [],
            payments: [],
            flags: [],
            holds: [],
            total: 0,
            limit: 20,
            offset: 0,
          }
    )
  await safetyApi.alerts({ status: 'open', offset: 20, from: '2026-10-11T21:00:00.000Z' })
  await safetyApi.action('sos-id', 'acknowledge', {})
  await financeApi.payments({
    min_amount: '1000',
    max_amount: '8000',
    ride: 'ride-id',
    offset: 20,
  })
  await financeApi.adjust('driver-id', 500, 'Correction', 'finance-key-001')
  await fraudApi.flags({ severity: 'high', hold: 'active', offset: 40 })
  await fraudApi.action('flag-id', 'resolve', { status: 'dismissed', note: 'Reviewed' })
  await fraudApi.update([
    {
      key: 'shared_device',
      enabled: true,
      params: '{"max_accounts":3,"window_days":30}',
      severity: 'medium',
      auto_mitigation: '',
    },
  ])
  assert.ok(requests.some((r) => r.path.includes('/admin/sos?status=open')))
  assert.ok(requests.some((r) => r.path.includes('/admin/sos/sos-id/acknowledge')))
  assert.ok(requests.some((r) => r.path.includes('min_amount=1000')))
  assert.equal(
    requests.find((r) => r.path.includes('/wallets/driver-id/adjust')).authorization,
    'Bearer access'
  )
  assert.equal(
    requests.find((r) => r.path.includes('/wallets/driver-id/adjust')).body.reason,
    'Correction'
  )
  assert.ok(requests.some((r) => r.path.includes('/admin/fraud/flags?severity=high')))
  assert.equal(canResolveFraud('support', 'low', 'dismissed'), true)
  assert.equal(canResolveFraud('support', 'high', 'dismissed'), false)
  assert.equal(canResolveFraud('support', 'low', 'confirmed'), false)
  assert.equal(canResolveFraud('admin', 'high', 'confirmed'), true)
  assert.equal(canEditFraudRules('support', true), false)
  assert.equal(canEditFraudRules('admin', false), false)
  assert.equal(canEditFraudRules('admin', true), true)
  assert.equal(moneyHeaders('stable-key').headers['Idempotency-Key'], 'stable-key')
})

test('support lands on safety and login preserves report filters and password gates', async () => {
  const { staffLandingPath } = await import('../src/features/auth/landing.ts')
  assert.equal(staffLandingPath({ role: 'support' }), '/safety')
  assert.equal(staffLandingPath({ role: 'support' }, { pathname: '/' }), '/safety')
  assert.equal(staffLandingPath({ role: 'admin' }), '/dashboard')
  assert.equal(
    staffLandingPath(
      { role: 'support' },
      {
        pathname: '/reports',
        search: '?user=flagged-user',
        hash: '#notes',
      }
    ),
    '/reports?user=flagged-user#notes'
  )
  assert.equal(
    staffLandingPath(
      { role: 'support', mustChangePassword: true },
      {
        pathname: '/reports',
      }
    ),
    '/change-password'
  )
})

test('reports opened from a flagged account send the user filter to the API', async () => {
  const React = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { MemoryRouter } = await import('react-router-dom')
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
  const { ReportsPage } = await import('../src/features/operations/ReportsPage.tsx')
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  handle = (_req, json) => json(200, { reports: [], total: 0, limit: 20, offset: 0 })
  try {
    renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/reports?user=flagged-user'] },
        React.createElement(
          QueryClientProvider,
          { client },
          React.createElement(ReportsPage)
        )
      )
    )
    const query = client
      .getQueryCache()
      .find({ queryKey: ['operations', 'reports'], exact: false })
    assert.ok(query)
    await query.fetch()
    const url = new URL(requests.at(-1).path, 'http://test.invalid')
    assert.equal(url.searchParams.get('user'), 'flagged-user')
  } finally {
    client.clear()
  }
})

test('SOS console exposes pagination when more than 100 alerts are open', async () => {
  const React = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { MemoryRouter } = await import('react-router-dom')
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
  const { SafetyPage } = await import('../src/features/operations/SafetyPage.tsx')
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  const data = { alerts: [], total: 101, limit: 100, offset: 0, sla_seconds: 60 }
  client.setQueryData(['operations', 'sos', 'open', 0], data)
  try {
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        {},
        React.createElement(
          QueryClientProvider,
          { client },
          React.createElement(SafetyPage)
        )
      )
    )
    assert.match(html, /aria-label="Pagination"/)
    assert.match(html, />Next<\/button>/)
    const next = html.match(/<button[^>]*>Next<\/button>/)?.[0]
    assert.ok(next)
    assert.ok(!/\sdisabled(?:=|\s|>)/.test(next))
  } finally {
    client.clear()
  }
})

test('support fraud rules stay read-only while the admin can edit them', async () => {
  const React = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { createMemoryRouter, RouterProvider } = await import('react-router-dom')
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query')
  const { useAuthStore } = await import('../src/stores/useAuthStore.ts')
  const { useOperationsAccess } = await import('../src/features/operations/api.ts')
  const { FraudRulesPage } = await import('../src/features/operations/FraudPage.tsx')
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  client.setQueryData(['operations', 'fraud-rules'], {
    rules: [
      {
        rule: {
          key: 'shared_device',
          enabled: true,
          params: '{"max_accounts":3,"window_days":30}',
          severity: 'medium',
          auto_mitigation: '',
        },
        effective_enabled: true,
        disabled_reason: '',
      },
    ],
    total: 1,
    limit: 100,
    offset: 0,
  })
  const authState = useAuthStore.getState(),
    accessState = useOperationsAccess.getState()
  const restore = { ...authState },
    restoreAccess = { ...accessState }
  const render = () => {
    const router = createMemoryRouter(
      [{ path: '/fraud/rules', element: React.createElement(FraudRulesPage) }],
      { initialEntries: ['/fraud/rules'] }
    )
    try {
      return renderToStaticMarkup(
        React.createElement(
          QueryClientProvider,
          { client },
          React.createElement(RouterProvider, { router })
        )
      )
    } finally {
      router.dispose()
    }
  }
  try {
    useOperationsAccess.setState({ deniedFor: null })
    useAuthStore.getState().setUser({
      id: 'support-fraud',
      role: 'support',
      fullName: 'Support',
      email: 'support@example.test',
      isActive: true,
      createdAt: '',
    })
    const support = render()
    assert.match(support, /<input[^>]*type="checkbox"[^>]*disabled/)
    assert.ok(!support.includes('Save rule'))
    assert.ok(!support.includes('Dry run (30 days)'))
    useAuthStore.getState().setUser({
      id: 'admin-fraud',
      role: 'admin',
      fullName: 'Admin',
      email: 'admin@example.test',
      isActive: true,
      createdAt: '',
    })
    const admin = render()
    assert.ok(!admin.includes('Save rule'))
  } finally {
    Object.assign(authState, restore)
    Object.assign(accessState, restoreAccess)
    client.clear()
  }
})
