import { apiClient } from '@/lib/api/client'
import type {
  BackendUserDetailResponse,
  BackendVerificationReview,
} from '@/lib/api/types'

export interface SupportNote {
  id: string
  author_name: string
  body: string
  created_at: string
}
export interface StatusEvent {
  id: string
  from_status: string
  to_status: string
  reason: string
  until: string | null
  created_at: string
  actor_id: string | null
}
export const accountService = {
  async get(id: string) {
    return (await apiClient.get<BackendUserDetailResponse>(`/admin/users/${id}`)).data
  },
  async status(
    id: string,
    action: 'suspend' | 'reactivate' | 'ban',
    reason: string,
    until?: string
  ) {
    return (
      await apiClient.post<BackendUserDetailResponse>(`/admin/users/${id}/${action}`, {
        reason,
        until: until || null,
      })
    ).data
  },
  async notes(id: string) {
    return (await apiClient.get<{ notes: SupportNote[] }>(`/admin/users/${id}/notes`))
      .data.notes
  },
  async addNote(id: string, body: string) {
    return (await apiClient.post<SupportNote>(`/admin/users/${id}/notes`, { body })).data
  },
  async deleteNote(id: string, noteId: string) {
    await apiClient.delete(`/admin/users/${id}/notes/${noteId}`)
  },
  async history(id: string) {
    return (
      await apiClient.get<{
        status_events: StatusEvent[]
        verification_reviews: BackendVerificationReview[]
      }>(`/admin/users/${id}/history`)
    ).data
  },
}
