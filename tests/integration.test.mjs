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
