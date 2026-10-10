import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { AdminUser, AuthSession, LoginCredentials } from '@/types/auth'

/**
 * Authentication Service Interface
 * Defines the contract for administrator session management.
 * Implementation relies on secure HttpOnly cookies rather than localStorage tokens.
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>
  logout(): Promise<void>
  getCurrentUser(): Promise<AdminUser>
  refreshSession(): Promise<AuthSession>
}

/**
 * Concrete Authentication Service (Contract Stubs for Backend Integration in Phase 2)
 */
export const authService: IAuthService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await apiClient.post<AuthSession>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  async getCurrentUser(): Promise<AdminUser> {
    const response = await apiClient.get<AdminUser>(API_ENDPOINTS.AUTH.ME)
    return response.data
  },

  async refreshSession(): Promise<AuthSession> {
    const response = await apiClient.post<AuthSession>(API_ENDPOINTS.AUTH.REFRESH)
    return response.data
  },
}
