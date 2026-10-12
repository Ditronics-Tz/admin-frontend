/**
 * Administrator Role Definitions
 * Aligned with Backend StaffRealm roles: 'admin' and 'support'
 */
export type AdminRole = 'admin' | 'support'

/**
 * Administrator User Entity (mapped from BackendStaffUser)
 */
export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: AdminRole
  phone?: string
  avatarUrl?: string
  isActive: boolean
  mustChangePassword?: boolean
  totpEnabled?: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt?: string
}

/**
 * Credentials required for administrator login
 */
export interface LoginCredentials {
  email: string
  password: string
  totpCode?: string
  rememberMe?: boolean
}

/**
 * Authentication Session metadata
 */
export interface AuthSession {
  user: AdminUser
  accessToken?: string
  refreshToken?: string
  mustChangePassword?: boolean
  expiresAt?: string
}

/**
 * Internal Authentication lifecycle status
 */
export type AuthStatus =
  'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

/**
 * Zustand Auth Store State contract
 */
export interface AuthState {
  user: AdminUser | null
  status: AuthStatus
  isAuthenticated: boolean
  isInitialized: boolean
  error: string | null
  setUser: (user: AdminUser | null) => void
  setStatus: (status: AuthStatus) => void
  setError: (error: string | null) => void
  logout: () => void
  resetAuth: () => void
}
