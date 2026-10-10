import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiError } from './types'

/**
 * Base API URL configured via environment variable with a safe local fallback.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

/**
 * Centralized Axios API client configured for PikiPiki Admin.
 * Supports HttpOnly cookie authentication and standard JSON payloads.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // Supports secure HttpOnly cookie session handling
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: for adding correlation IDs or authorization headers when needed
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Interceptor hook ready for future bearer token injection if not using HttpOnly cookies
    return config
  },
  (error: unknown) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: standardized error transformation and session expiration handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (
    error: AxiosError<{
      message?: string
      errors?: Record<string, string[]>
      code?: string
    }>
  ) => {
    const formattedError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
      status: error.response?.status,
      code: error.response?.data?.code || error.code,
      errors: error.response?.data?.errors,
    }

    // 401 Unauthorized handling stub for future session expiration routing
    if (error.response?.status === 401) {
      // Future: Trigger session refresh or redirect to /login
    }

    return Promise.reject(formattedError)
  }
)
