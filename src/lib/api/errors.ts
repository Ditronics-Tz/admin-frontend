import type { AxiosError } from 'axios'

export interface BackendErrorPayload {
  error?: string
  message?: string
  must_change_password?: boolean
  require_2fa?: boolean
  code?: string
  errors?: Record<string, string[]>
  fields?: Record<string, string>
}

export class ApiClientError extends Error {
  public status?: number
  public code?: string
  public mustChangePassword?: boolean
  public require2FA?: boolean
  public validationErrors?: Record<string, string[]>
  public isNetworkError: boolean

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
export function formatApiError(error: unknown): ApiClientError {
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
