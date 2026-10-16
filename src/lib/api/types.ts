/**
 * API Type Definitions & Backend Contract Interfaces
 */

// Legacy frontend wrapper compatibility
export type Page<T, K extends string> = {
  total: number
  limit: number
  offset: number
} & Record<K, T[]>

export interface ListParams {
  limit?: number
  offset?: number
  q?: string
  role?: string
  status?: string
  action?: string
  actor?: string
  from?: string
  to?: string
  created_from?: string
  created_to?: string
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: 'success' | 'error'
  timestamp?: string
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

// -------------------------------------------------------------
// Real Backend API Contract Schemas (Go Fiber + GORM Models)
// -------------------------------------------------------------

/**
 * Backend Staff Role Enum
 */
export type BackendStaffRole = 'admin' | 'support'

/**
 * Backend Staff User representation (from models.StaffUserResponse)
 */
export interface BackendStaffUser {
  id: string
  name: string
  email: string
  role: BackendStaffRole
  is_active: boolean
  must_change_password: boolean
  totp_enabled: boolean
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

/**
 * Backend Staff Login Response
 */
export interface BackendStaffLoginResponse {
  access_token?: string
  refresh_token?: string
  must_change_password?: boolean
  user?: BackendStaffUser
  mfa_required?: boolean
  enrollment_required?: boolean
  challenge_token?: string
  challenge_expires_in?: number
  recovery_codes?: string[]
}

/**
 * Backend Staff Refresh Response
 */
export interface BackendStaffRefreshResponse {
  access_token: string
  refresh_token: string
  user: BackendStaffUser
}

/**
 * Backend App User representation (models.UserResponse)
 */
export interface BackendUserResponse {
  id: string
  name: string
  email: string
  role: 'driver' | 'passenger'
  is_active: boolean
  status?: 'active' | 'suspended' | 'banned'
  suspended_until?: string | null
  phone?: string
  phone_verified_at?: string | null
  created_at?: string
}

/**
 * Backend Driver Profile (models.DriverProfile)
 */
export interface BackendDriverProfile {
  user_id: string
  licence_number: string
  vehicle_card_number: string
  plate_number: string
  licence_image_url: string
  profile_picture_url: string
  verification_status: BackendVerificationStatus
  assigned_to: string | null
  assigned_at: string | null
  is_online: boolean
  average_rating: number
  total_ratings: number
  created_at: string
  updated_at: string
}

/**
 * Backend Passenger Profile (models.PassengerProfile)
 */
export type BackendVerificationStatus =
  | 'pending_documents'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'expired'
export type BackendDocumentType =
  'driving_licence' | 'vehicle_card' | 'national_id' | 'insurance' | 'vehicle_photo'
export interface BackendDriverDocument {
  id: string
  driver_id: string
  type: BackendDocumentType
  file_url: string
  status: 'submitted' | 'approved' | 'rejected' | 'expired'
  is_current: boolean
  rejection_code: string
  rejection_note: string
  expires_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}
export interface BackendVerificationReview {
  id: string
  driver_id: string
  document_id: string | null
  reviewer_id: string | null
  reviewer_name: string
  decision: string
  reason_code: string
  note: string
  created_at: string
}
export interface BackendVerificationDetail {
  user?: BackendUserResponse
  profile: BackendDriverProfile
  documents: BackendDriverDocument[]
  reviews: BackendVerificationReview[]
  duplicate_flags?: {
    id: string
    driver_id: string
    matched_driver_id: string
    field: string
    value: string
    created_at: string
  }[]
  required_types: BackendDocumentType[]
  rejection_codes: string[]
}

export interface BackendPassengerProfile {
  user_id: string
  full_name: string
  profile_picture_url: string
  phone: string
  average_rating: number
  total_ratings: number
  created_at: string
  updated_at: string
}

/**
 * Backend Admin Users List Response
 */
export interface BackendUsersListResponse {
  count: number
  users: BackendUserResponse[]
}

/**
 * Backend Admin User Detail Response (GET /api/v1/admin/users/:id)
 */
export interface BackendUserDetailResponse {
  user: BackendUserResponse
  driver_profile?: BackendDriverProfile
  driver_documents?: BackendDriverDocument[]
  passenger_profile?: BackendPassengerProfile
  average_rating: number
  total_ratings: number
}

/**
 * Backend Admin Stats Response (GET /api/v1/admin/stats)
 */
export interface BackendAdminStatsResponse {
  operational_counts_available?: boolean
  total_drivers: number
  total_passengers: number
  active_rides: number
  open_tickets: number
  open_complaints: number
}

export interface BackendAdminAnalyticsResponse {
  from: string
  to: string
  registrations: { date: string; passengers: number; drivers: number }[]
  rides: { date: string; requested: number; completed: number }[]
  totals: {
    passengers: number
    drivers: number
    ride_requests: number
    completed_rides: number
  }
}

export interface BackendNotificationPage {
  notifications: {
    id: string
    template: string
    language: string
    status: 'pending' | 'processing' | 'delivered' | 'failed'
    attempts: number
    created_at: string
  }[]
  total: number
  limit: number
  offset: number
  by_status: { pending: number; processing: number; delivered: number; failed: number }
  sender_mode: 'logging_stub' | 'configured' | string
}

/**
 * Backend Staff Audit Log (models.StaffAuditLog)
 */
export interface BackendStaffAuditLog {
  id: string
  actor_id: string
  action: string
  target_type: string
  target_id: string
  ip: string
  meta: string
  created_at: string
}

/**
 * Backend Staff Audit Logs List Response
 */
export interface BackendAuditLogsResponse {
  total: number
  limit: number
  logs: BackendStaffAuditLog[]
}

export interface BackendOperationEvent {
  id: string
  actor_type: 'app' | 'staff' | 'anonymous'
  actor_id: string
  action: string
  method: string
  route: string
  status: number
  request_id: string
  target_id: string
  created_at: string
}

export interface BackendOperationEventsResponse {
  events: BackendOperationEvent[]
  total: number
  limit: number
  offset: number
}

/**
 * Backend Staff List Response
 */
export interface BackendStaffListResponse {
  count: number
  staff: BackendStaffUser[]
}
