import { apiClient } from '@/lib/api/client'
import type { Page } from '@/lib/api/types'

export interface UserSession {
  id: string
  device_id?: string
  platform?: string
  ip?: string
  created_at: string
  last_used_at?: string
}
export interface SecurityEvent {
  id: string
  type: string
  ip?: string
  created_at: string
}
export type UserSessions = Page<UserSession, 'sessions'> & {
  locked_until?: string | null
  failed_login_count?: number
}
const base = (id: string) => `/admin/users/${encodeURIComponent(id)}`
export const securityService = {
  async sessions(id: string, offset = 0) {
    const { data } = await apiClient.get<UserSessions>(`${base(id)}/sessions`, {
      params: { limit: 20, offset },
    })
    if (!Array.isArray(data.sessions)) {
      throw new Error('User sessions are unavailable on this server.')
    }
    return data
  },
  async events(id: string, type = '', offset = 0) {
    const { data } = await apiClient.get<Page<SecurityEvent, 'events'>>(
      `${base(id)}/security-events`,
      { params: { type, offset, limit: 20 } }
    )
    if (!Array.isArray(data.events)) {
      throw new Error('Security events are unavailable on this server.')
    }
    return data
  },
  async revoke(id: string, sessionId?: string) {
    await apiClient.post(
      `${base(id)}/revoke-sessions`,
      sessionId ? { session_id: sessionId } : {}
    )
  },
  async unlock(id: string) {
    await apiClient.post(`${base(id)}/unlock`, {})
  },
}
