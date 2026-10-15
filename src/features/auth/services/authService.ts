import { apiClient, tokenStorage, refreshStaffSession } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { BackendStaffLoginResponse, BackendStaffUser } from '@/lib/api/types'
import type { AdminUser, AuthSession, LoginCredentials } from '@/types/auth'
import { useApiAccess } from '@/lib/api/access'

/**
 * Adapter: Transforms backend StaffUserResponse into frontend AdminUser model.
 */
export function mapBackendStaffUser(staff: BackendStaffUser): AdminUser {
  return {
    id: staff.id,
    email: staff.email,
    fullName: staff.name,
    role: staff.role,
    isActive: staff.is_active,
    mustChangePassword: staff.must_change_password,
    totpEnabled: staff.totp_enabled,
    lastLoginAt: staff.last_login_at,
    createdAt: staff.created_at,
    updatedAt: staff.updated_at,
  }
}

export interface PendingAuthenticator {
  secret: string
  qr_code_url: string
  pending_expires_at: string
}

interface StaffSecurityResponse {
  message: string
  totp_enabled: boolean
  access_token: string
  user: BackendStaffUser
}

function applySecurityResponse(data: StaffSecurityResponse): AdminUser {
  if (!data.access_token || !data.user?.id || typeof data.totp_enabled !== 'boolean') {
    throw new Error('The server did not return the updated staff session. Sign in again.')
  }
  tokenStorage.replaceAccessToken(data.access_token, data.user)
  return mapBackendStaffUser(data.user)
}

/**
 * Authentication Service Interface
 */
export type StaffLoginResult =
  | { kind: 'session'; session: AuthSession }
  | {
      kind: 'mfa'
      challengeToken: string
      expiresIn: number
      enrollmentRequired: boolean
    }

export interface MfaEnrollmentMaterial {
  secret: string
  qr_code_url: string
  pending_expires_at: string
}

export interface MfaStatus {
  mfa_required: boolean
  totp_enabled: boolean
  enrollment_required: boolean
  recovery_codes_remaining: number
  totp_verified_at?: string | null
}

export interface MfaActivityEvent {
  action: string
  ip?: string
  created_at: string
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<StaffLoginResult>
  logout(): Promise<void>
  getCurrentUser(): Promise<AdminUser>
  refreshSession(): Promise<AuthSession>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  logoutAll(): Promise<void>
  setup2FA(password: string, code?: string): Promise<PendingAuthenticator>
  verify2FA(code: string): Promise<AdminUser>
  disable2FA(password: string, code: string): Promise<AdminUser>
  verifyMfa(challengeToken: string, code: string): Promise<AuthSession>
  verifyRecoveryCode(challengeToken: string, recoveryCode: string): Promise<AuthSession>
  beginEnrollment(challengeToken: string): Promise<MfaEnrollmentMaterial>
  confirmEnrollment(challengeToken: string, code: string): Promise<AuthSession & { recoveryCodes: string[] }>
  mfaStatus(): Promise<MfaStatus>
  mfaActivity(): Promise<MfaActivityEvent[]>
  regenerateRecoveryCodes(code: string): Promise<string[]>
}

/**
 * Concrete Authentication Service connecting to Go Fiber Staff Realm APIs.
 */
