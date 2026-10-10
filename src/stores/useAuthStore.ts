import { create } from 'zustand'
import type { AdminUser, AuthState, AuthStatus } from '@/types/auth'

/**
 * Global Authentication Store (Zustand)
 *
 * NOTE: Sensitive credentials and raw authentication tokens are deliberately
 * NOT stored in browser localStorage. Session cookies (HttpOnly) are preferred.
 * This store retains current active user metadata and lifecycle status only.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  isAuthenticated: false,
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
      user: null,
      isAuthenticated: false,
      status: 'unauthenticated',
      error: null,
    }),
}))
