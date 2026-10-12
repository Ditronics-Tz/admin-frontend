import { apiClient } from '@/lib/api/client'
import { request, type Page, type Party, type StaffNote, type Ride } from './api'
export type FraudFlag = {
  id: string
  user_id: string
  rule_key: string
  type: string
  severity: 'low' | 'medium' | 'high'
  score: number
  status: string
  evidence: string
  related_user_ids: string
  assigned_to: string | null
  resolution_note: string
  created_at: string
}
export type Hold = {
  id: string
  flag_id: string
  user_id: string
  type: string
  active: boolean
}
export type FraudRule = {
  key: string
  enabled: boolean
  params: string
  severity: 'low' | 'medium' | 'high'
  auto_mitigation: string
}
export type RuleStatus = {
  rule: FraudRule
  effective_enabled: boolean
  disabled_reason: string
}
export function canEditFraudRules(role: string | undefined, writeAccess: boolean) {
  return role === 'admin' && writeAccess
}
export const fraudApi = {
  flags: (params: Record<string, string | number> = {}) =>
    request(
      apiClient.get<Page<FraudFlag, 'flags'> & { holds: Hold[] }>('/admin/fraud/flags', {
        params,
      })
    ),
  flag: (id: string, offset = 0) =>
    request(
      apiClient.get<{
        flag: FraudFlag
        user: Party
        linked_accounts: Party[]
        related_flags: FraudFlag[]
        related_total: number
        notes: StaffNote[]
        notes_total: number
        actions: { id: string; action: string; by: string; at: string }[]
        actions_total: number
        holds: Hold[]
      }>(`/admin/fraud/flags/${encodeURIComponent(id)}`, {
        params: { offset, limit: 20 },
      })
    ),
  action: (id: string, action: string, body: unknown = {}) =>
    request(
      apiClient.post(`/admin/fraud/flags/${encodeURIComponent(id)}/${action}`, body)
    ),
  rules: () =>
    request(
      apiClient.get<Page<RuleStatus, 'rules'>>('/admin/fraud/rules', {
        params: { limit: 100, offset: 0 },
      })
    ),
  update: (rules: FraudRule[]) => request(apiClient.put('/admin/fraud/rules', { rules })),
  dryRun: (key: string) =>
    request(
      apiClient.post<{ matching_accounts: number; window_days: number }>(
        `/admin/fraud/rules/${encodeURIComponent(key)}/dry-run`
      )
    ),
  user: (id: string, offset = 0) =>
    request(
      apiClient.get<Page<FraudFlag, 'flags'> & { linked_accounts: Party[] }>(
        `/admin/users/${encodeURIComponent(id)}/fraud`,
        { params: { offset, limit: 20 } }
      )
    ),
  trail: (id: string, offset = 0) =>
    request(
      apiClient.get<{
        ride: Ride
        points: { id: string; lat: number; lng: number; accuracy: number; at: string }[]
        total: number
      }>(`/admin/fraud/rides/${encodeURIComponent(id)}/location`, {
        params: { offset, limit: 100 },
      })
    ),
  stats: () =>
    request(apiClient.get<{ open: number; high_severity: number }>('/admin/fraud/stats')),
}
export function canResolveFraud(
  role: string | undefined,
  severity: string,
  status: string
) {
  return (
    role === 'admin' ||
    (role === 'support' && severity === 'low' && status === 'dismissed')
  )
}
