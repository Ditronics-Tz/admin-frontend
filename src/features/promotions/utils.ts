import type { Promo, PromoInput, ReferralSettings, AudienceInput } from './types'

export const money = (value: number) =>
  `TSh ${new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(value)}`
export function relativeDate(value: string, locale: string) {
  const seconds = Math.round((Date.parse(value) - Date.now()) / 1000)
  if (!Number.isFinite(seconds)) return '—'
  for (const [unit, size] of [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ] as const) {
    if (Math.abs(seconds) >= size || size === 1)
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        Math.round(seconds / size),
        unit
      )
  }
}
export function promoDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Dar_es_Salaam',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}
export function localDateInput(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16)
}
export const dateInputISO = (value: string) => new Date(`${value}:00+03:00`).toISOString()
export function discountLabel(
  p: Pick<Promo, 'discount_type' | 'discount_value' | 'max_discount'>,
  t: (message: string, values?: Record<string, string | number>) => string = (
    s,
    values
  ) => s.replace(/\{(\w+)\}/g, (_, k) => String(values?.[k] ?? ''))
) {
  return p.discount_type === 'fixed'
    ? t('{amount} off', { amount: money(p.discount_value) })
    : t('{percent}% off', { percent: p.discount_value }) +
        (p.max_discount ? t(', up to {amount}', { amount: money(p.max_discount) }) : '')
}
export function generatePromoCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return (
    'RIDA-' +
    Array.from(bytes, (b) => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[b % 32]).join('')
  )
}
export function validatePromo(input: PromoInput): Record<string, string> {
  const fields: Record<string, string> = {}
  const integer = (
    field: string,
    value: number,
    min: number,
    max = Number.MAX_SAFE_INTEGER
  ) => {
    if (!Number.isSafeInteger(value) || value < min || value > max)
      fields[field] = `Enter a whole number from ${min} to ${max}.`
  }
  if (!/^[A-Z0-9-]{4,20}$/.test(input.code.trim().toUpperCase()))
    fields.code = 'Use 4–20 letters, digits or hyphens.'
  if (!input.title.trim() || input.title.length > 200)
    fields.title = 'Enter a title of 1–200 characters.'
  if (input.description.length > 4000)
    fields.description = 'Use no more than 4,000 characters.'
  if (!['fixed', 'percent'].includes(input.discount_type))
    fields.discount_type = 'Choose a discount type.'
  integer(
    'discount_value',
    input.discount_value,
    1,
    input.discount_type === 'percent' ? 100 : Number.MAX_SAFE_INTEGER
  )
  if (input.max_discount !== null) {
    integer('max_discount', input.max_discount, 1)
    if (input.discount_type !== 'percent')
      fields.max_discount = 'A cap is only available for percent discounts.'
  }
  integer('min_fare', input.min_fare, 0)
  integer('max_per_user', input.max_per_user, 1)
  if (input.max_redemptions !== null) integer('max_redemptions', input.max_redemptions, 1)
  if (!['all', 'selected'].includes(input.audience))
    fields.audience = 'Choose an audience.'
  const start = Date.parse(input.starts_at),
    end = Date.parse(input.expires_at)
  if (!Number.isFinite(start)) fields.starts_at = 'Enter a start date.'
  if (!Number.isFinite(end) || end <= start)
    fields.expires_at = 'Expiry must be after the start date.'
  return fields
}
export function validateSettings(s: ReferralSettings): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const who of ['referee', 'referrer'] as const) {
    const type = s[`${who}_reward_type`],
      value = s[`${who}_reward_value`]
    if (!['fixed', 'percent'].includes(type))
      fields[`${who}_reward_type`] = 'Choose a reward type.'
    if (
      !Number.isSafeInteger(value) ||
      value < (s.enabled || type === 'percent' ? 1 : 0) ||
      (type === 'percent' && value > 100)
    )
      fields[`${who}_reward_value`] =
        'Use a positive whole amount, or a percent from 1–100.'
  }
  for (const key of [
    'qualifying_min_fare',
    'max_rewards_per_referrer',
    'reward_valid_days',
  ] as const) {
    if (
      !Number.isSafeInteger(s[key]) ||
      s[key] < (key === 'qualifying_min_fare' ? 0 : 1) ||
      (key === 'reward_valid_days' && s[key] > 3650)
    )
      fields[key] = 'Enter a valid whole number.'
  }
  return fields
}
// Quoted CSV cells, comma/semicolon/tab separated files, or one value per line.
export function parseAudienceText(text: string): AudienceInput {
  const tokens = (text.match(/"(?:[^"]|"")*"|[^,;\r\n\t]+/g) || [])
    .map((s) => s.trim().replace(/^"|"$/g, '').replaceAll('""', '"'))
    .filter(Boolean)
  const phones = new Set<string>(),
    emails = new Set<string>()
  for (const token of tokens) {
    if (/^(phone|phones|email|emails|simu)$/i.test(token)) continue
    if (token.includes('@')) emails.add(token.toLowerCase())
    else phones.add(token.replace(/[\s()-]/g, ''))
  }
  return { user_ids: [], phones: [...phones], emails: [...emails] }
}
export function lockedPromoPatch(input: PromoInput, original: Promo) {
  const patch = {
    code: input.code,
    title: input.title,
    description: input.description,
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    max_discount: input.max_discount,
    min_fare: input.min_fare,
    audience: input.audience,
    first_ride_only: input.first_ride_only,
    starts_at: input.starts_at,
    expires_at: input.expires_at,
    max_redemptions: input.max_redemptions,
    max_per_user: input.max_per_user,
  }
  if (original.redeemed_count > 0) {
    delete (patch as Partial<PromoInput>).code
    delete (patch as Partial<PromoInput>).discount_type
    delete (patch as Partial<PromoInput>).discount_value
    delete (patch as Partial<PromoInput>).max_discount
    delete (patch as Partial<PromoInput>).audience
  }
  return patch
}
