import { create } from 'zustand'
import type { AdminUser, AuthState, AuthStatus } from '@/types/auth'

/**
 * Global Authentication Store (Zustand)
 *
 * NOTE: Sensitive credentials and raw authentication tokens are deliberately
 * NOT stored in browser localStorage. Session cookies (HttpOnly) are preferred.
 * This store retains current active user metadata and lifecycle status only.
 */
const DEV_ADMIN_USER: AdminUser = {
  id: 'admin-001',
  email: 'admin@rida.tz',
  fullName: 'Juma Ally',
  role: 'operations_admin',
  phone: '+255 754 123 456',
  isActive: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: '2025-01-01T00:00:00Z',
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEV_ADMIN_USER,
  status: 'authenticated',
  isAuthenticated: true,
  error: null,

  setUser: (user: AdminUser | null) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      status: user ? 'authenticated' : 'unauthenticated',
      error: null,
    }),

  setStatus: (status: AuthStatus) => set({ status }),

  setError: (error: string | null) =>
    set({
      error,
      status: error ? 'error' : 'idle',
    }),

  resetAuth: () =>
    set({
      user: DEV_ADMIN_USER,
      isAuthenticated: true,
      status: 'authenticated',
      error: null,
    }),
}))
