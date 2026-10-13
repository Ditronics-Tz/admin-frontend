import type { AxiosError } from 'axios'

export interface BackendErrorPayload {
  error?: string
  message?: string
  must_change_password?: boolean
  require_2fa?: boolean
  code?: string
  errors?: Record<string, string[]>
  fields?: Record<string, string>
  request_id?: string
}

export class ApiClientError extends Error {
  public status?: number
  public code?: string
  public mustChangePassword?: boolean
  public require2FA?: boolean
  public validationErrors?: Record<string, string[]>
  public isNetworkError: boolean
  public requestId?: string
  public retryAfterSeconds?: number

  constructor(
    message: string,
    options?: {
      status?: number
      code?: string
      mustChangePassword?: boolean
      require2FA?: boolean
      validationErrors?: Record<string, string[]>
      isNetworkError?: boolean
    }
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = options?.status
    this.code = options?.code
    this.mustChangePassword = options?.mustChangePassword
    this.require2FA = options?.require2FA
    this.validationErrors = options?.validationErrors
    this.isNetworkError = options?.isNetworkError ?? false
  }
}

/**
 * Normalizes an unknown error or AxiosError into a human-readable, strongly-typed ApiClientError.
 */
function normalizeApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error
  }

  const axiosErr = error as AxiosError<BackendErrorPayload>

  if (!axiosErr || !axiosErr.isAxiosError) {
    if (error instanceof Error) {
      return new ApiClientError(error.message)
    }
    return new ApiClientError('An unexpected client error occurred.')
  }

  const status = axiosErr.response?.status
  const data = axiosErr.response?.data
  const backendMessage = data?.error || data?.message

  // Network / Connection error
  if (!axiosErr.response) {
    return new ApiClientError(
      'Unable to connect to the Rida backend service. Please ensure the backend server is running and accessible.',
      {
        status,
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      }
    )
  }

  // HTTP Status Specific Error Handling
  switch (status) {
    case 400:
      return new ApiClientError(
        backendMessage || 'The request was invalid. Please verify the submitted data.',
        {
          status,
          code: data?.code || 'BAD_REQUEST',
          validationErrors:
            data?.errors ||
            (data?.fields
              ? Object.fromEntries(
                  Object.entries(data.fields).map(([key, value]) => [key, [value]])
                )
              : undefined),
        }
      )
    case 401:
      return new ApiClientError(
        backendMessage ||
          'Authentication required or session expired. Please sign in again.',
        {
          status,
          code: 'UNAUTHORIZED',
        }
      )
    case 403:
      return new ApiClientError(
        backendMessage ||
          'Access denied: You do not possess the required administrative permissions for this operation.',
        {
          status,
          code: 'FORBIDDEN',
          mustChangePassword: data?.must_change_password,
          require2FA: data?.require_2fa,
        }
      )
    case 404:
      return new ApiClientError(
        backendMessage || 'The requested resource was not found on the server.',
        {
          status,
          code: 'NOT_FOUND',
        }
      )
    case 409:
      return new ApiClientError(
        backendMessage ||
          'A conflict occurred. The resource or identifier may already exist.',
        {
          status,
          code: 'CONFLICT',
          validationErrors:
            data?.errors ||
            (data?.fields
              ? Object.fromEntries(
                  Object.entries(data.fields).map(([key, value]) => [key, [value]])
                )
              : undefined),
        }
      )
    case 429:
      return new ApiClientError(
        `Too many requests. Try again in ${Math.max(1, Number(axiosErr.response?.headers?.['retry-after']) || 60)} seconds.`,
        {
          status,
          code: 'TOO_MANY_REQUESTS',
        }
      )
    case 500:
    case 502:
    case 503:
    case 504:
      return new ApiClientError(
        backendMessage ||
          'Internal server error. The backend service encountered an issue.',
        {
          status,
          code: 'SERVER_ERROR',
        }
      )
    default:
      return new ApiClientError(
        backendMessage || axiosErr.message || 'An unexpected API error occurred.',
        {
          status,
          code: data?.code || axiosErr.code,
        }
      )
  }
}

export function retryAfterSeconds(value: unknown, now = Date.now()): number {
  if (typeof value !== 'string' && typeof value !== 'number') return 60
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return Math.max(1, Math.ceil(numeric))
  const date = Date.parse(String(value))
  return Number.isFinite(date) ? Math.max(1, Math.ceil((date - now) / 1000)) : 60
}

export function formatApiError(error: unknown): ApiClientError {
  const detail = normalizeApiError(error)
  if (error instanceof ApiClientError) return detail
  const response = (error as AxiosError<BackendErrorPayload> | undefined)?.response
  const requestId = response?.data?.request_id || response?.headers?.['x-request-id']
  if (typeof requestId === 'string' && requestId) {
    detail.requestId = requestId
    detail.message += ` Reference: ${requestId}`
  }
  if (!detail.validationErrors && response?.data?.fields) {
    detail.validationErrors = Object.fromEntries(
      Object.entries(response.data.fields).map(([field, message]) => [field, [message]])
    )
  }
  if (detail.status === 429) {
    detail.retryAfterSeconds = retryAfterSeconds(response?.headers?.['retry-after'])
    detail.message = `Too many requests. Try again in ${detail.retryAfterSeconds} seconds.${detail.requestId ? ` Reference: ${detail.requestId}` : ''}`
  }
  return detail
}

export function applyFieldErrors(
  error: unknown,
  setError: (field: string, message: string) => void
) {
  const fields = formatApiError(error).validationErrors || {}
  Object.entries(fields).forEach(([field, messages]) =>
    setError(field, messages.join(' '))
  )
  return Object.keys(fields).length > 0
}
