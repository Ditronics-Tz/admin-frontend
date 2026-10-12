import { useEffect, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService, mapBackendStaffUser } from '@/features/auth/services/authService'
import { useAuthStore } from '@/stores/useAuthStore'
import { subscribeSession, tokenStorage } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'

let restoration: ReturnType<typeof authService.getCurrentUser> | null = null
function restore() {
  if (!restoration) {
    restoration = (
      tokenStorage.getAccessToken()
        ? authService.getCurrentUser()
        : authService.refreshSession().then((session) => session.user)
    ).finally(() => {
      restoration = null
    })
  }
  return restoration
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  useEffect(() => {
    let mounted = true
    const unsubscribe = subscribeSession((event) => {
      if (event.type === 'expired') {
        queryClient.clear()
        useAuthStore.getState().setUser(null)
      } else {
        useAuthStore.getState().setUser(mapBackendStaffUser(event.user))
      }
    })
    const unsubscribeStore = useAuthStore.subscribe((state, previous) => {
      if (state.user?.id !== previous.user?.id) queryClient.clear()
    })
    const onStorage = (event: StorageEvent) => {
      if (event.key === API_CONFIG.tokenKey || event.key === null) {
        queryClient.clear()
        useAuthStore.getState().setUser(null)
        if (tokenStorage.getAccessToken()) window.location.reload()
      }
    }
    window.addEventListener('storage', onStorage)
    if (!API_CONFIG.demoMode) {
      if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
        useAuthStore.getState().setUser(null)
      } else {
        useAuthStore.getState().setStatus('loading')
        void restore()
          .then((user) => {
            if (
              mounted &&
              tokenStorage.getAccessToken() &&
              useAuthStore.getState().status === 'loading'
            )
              useAuthStore.getState().setUser(user)
          })
          .catch(() => {
            if (mounted && useAuthStore.getState().status === 'loading')
              useAuthStore.getState().setUser(null)
          })
      }
    }
    return () => {
      mounted = false
      unsubscribe()
      unsubscribeStore()
      window.removeEventListener('storage', onStorage)
    }
  }, [queryClient])
  return children
}