export const authService: IAuthService = {
  async login(credentials: LoginCredentials): Promise<StaffLoginResult> {
    const response = await apiClient.post<BackendStaffLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email.trim(),
      password: credentials.password,
    })
    const data = response.data
    if (data.mfa_required) {
      if (!data.challenge_token || !data.challenge_expires_in) {
        throw new Error('The sign-in challenge is unavailable. Try again.')
      }
      return {
        kind: 'mfa',
        challengeToken: data.challenge_token,
        expiresIn: data.challenge_expires_in,
        enrollmentRequired: data.enrollment_required === true,
      }
    }
    if (!data.access_token || !data.refresh_token || !data.user) {
      throw new Error('The server did not return a staff session.')
    }
    tokenStorage.setSession(data.access_token, data.refresh_token, true)
    useApiAccess.setState({ readOnly: false })
    return {
      kind: 'session',
      session: {
        user: mapBackendStaffUser(data.user),
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        mustChangePassword: data.must_change_password,
      },
    }
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken()
    try {
      if (refreshToken) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
          refresh_token: refreshToken,
        })
      }
    } catch {
      // Ignore network errors on logout to guarantee local cleanup
    } finally {
      tokenStorage.clearTokens()
    }
  },

  async getCurrentUser(): Promise<AdminUser> {
    const response = await apiClient.get<{ user: BackendStaffUser }>(
      API_ENDPOINTS.AUTH.ME
    )
    return mapBackendStaffUser(response.data.user)
  },

  async refreshSession(): Promise<AuthSession> {
    const data = await refreshStaffSession()

    const mappedUser = mapBackendStaffUser(data.user)
    return {
      user: mappedUser,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    })
    tokenStorage.clearTokens()
  },
  async logoutAll() {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT_ALL)
    tokenStorage.clearTokens()
  },
  async setup2FA(password, code = '') {
    const { data } = await apiClient.post<PendingAuthenticator>(
      API_ENDPOINTS.AUTH.SETUP_2FA,
      { password, code: code.trim() }
    )
    if (
      !data.secret ||
      !data.qr_code_url ||
      !Number.isFinite(Date.parse(data.pending_expires_at))
    ) {
      throw new Error('Authenticator setup is unavailable on this server.')
    }
    return data
  },
  async verify2FA(code) {
    const { data } = await apiClient.post<StaffSecurityResponse>(
      API_ENDPOINTS.AUTH.VERIFY_2FA,
      { code: code.trim() }
    )
    return applySecurityResponse(data)
  },
  async disable2FA(password, code) {
    const { data } = await apiClient.post<StaffSecurityResponse>(
      API_ENDPOINTS.AUTH.DISABLE_2FA,
      { password, code: code.trim() }
    )
    return applySecurityResponse(data)
  },
  async verifyMfa(challengeToken, code) {
    const { data } = await apiClient.post<BackendStaffLoginResponse>(API_ENDPOINTS.AUTH.MFA_VERIFY, {
      challenge_token: challengeToken,
      code: code.trim(),
    })
    return persistStaffSession(data)
  },
  async verifyRecoveryCode(challengeToken, recoveryCode) {
    const { data } = await apiClient.post<BackendStaffLoginResponse>(
      API_ENDPOINTS.AUTH.MFA_RECOVERY_VERIFY,
      { challenge_token: challengeToken, recovery_code: recoveryCode.trim() }
    )
    return persistStaffSession(data)
  },
  async beginEnrollment(challengeToken) {
    const { data } = await apiClient.post<MfaEnrollmentMaterial>(API_ENDPOINTS.AUTH.MFA_ENROLL, {
      challenge_token: challengeToken,
    })
    if (!data.secret || !data.qr_code_url || !Number.isFinite(Date.parse(data.pending_expires_at))) {
      throw new Error('Authenticator setup is unavailable on this server.')
    }
    return data
  },
  async confirmEnrollment(challengeToken, code) {
    const { data } = await apiClient.post<BackendStaffLoginResponse>(
      API_ENDPOINTS.AUTH.MFA_ENROLL_CONFIRM,
      { challenge_token: challengeToken, code: code.trim() }
    )
    if (!data.access_token || !data.refresh_token || !data.user) {
      throw new Error('The server did not return a staff session.')
    }
    return {
      user: mapBackendStaffUser(data.user),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      mustChangePassword: data.must_change_password,
      recoveryCodes: data.recovery_codes ?? [],
    }
  },
  async mfaStatus() {
    const { data } = await apiClient.get<MfaStatus>(API_ENDPOINTS.AUTH.MFA_STATUS)
    return data
  },
  async mfaActivity() {
    const { data } = await apiClient.get<{ events: MfaActivityEvent[] }>(API_ENDPOINTS.AUTH.MFA_ACTIVITY)
    return data.events ?? []
  },
  async regenerateRecoveryCodes(code) {
    const { data } = await apiClient.post<{ recovery_codes: string[] }>(
      API_ENDPOINTS.AUTH.MFA_RECOVERY_REGENERATE,
      { code: code.trim() }
    )
    if (!data.recovery_codes?.length) {
      throw new Error('Recovery codes were not returned.')
    }
    return data.recovery_codes
  },
}

function persistStaffSession(data: BackendStaffLoginResponse): AuthSession {
  if (!data.access_token || !data.refresh_token || !data.user) {
    throw new Error('The server did not return a staff session.')
  }
  tokenStorage.setSession(data.access_token, data.refresh_token, true)
  useApiAccess.setState({ readOnly: false })
  return {
    user: mapBackendStaffUser(data.user),
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    mustChangePassword: data.must_change_password,
  }
}
