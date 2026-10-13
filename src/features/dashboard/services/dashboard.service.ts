import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { BackendAdminStatsResponse } from '@/lib/api/types'

export interface DashboardStats {
  totalDrivers: number
  totalPassengers: number
  activeRides: number | null
  openTickets: number | null
  openComplaints: number | null
}

export interface BackendRidesListResponse {
  count: number
  rides: unknown[]
}

export const dashboardService = {
  /**
   * Fetches real live administrative stats from Go backend GET /api/v1/admin/stats
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<BackendAdminStatsResponse>(
      API_ENDPOINTS.ADMIN.STATS
    )
    const data = response.data
    const operationalCount = (value: number) =>
      data.operational_counts_available === true && Number.isFinite(value) ? value : null

    return {
      totalDrivers: data.total_drivers,
      totalPassengers: data.total_passengers,
      activeRides: operationalCount(data.active_rides),
      openTickets: operationalCount(data.open_tickets),
      openComplaints: operationalCount(data.open_complaints),
    }
  },

  /**
   * Fetches real rides list from Go backend GET /api/v1/admin/rides
   */
  async getRecentRides(): Promise<BackendRidesListResponse> {
    const response = await apiClient.get<BackendRidesListResponse>(
      API_ENDPOINTS.ADMIN.RIDES
    )
    return response.data
  },

  /**
   * Fetches complaints from Go backend GET /api/v1/admin/complaints
   */
  async getComplaints(): Promise<{ count: number; complaints: unknown[] }> {
    const response = await apiClient.get<{ count: number; complaints: unknown[] }>(
      API_ENDPOINTS.ADMIN.COMPLAINTS
    )
    return response.data
  },

  /**
   * Fetches tickets from Go backend GET /api/v1/admin/tickets
   */
  async getTickets(): Promise<{ count: number; tickets: unknown[] }> {
    const response = await apiClient.get<{ count: number; tickets: unknown[] }>(
      API_ENDPOINTS.ADMIN.TICKETS
    )
    return response.data
  },
}
