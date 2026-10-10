/**
 * Administrator Role Definitions
 */
export type AdminRole =
  | 'super_admin'
  | 'operations_admin'
  | 'driver_manager'
  | 'support_agent'
  | 'finance_admin'

/**
 * Administrator User Entity
 */
export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: AdminRole
  phone?: string
  avatarUrl?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

/**
 * Credentials required for administrator login
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Authentication Session metadata
 */
export interface AuthSession {
  user: AdminUser
  expiresAt: string
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
  error: string | null
  setUser: (user: AdminUser | null) => void
  setStatus: (status: AuthStatus) => void
  setError: (error: string | null) => void
  resetAuth: () => void
}
