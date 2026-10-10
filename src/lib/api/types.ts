/**
 * API Type Definitions
 */

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: 'success' | 'error'
  timestamp: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  status: 'success' | 'error'
}
