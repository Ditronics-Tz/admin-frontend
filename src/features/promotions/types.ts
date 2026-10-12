export type DiscountType = 'percent' | 'fixed'
export type PromoStatus = 'draft' | 'active' | 'paused' | 'archived'
export type EffectiveStatus = PromoStatus | 'scheduled' | 'expired'
export interface Promo {
  id: string
  code: string
  title: string
  description: string
  discount_type: DiscountType
  discount_value: number
  max_discount: number | null
  min_fare: number
  audience: 'all' | 'selected'
  first_ride_only: boolean
  starts_at: string
  expires_at: string
  max_redemptions: number | null
  max_per_user: number
  redeemed_count: number
  total_discount_given?: number
  audience_count?: number
  status: PromoStatus
  effective_status: EffectiveStatus
  created_at: string
}
export type PromoInput = Omit<
  Promo,
  | 'id'
  | 'redeemed_count'
  | 'total_discount_given'
  | 'audience_count'
  | 'effective_status'
  | 'created_at'
> & { audience_user_ids?: string[] }
export type PromoPatch = Partial<Omit<PromoInput, 'status' | 'audience_user_ids'>>
export interface Passenger {
  id: string
  name: string
  phone?: string
  email: string
  role: string
}
export interface AudienceMember {
  promo_id: string
  user_id: string
  granted_at: string
  notified_at: string | null
  user: Passenger
}
export interface AudienceInput {
  user_ids: string[]
  phones: string[]
  emails: string[]
}
export interface AudienceResult {
  added: number
  already_present: number
  not_found: string[]
  not_passengers: string[]
}
export interface Redemption {
  id: string
  promo_id: string
  user_id: string
  ride_id: string | null
  discount_amount: number
  status: 'reserved' | 'applied' | 'released'
  created_at: string
}
export interface ReferralSettings {
  enabled: boolean
  referee_reward_type: DiscountType
  referee_reward_value: number
  referrer_reward_type: DiscountType
  referrer_reward_value: number
  qualifying_min_fare: number
  max_rewards_per_referrer: number
  reward_valid_days: number
}
export interface Referral {
  id: string
  referrer_id: string
  referee_id: string
  status: 'pending' | 'qualified' | 'rewarded' | 'rejected'
  reject_reason: string
  referrer_reward_status: 'none' | 'issued' | 'pending_wallet'
  created_at: string
}
export interface Page {
  total: number
  limit: number
  offset: number
}
export interface PromoPage extends Page {
  promos: Promo[]
}
export interface AudiencePage extends Page {
  audience: AudienceMember[]
}
export interface RedemptionPage extends Page {
  redemptions: Redemption[]
}
export interface ReferralPage extends Page {
  referrals: Referral[]
}
export interface PassengerPage extends Page {
  users: Passenger[]
}
export interface UserPromos {
  granted: Promo[]
  redemptions: Redemption[]
}
export interface PromoFilters {
  status?: string
  audience?: string
  q?: string
  limit?: number
  offset?: number
}
