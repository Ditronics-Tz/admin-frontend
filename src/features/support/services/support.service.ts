import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'

export type WorkKind = 'tickets' | 'complaints'
export const supportService = {
  async list(kind: WorkKind): Promise<unknown[]> {
    const { data } = await apiClient.get<{ tickets?: unknown[]; complaints?: unknown[] }>(
      kind === 'tickets' ? API_ENDPOINTS.ADMIN.TICKETS : API_ENDPOINTS.ADMIN.COMPLAINTS
    )
    return data[kind] || []
  },
  async update(
    kind: WorkKind,
    id: string
  ): Promise<{ id: string; status: string; message: string }> {
    const { data } = await apiClient.patch<{
      id: string
      status: string
      message: string
    }>(
      kind === 'tickets'
        ? API_ENDPOINTS.ADMIN.UPDATE_TICKET(id)
        : API_ENDPOINTS.ADMIN.UPDATE_COMPLAINT(id)
    )
    return data
  },
}
