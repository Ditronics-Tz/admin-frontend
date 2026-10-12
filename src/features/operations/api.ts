import { create } from 'zustand'
import { apiClient } from '@/lib/api/client'
import { formatApiError } from '@/lib/api/errors'
import { useAuthStore } from '@/stores/useAuthStore'

export type Page<T, K extends string> = {
  total: number
  limit: number
  offset: number
} & Record<K, T[]>
export type Report = {
  id: string
  reporter_id: string
  reported_id: string
  ride_id: string
  category: string
  description: string
  status: string
  priority: string
  assigned_to: string | null
  resolution_outcome: string
  resolution_note: string
  created_at: string
}
export type Party = {
  id: string
  name: string
  role: string
  status: string
  average_rating: number
  reports_received: number
  reports_made: number
}
export type Ride = {
  id: string
  status: string
  fare: number
  pickup: string
  dropoff: string
  created_at: string
  completed_at: string | null
  pickup_lat: number
  pickup_lng: number
  dropoff_lat: number
  dropoff_lng: number
}
export type StaffNote = { id: string; staff_id: string; note: string; created_at: string }
export type ReportDetail = {
  report: Report
  reporter: Party
  reported: Party
  ride: Ride
  notes: StaffNote[]
  notes_total: number
}
export type Flag = {
  id: string
  user_id: string
  reason: string
  source: string
  status: string
  created_at: string
}
export const useOperationsAccess = create<{ deniedFor: string | null }>(() => ({
  deniedFor: null,
}))
export function useOperationsPermission() {
  const user = useAuthStore((s) => s.user),
    denied = useOperationsAccess((s) => s.deniedFor)
  return { user, admin: user?.role === 'admin', write: !!user && denied !== user.id }
}
useAuthStore.subscribe((state, prev) => {
  if (state.user?.id !== prev.user?.id || state.user?.role !== prev.user?.role)
    useOperationsAccess.setState({ deniedFor: null })
})
export async function request<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    return (await promise).data
  } catch (e) {
    const error = formatApiError(e)
    if (error.status === 403)
      useOperationsAccess.setState({
        deniedFor: useAuthStore.getState().user?.id || null,
      })
    throw error
  }
}
export const operationsApi = {
  reports: (params: Record<string, string | number> = {}) =>
    request(apiClient.get<Page<Report, 'reports'>>('/admin/reports', { params })),
  report: (id: string, offset = 0) =>
    request(
      apiClient.get<ReportDetail>(`/admin/reports/${encodeURIComponent(id)}`, {
        params: { offset, limit: 20 },
      })
    ),
  reportAction: (id: string, action: string, body: unknown = {}) =>
    request(apiClient.post(`/admin/reports/${encodeURIComponent(id)}/${action}`, body)),
  flags: (offset = 0) =>
    request(
      apiClient.get<Page<Flag, 'flags'>>('/admin/flags', {
        params: { status: 'open', limit: 20, offset },
      })
    ),
  resolveFlag: (id: string) =>
    request(apiClient.post(`/admin/flags/${encodeURIComponent(id)}/resolve`)),
  userReports: (id: string, offset = 0) =>
    request(
      apiClient.get<
        Page<Report, 'reports'> & {
          party: Party
          blocked_count: number
          blocked_by_count: number
        }
      >(`/admin/users/${encodeURIComponent(id)}/reports`, {
        params: { offset, limit: 20 },
      })
    ),
}
