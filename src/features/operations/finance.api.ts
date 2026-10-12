import { apiClient } from '@/lib/api/client'
import { request, type Page } from './api'
export type Payment = {
  id: string
  ride_id: string | null
  payer_id: string
  driver_id: string | null
  method: string
  amount: number
  fare: number
  commission: number
  discount_amount: number
  refunded_amount: number
  status: string
  provider: string
  provider_ref: string
  masked_phone: string
  failure_code: string
  created_at: string
  updated_at: string
}
export type Ledger = {
  id: string
  account: string
  direction: string
  amount: number
  balance_after: number
  ref_type: string
  ref_id: string
  created_at: string
}
export type Wallet = {
  id: string
  user_id: string
  balance: number
  held: number
  status: string
}
export type Payout = {
  driver_name: string
  verified: boolean
  fraud_hold: boolean
  wallet_balance: number
  wallet_held: number
  id: string
  driver_id: string
  amount: number
  fee: number
  method: string
  masked_destination: string
  status: string
  reject_reason: string
  provider_ref: string
  created_at: string
}
export type Refund = {
  id: string
  transaction_id: string
  amount: number
  reason: string
  status: string
  created_at: string
}
export type Settings = {
  driver_max_negative_balance: number
  payout_min: number
  payout_auto_approve_max: number
  refund_support_limit: number
  id?: string
  created_at?: string
}
export type CommissionRule = {
  id?: string
  scope: string
  vehicle_type: string
  percent: number
  min_fee: number
  effective_from: string
  created_at?: string
}
export type Run = { id: string; status: string; exceptions: number; created_at: string }
export type Exception = {
  id: string
  run_id: string
  transaction_id: string
  type: string
  status: string
  note: string
  created_at: string
}
export function moneyHeaders(key: string) {
  return { headers: { 'Idempotency-Key': key } }
}
export function newMoneyKey() {
  return crypto.randomUUID()
}
export const financeApi = {
  payments: (params: Record<string, string | number> = {}) =>
    request(apiClient.get<Page<Payment, 'payments'>>('/admin/payments', { params })),
  payment: (id: string, offset = 0) =>
    request(
      apiClient.get<{
        payment: Payment
        ledger: Ledger[]
        ledger_total: number
        webhooks: {
          id: string
          event_id: string
          reference: string
          processed_at: string
        }[]
        webhooks_total: number
      }>(`/admin/payments/${encodeURIComponent(id)}`, { params: { offset, limit: 20 } })
    ),
  refund: (id: string, amount: number, reason: string, key: string) =>
    request(
      apiClient.post<Refund>(
        `/admin/payments/${encodeURIComponent(id)}/refund`,
        { amount, reason },
        moneyHeaders(key)
      )
    ),
  refunds: (offset = 0) =>
    request(
      apiClient.get<Page<Refund, 'refunds'> & { support_limit: number }>(
        '/admin/refunds',
        { params: { offset, limit: 20 } }
      )
    ),
  refundAction: (id: string, action: string, reason: string, key: string) =>
    request(
      apiClient.post(
        `/admin/refunds/${encodeURIComponent(id)}/${action}`,
        { reason },
        moneyHeaders(key)
      )
    ),
  payouts: (status: string, offset = 0) =>
    request(
      apiClient.get<Page<Payout, 'payouts'>>('/admin/payouts', {
        params: { status, offset, limit: 20 },
      })
    ),
  payoutAction: (id: string, action: string, reason: string, key: string) =>
    request(
      apiClient.post(
        `/admin/payouts/${encodeURIComponent(id)}/${action}`,
        { reason },
        moneyHeaders(key)
      )
    ),
  batchApprove: (ids: string[], key: string) =>
    request(apiClient.post('/admin/payouts/batch-approve', { ids }, moneyHeaders(key))),
  drivers: (q: string) =>
    request(
      apiClient.get<{ users: { id: string; name: string }[]; total: number }>(
        '/admin/users',
        { params: { role: 'driver', q, limit: 20, offset: 0 } }
      )
    ),
  wallet: (id: string, offset = 0) =>
    request(
      apiClient.get<Page<Ledger, 'ledger'> & { wallet: Wallet }>(
        `/admin/wallets/${encodeURIComponent(id)}`,
        { params: { offset, limit: 20 } }
      )
    ),
  adjust: (id: string, amount: number, reason: string, key: string) =>
    request(
      apiClient.post(
        `/admin/wallets/${encodeURIComponent(id)}/adjust`,
        { amount, reason },
        moneyHeaders(key)
      )
    ),
  settings: (offset = 0) =>
    request(
      apiClient.get<
        Page<CommissionRule, 'commission_rules'> & {
          settings: Settings
          history: Settings[]
          history_total: number
        }
      >('/admin/payment-settings', { params: { offset, limit: 20 } })
    ),
  updateSettings: (settings: Settings, rules: CommissionRule[]) =>
    request(
      apiClient.put('/admin/payment-settings', { ...settings, commission_rules: rules })
    ),
  runs: (offset = 0) =>
    request(
      apiClient.get<Page<Run, 'runs'>>('/admin/reconciliation/runs', {
        params: { offset, limit: 20 },
      })
    ),
  exceptions: (offset = 0) =>
    request(
      apiClient.get<Page<Exception, 'exceptions'>>('/admin/reconciliation/exceptions', {
        params: { offset, limit: 20 },
      })
    ),
  run: (key: string) =>
    request(apiClient.post('/admin/reconciliation/run', {}, moneyHeaders(key))),
  resolve: (id: string, note: string) =>
    request(
      apiClient.post(
        `/admin/reconciliation/exceptions/${encodeURIComponent(id)}/resolve`,
        { note }
      )
    ),
  summary: () =>
    request(
      apiClient.get<{
        gmv: number
        commission: number
        pending_payouts: number
        refunds: number
        daily: { date: string; gmv: number; commission: number }[]
      }>('/admin/payments/summary')
    ),
  csv: () =>
    request(apiClient.get<Blob>('/admin/payments/export', { responseType: 'blob' })),
}
