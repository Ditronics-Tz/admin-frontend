import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { Page } from '@/lib/api/types'
import { ApiClientError } from '@/lib/api/errors'

export type WorkKind = 'tickets' | 'complaints' | 'reports'
export interface WorkItem {
  id: string
  subject?: string
  title?: string
  description?: string
  status: string
  priority: string
  category: string
  assigned_to: string | null
  created_at: string
  resolution_note?: string
}
export interface WorkNote {
  id: string
  body?: string
  note?: string
  author_name?: string
  staff_id?: string
  created_at: string
}
export function workKind(value?: string): WorkKind | null {
  return value && ['tickets', 'complaints', 'reports'].includes(value)
    ? (value as WorkKind)
    : null
}
const path = (kind: WorkKind, id?: string) =>
  `/admin/${kind}${id ? `/${encodeURIComponent(id)}` : ''}`
export const supportService = {
  async page(kind: WorkKind, params: Record<string, string | number> = {}) {
    const { data } = await apiClient.get<Page<WorkItem, WorkKind>>(path(kind), {
      params: { limit: 20, offset: 0, ...params },
    })
    if (!Number.isFinite(data.total))
      throw new ApiClientError('Support persistence is unavailable on this server.', {
        status: 501,
        code: 'NOT_IMPLEMENTED',
      })
    return data
  },
  async detail(kind: WorkKind, id: string) {
    const { data } = await apiClient.get<Record<string, unknown>>(path(kind, id))
    const item = (data[kind.slice(0, -1)] || data.item || data) as WorkItem
    if (!item || typeof item.id !== 'string' || typeof item.status !== 'string')
      throw new ApiClientError('Support details are unavailable on this server.', {
        status: 501,
      })
    return { item, notes: Array.isArray(data.notes) ? (data.notes as WorkNote[]) : [] }
  },
  async patch(
    kind: WorkKind,
    id: string,
    body: {
      status?: string
      priority?: string
      assigned_to?: string | null
      resolution_note?: string
      reason?: string
    }
  ) {
    await apiClient.patch(path(kind, id), body)
  },
  async note(kind: WorkKind, id: string, body: string) {
    await apiClient.post(`${path(kind, id)}/notes`, { body })
  },
  async list(kind: WorkKind): Promise<unknown[]> {
    const { data } = await apiClient.get<{ tickets?: unknown[]; complaints?: unknown[] }>(
      path(kind)
    )
    return (data as Record<string, unknown[]>)[kind] || []
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
