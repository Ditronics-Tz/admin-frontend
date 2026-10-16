import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { BackendNotificationPage, Page } from '@/lib/api/types'

export const notificationService = {
  async deliveries(params: { status?: string; limit?: number; offset?: number } = {}) {
    const { data } = await apiClient.get<Page<BackendNotificationPage['notifications'][number], 'notifications'> & Pick<BackendNotificationPage, 'by_status' | 'sender_mode' | 'push_mode' | 'inbox_count' | 'push_by_status'>>(
      API_ENDPOINTS.ADMIN.NOTIFICATIONS,
      { params: { limit: 20, offset: 0, ...params } }
    )
    return data
  },
}
