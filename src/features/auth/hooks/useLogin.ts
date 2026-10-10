import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/lib/constants'
import type { LoginFormValues } from '../schemas/authSchema'
import type { LoginTranslations } from '@/lib/constants/translations'
import type { ApiError } from '@/lib/api/types'

export const useLogin = (t: LoginTranslations) => {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      // Execute authentication request against backend service
      const session = await authService.login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      })

      // On successful backend authentication response:
      setUser(session.user)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err: unknown) {
      // In Phase 1/2 without a running backend server, provide an honest, clear status
      const apiErr = err as ApiError
      if (apiErr?.status === 401) {
        setAuthError(apiErr.message || 'Invalid administrative credentials provided.')
      } else if (apiErr?.message && !apiErr.message.includes('Network Error')) {
        setAuthError(apiErr.message)
      } else {
        // Honest notification that backend service endpoint is currently offline/unconnected
        setAuthError(t.backendOfflineMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    authError,
    clearAuthError: () => setAuthError(null),
    handleLogin,
  }
}
