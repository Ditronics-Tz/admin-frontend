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

/**
 * Authentication Service Interface
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>
  logout(): Promise<void>
  getCurrentUser(): Promise<AdminUser>
  refreshSession(): Promise<AuthSession>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  logoutAll(): Promise<void>
  setup2FA(): Promise<{ secret: string; qr_code_url: string }>
  verify2FA(code: string): Promise<void>
  disable2FA(password: string, code: string): Promise<void>
}

/**
 * Concrete Authentication Service connecting to Go Fiber Staff Realm APIs.
 */
export const authService: IAuthService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const payload = {
      email: credentials.email.trim(),
      password: credentials.password,
      totp_code: credentials.totpCode?.trim() || '',
    }

    const response = await apiClient.post<BackendStaffLoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    )

    const data = response.data

    // Persist tokens
    tokenStorage.setSession(data.access_token, data.refresh_token, true)
    useApiAccess.setState({ readOnly: false })

    const mappedUser = mapBackendStaffUser(data.user)

    return {
      user: mappedUser,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      mustChangePassword: data.must_change_password,
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
  async setup2FA() {
    const { data } = await apiClient.post<{ secret: string; qr_code_url: string }>(
      API_ENDPOINTS.AUTH.SETUP_2FA
    )
    return data
  },
  async verify2FA(code) {
    await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_2FA, { code })
  },
  async disable2FA(password, code) {
    await apiClient.post(API_ENDPOINTS.AUTH.DISABLE_2FA, { password, code })
  },
}
