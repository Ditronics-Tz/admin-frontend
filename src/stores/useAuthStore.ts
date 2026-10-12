import { create } from 'zustand'
import type { AdminUser, AuthState, AuthStatus } from '@/types/auth'
import { tokenStorage } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'

/**
 * Global Authentication Store (Zustand)
 *
 * Manages active administrative session state.
 * Uses real Bearer tokens stored in tokenStorage.
 * Never defaults to fake credentials in live production mode.
 */

// Isolated mock user exclusively for explicit demo mode when VITE_ENABLE_DEMO_MODE=true
const DEMO_ADMIN_USER: AdminUser = {
  id: 'demo-staff-001',
  email: 'admin.demo@rida.tz',
  fullName: 'Juma Ally (Demo Mode)',
  role: 'admin',
  phone: '+255 754 123 456',
  isActive: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: '2026-01-01T00:00:00Z',
}

const initialHasToken = Boolean(
  tokenStorage.getAccessToken() || tokenStorage.getRefreshToken()
)
const isDemoMode = API_CONFIG.demoMode

export const useAuthStore = create<AuthState>((set) => ({
  user: isDemoMode ? DEMO_ADMIN_USER : null,
  status: isDemoMode ? 'authenticated' : initialHasToken ? 'loading' : 'unauthenticated',
  isAuthenticated: isDemoMode || initialHasToken,
  isInitialized: false,
  error: null,

  setUser: (user: AdminUser | null) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      status: user ? 'authenticated' : 'unauthenticated',
      isInitialized: true,
      error: null,
    }),

  setStatus: (status: AuthStatus) => set({ status }),

  setError: (error: string | null) =>
    set({
      error,
      status: error ? 'error' : 'idle',
    }),

  logout: () => {
    tokenStorage.clearTokens()
    set({
      user: null,
      isAuthenticated: false,
      status: 'unauthenticated',
      error: null,
    })
  },

  resetAuth: () => {
    tokenStorage.clearTokens()
    set({
      user: isDemoMode ? DEMO_ADMIN_USER : null,
      isAuthenticated: isDemoMode,
      status: isDemoMode ? 'authenticated' : 'unauthenticated',
      error: null,
    })
  },
}))
