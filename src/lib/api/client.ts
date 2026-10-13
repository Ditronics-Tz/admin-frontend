import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from './config'
import { formatApiError } from './errors'
import type { BackendStaffRefreshResponse, BackendStaffUser } from './types'
import { mockAdapter } from './mock'
import { toast } from 'sonner'
import { useApiAccess } from './access'
import { refreshStorage } from './refresh-storage'

type SessionEvent = { type: 'expired' } | { type: 'updated'; user: BackendStaffUser }
const listeners = new Set<(event: SessionEvent) => void>()
let revision = 0
export function subscribeSession(listener: (event: SessionEvent) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
function emit(event: SessionEvent) {
  listeners.forEach((listener) => listener(event))
}
let accessToken: string | null = null
refreshStorage.removeLegacyAccess()
export const tokenStorage = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshStorage.get(),
  clearAccessToken() {
    revision++
    accessToken = null
  },
  setSession(newAccessToken: string, refreshToken: string) {
    revision++
    accessToken = newAccessToken
    refreshStorage.set(refreshToken)
    refreshStorage.removeLegacyAccess()
  },
  clearTokens() {
    revision++
    useApiAccess.setState({ readOnly: false })
    accessToken = null
    refreshStorage.clear()
    refreshStorage.removeLegacyAccess()
    emit({ type: 'expired' })
  },
}

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  ...(API_CONFIG.mockMode ? { adapter: mockAdapter } : {}),
})

// All refresh callers share one rotation, including session restoration in StrictMode.
let refreshPromise: Promise<BackendStaffRefreshResponse> | null = null
export function refreshStaffSession(): Promise<BackendStaffRefreshResponse> {
  if (refreshPromise) return refreshPromise
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return Promise.reject(new Error('Please sign in again.'))
  const startedAt = revision
  const pending = axios
    .post<BackendStaffRefreshResponse>(
      `${API_CONFIG.baseURL}/staff/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: API_CONFIG.timeout }
    )
    .then(({ data }) => {
      // A late refresh must never resurrect a logged-out or replaced session.
      if (revision !== startedAt)
        throw new Error('The session has changed. Please sign in again.')
      tokenStorage.setSession(data.access_token, data.refresh_token)
      emit({ type: 'updated', user: data.user })
      return data
    })
    .catch((error: unknown) => {
      if (revision === startedAt) tokenStorage.clearTokens()
      throw formatApiError(error)
    })
    .finally(() => {
      if (refreshPromise === pending) refreshPromise = null
    })
  refreshPromise = pending
  return pending
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const isPublicAuth = /\/staff\/auth\/(login|refresh)$/.test(request?.url || '')
    if (error.response?.status === 401 && request && !isPublicAuth) {
      if (request._retry || !tokenStorage.getRefreshToken()) {
        tokenStorage.clearTokens()
        throw formatApiError(error)
      }
      request._retry = true
      // A delayed 401 may belong to the token already replaced by another request.
      const currentToken = tokenStorage.getAccessToken()
      if (!currentToken || request.headers.Authorization === `Bearer ${currentToken}`) {
        await refreshStaffSession()
      }
      if (request.url === '/staff/auth/logout') {
        request.data = JSON.stringify({ refresh_token: tokenStorage.getRefreshToken() })
        request.headers.delete('Content-Length')
      }
      return apiClient(request)
    }
    // Protected files return JSON errors even though successful responses are blobs.
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text())
      } catch {
        /* Keep the HTTP status fallback. */
      }
    }
    const detail = formatApiError(error)
    if (detail.status === 403) useApiAccess.setState({ readOnly: true })
    if (detail.status === 429) toast.error(detail.message, { id: 'api-rate-limit' })
    throw detail
  }
)
