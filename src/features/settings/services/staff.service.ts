import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  BackendStaffListResponse,
  BackendStaffUser,
  BackendAuditLogsResponse,
  BackendStaffAuditLog,
  Page,
  ListParams,
} from '@/lib/api/types'

export interface CreateStaffPayload {
  name: string
  email: string
  role: 'admin' | 'support'
}

export interface CreateStaffResponse {
  message: string
  staff: BackendStaffUser
  one_time_password: string
}

export const staffService = {
  async listPage(params: ListParams = {}) {
    return (
      await apiClient.get<Page<BackendStaffUser, 'staff'>>(API_ENDPOINTS.ADMIN.STAFF, {
        params: { limit: 20, offset: 0, ...params },
      })
    ).data
  },
  /**
   * List all staff accounts (Admin only)
   */
  async listStaff(): Promise<BackendStaffUser[]> {
    const response = await apiClient.get<BackendStaffListResponse>(
      API_ENDPOINTS.ADMIN.STAFF
    )
    return response.data.staff || []
  },

  /**
   * Create new staff account with generated one-time password (Admin only)
   */
  async createStaff(payload: CreateStaffPayload): Promise<CreateStaffResponse> {
    const response = await apiClient.post<CreateStaffResponse>(
      API_ENDPOINTS.ADMIN.STAFF,
      payload
    )
    return response.data
  },

  /**
   * Update staff name or active status (Admin only)
   */
  async updateStaff(
    id: string,
    payload: { name?: string; is_active?: boolean }
  ): Promise<BackendStaffUser> {
    const response = await apiClient.patch<{ message: string; staff: BackendStaffUser }>(
      API_ENDPOINTS.ADMIN.UPDATE_STAFF(id),
      payload
    )
    return response.data.staff
  },

  /**
   * Update staff role (Admin only)
   */
  async updateStaffRole(
    id: string,
    role: 'admin' | 'support'
  ): Promise<BackendStaffUser> {
    const response = await apiClient.patch<{ message: string; staff: BackendStaffUser }>(
      API_ENDPOINTS.ADMIN.UPDATE_STAFF_ROLE(id),
      { role }
    )
    return response.data.staff
  },

  /**
   * Reset staff password and generate new OTP (Admin only)
   */
  async resetPassword(
    id: string
  ): Promise<{ message: string; one_time_password: string }> {
    const response = await apiClient.post<{ message: string; one_time_password: string }>(
      API_ENDPOINTS.ADMIN.RESET_STAFF_PASSWORD(id)
    )
    return response.data
  },

  /**
   * Revoke all active sessions of a staff member (Admin only)
   */
  async revokeSessions(id: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.ADMIN.REVOKE_STAFF_SESSIONS(id)
    )
    return response.data
  },

  /**
   * Fetch paginated security audit logs (Admin only)
   */
  async listAuditLogs(
    limit: number = 50,
    offset: number = 0,
    filters: Omit<ListParams, 'limit' | 'offset'> = {}
  ): Promise<{ total: number; logs: BackendStaffAuditLog[] }> {
    const response = await apiClient.get<BackendAuditLogsResponse>(
      `${API_ENDPOINTS.ADMIN.AUDIT_LOGS}?${new URLSearchParams({ limit: String(limit), offset: String(offset), ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')) }).toString()}`
    )
    return {
      total: response.data.total,
      logs: response.data.logs || [],
    }
  },
}
