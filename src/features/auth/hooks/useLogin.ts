import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatApiError, ApiClientError } from '@/lib/api/errors'
import type { LoginFormValues } from '../schemas/authSchema'
import type { LoginTranslations } from '@/lib/constants/translations'
import { staffLandingPath } from '../landing'

export const useLogin = (t: LoginTranslations) => {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [requires2FA, setRequires2FA] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      // Execute real Go backend authentication request against /api/v1/staff/auth/login
      const session = await authService.login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        totpCode: values.totpCode,
      })

      // Set authenticated staff user in store
      queryClient.clear()
      setUser(session.user)

      // Respect intended destination if redirected from a protected route
      const from = (
        location.state as { from?: { pathname: string; search?: string; hash?: string } }
      )?.from
      navigate(staffLandingPath(session.user, from), {
        replace: true,
      })
    } catch (err: unknown) {
      const apiErr = formatApiError(err)

      if (apiErr.require2FA) {
        setRequires2FA(true)
        setAuthError('Two-factor authentication code is required.')
      } else if (apiErr.isNetworkError) {
        setAuthError(t.backendOfflineMessage || apiErr.message)
      } else if (apiErr instanceof ApiClientError) {
        setAuthError(apiErr.message)
      } else {
        setAuthError('An unexpected authentication error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    authError,
    requires2FA,
    clearAuthError: () => setAuthError(null),
    handleLogin,
  }
}
