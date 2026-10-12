import { apiClient } from '@/lib/api/client'
import { promoRequest } from './access'
import type {
  AudienceInput,
  AudiencePage,
  AudienceResult,
  Passenger,
  PassengerPage,
  Promo,
  PromoFilters,
  PromoInput,
  PromoPage,
  PromoPatch,
  RedemptionPage,
  ReferralPage,
  ReferralSettings,
  UserPromos,
} from './types'

const path = (id: string) => `/admin/promos/${encodeURIComponent(id)}`
export const promoService = {
  list: (params: PromoFilters = {}) =>
    promoRequest(apiClient.get<PromoPage>('/admin/promos', { params })),
  detail: (id: string) => promoRequest(apiClient.get<Promo>(path(id))),
  create: (body: PromoInput) =>
    promoRequest(apiClient.post<Promo>('/admin/promos', body)),
  update: (id: string, body: PromoPatch) =>
    promoRequest(apiClient.patch<Promo>(path(id), body)),
  action: (id: string, action: 'pause' | 'resume' | 'archive') =>
    promoRequest(apiClient.post<Promo>(`${path(id)}/${action}`)),
  share: (id: string) =>
    promoRequest(apiClient.post<{ notified_count: number }>(`${path(id)}/share`)),
  audience: (id: string, q = '', limit = 20, offset = 0) =>
    promoRequest(
      apiClient.get<AudiencePage>(`${path(id)}/audience`, {
        params: { q, limit, offset },
      })
    ),
  addAudience: (id: string, input: AudienceInput) =>
    promoRequest(apiClient.post<AudienceResult>(`${path(id)}/audience`, input)),
  removeAudience: (id: string, userId: string) =>
    promoRequest(
      apiClient.delete<{ message: string }>(
        `${path(id)}/audience/${encodeURIComponent(userId)}`
      )
    ),
  redemptions: (id: string, limit = 20, offset = 0) =>
    promoRequest(
      apiClient.get<RedemptionPage>(`${path(id)}/redemptions`, {
        params: { limit, offset },
      })
    ),
  passengers: (q = '', limit = 20, offset = 0) =>
    promoRequest(
      apiClient.get<PassengerPage>('/admin/users', {
        params: { role: 'passenger', q, limit, offset },
      })
    ),
  user: async (id: string): Promise<Passenger> =>
    (
      await promoRequest(
        apiClient.get<{ user: Passenger }>(`/admin/users/${encodeURIComponent(id)}`)
      )
    ).user,
  userPromos: (id: string) =>
    promoRequest(
      apiClient.get<UserPromos>(`/admin/users/${encodeURIComponent(id)}/promos`)
    ),
  settings: () =>
    promoRequest(apiClient.get<ReferralSettings>('/admin/referral-settings')),
  saveSettings: (body: ReferralSettings) =>
    promoRequest(apiClient.put<ReferralSettings>('/admin/referral-settings', body)),
  referrals: (status = '', limit = 20, offset = 0) =>
    promoRequest(
      apiClient.get<ReferralPage>('/admin/referrals', {
        params: { status, limit, offset },
      })
    ),
  // The contract has no aggregate endpoint. Paginate every promo and read applied
  // discount totals from detail responses, with bounded request concurrency.
  async summary() {
    const promos: Promo[] = []
    let offset = 0
    let hasMore: boolean
    do {
      const page = await promoService.list({ limit: 100, offset })
      promos.push(...page.promos)
      offset += page.promos.length
      hasMore = offset < page.total && page.promos.length > 0
    } while (hasMore)
    let discount = 0
    for (let i = 0; i < promos.length; i += 6) {
      const details = await Promise.all(
        promos.slice(i, i + 6).map((p) => promoService.detail(p.id))
      )
      for (const p of details) discount += p.total_discount_given || 0
    }
    return {
      active: promos.filter((p) => p.effective_status === 'active').length,
      scheduled: promos.filter((p) => p.effective_status === 'scheduled').length,
      expired: promos.filter((p) => p.effective_status === 'expired').length,
      discount,
    }
  },
}
