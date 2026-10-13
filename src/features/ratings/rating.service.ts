import { apiClient } from '@/lib/api/client'
import type { Page } from '@/lib/api/types'
import { ApiClientError } from '@/lib/api/errors'

export interface RatingRecord {
  id: string
  ride_id: string
  from_user_id: string
  to_user_id: string
  score: number
  comment: string
  hidden: boolean
  created_at: string
}
export const ratingService = {
  async list(params: Record<string, string | number> = {}) {
    const { data } = await apiClient.get<Page<RatingRecord, 'ratings'>>(
      '/admin/ratings',
      { params: { limit: 20, offset: 0, ...params } }
    )
    if (!Number.isFinite(data.total) || !Array.isArray(data.ratings))
      throw new ApiClientError('Ratings moderation is unavailable on this server.', {
        status: 501,
      })
    return data
  },
  async moderate(id: string, hidden: boolean, reason: string) {
    await apiClient.post(
      `/admin/ratings/${encodeURIComponent(id)}/${hidden ? 'hide' : 'restore'}`,
      { reason }
    )
  },
}
