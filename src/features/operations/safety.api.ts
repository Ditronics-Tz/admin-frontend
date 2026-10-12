import { apiClient } from '@/lib/api/client'
import {
  request,
  type Page,
  type Party,
  type Ride,
  type StaffNote,
  type Flag,
} from './api'
export type SOS = {
  id: string
  ride_id: string
  triggered_by: string
  role: string
  status: string
  lat: number
  lng: number
  last_lat: number
  last_lng: number
  last_location_at: string | null
  accuracy: number
  assigned_to: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  outcome: string
  resolution_note: string
  escalation_level: number
  user_reported_safe: boolean
  silent: boolean
  created_at: string
}
export type Contact = { id: string; name: string; phone: string; relationship: string }
export type Ping = { id: string; lat: number; lng: number; at: string; accuracy: number }
export type SOSEvent = {
  id: string
  type: string
  by: string
  note: string
  created_at: string
}
export type SOSDetail = {
  alert: SOS
  ride: Ride
  driver: Party
  passenger: Party
  vehicle: string
  contacts: Contact[]
  phones: Record<string, string>
  trail: Ping[]
  trail_total: number
  timeline: SOSEvent[]
  timeline_total: number
  flags: Flag[]
}
export type Incident = {
  id: string
  ride_id: string
  reporter_id: string
  category: string
  severity: string
  description: string
  status: string
  assigned_to: string | null
  occurred_at: string
  location: string
  resolution_note: string
  created_at: string
}
export const safetyApi = {
  alerts: (params: Record<string, string | number> = { status: 'open' }) =>
    request(
      apiClient.get<Page<SOS, 'alerts'> & { sla_seconds: number }>('/admin/sos', {
        params,
      })
    ),
  alert: (id: string, reveal = false, offset = 0) =>
    request(
      apiClient.get<SOSDetail>(`/admin/sos/${encodeURIComponent(id)}`, {
        params: { reveal, offset, limit: 100 },
      })
    ),
  csv: (params: Record<string, string | number> = {}) =>
    request(apiClient.get<Blob>('/admin/sos/export', { params, responseType: 'blob' })),
  action: (id: string, action: string, body: unknown = {}) =>
    request(apiClient.post(`/admin/sos/${encodeURIComponent(id)}/${action}`, body)),
  incidents: (params: Record<string, string | number> = {}) =>
    request(apiClient.get<Page<Incident, 'incidents'>>('/admin/incidents', { params })),
  incident: (id: string, offset = 0) =>
    request(
      apiClient.get<{
        incident: Incident
        notes: StaffNote[]
        notes_total: number
        attachments: { id: string }[]
      }>(`/admin/incidents/${encodeURIComponent(id)}`, { params: { offset, limit: 20 } })
    ),
  incidentAction: (id: string, action: string, body: unknown = {}) =>
    request(apiClient.post(`/admin/incidents/${encodeURIComponent(id)}/${action}`, body)),
  file: (id: string) =>
    request(
      apiClient.get<Blob>(`/admin/incidents/files/${encodeURIComponent(id)}`, {
        responseType: 'blob',
      })
    ),
}
