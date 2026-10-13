import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  BackendUsersListResponse,
  BackendUserDetailResponse,
  BackendUserResponse,
  Page,
  ListParams,
} from '@/lib/api/types'

export interface CustomerViewModel {
  id: string
  fullName: string
  email: string
  isActive: boolean
  role: string
  status: string
  phone: string
  phoneVerified: boolean
}

export const customerService = {
  async listPage(params: ListParams = {}) {
    const { data } = await apiClient.get<Page<BackendUserResponse, 'users'>>(
      API_ENDPOINTS.ADMIN.USERS,
      {
        params: { role: 'passenger', limit: 20, offset: 0, ...params },
      }
    )
    return data
  },
  /**
   * Fetches real registered passengers from Go backend GET /api/v1/admin/users?role=passenger
   */
  async listCustomers(): Promise<CustomerViewModel[]> {
    const response = await apiClient.get<BackendUsersListResponse>(
      `${API_ENDPOINTS.ADMIN.USERS}?role=passenger`
    )
    const users = response.data.users || []
    return users.map((u: BackendUserResponse) => ({
      id: u.id,
      fullName: u.name,
      email: u.email,
      isActive: u.is_active,
      role: u.role,
      status: u.status || (u.is_active ? 'active' : 'suspended'),
      phone: u.phone || '',
      phoneVerified: !!u.phone_verified_at,
    }))
  },

  /**
   * Fetches customer details from GET /api/v1/admin/users/:id
   */
  async getCustomer(id: string): Promise<BackendUserDetailResponse> {
    const response = await apiClient.get<BackendUserDetailResponse>(
      API_ENDPOINTS.ADMIN.USER_DETAILS(id)
    )
    return response.data
  },
}
