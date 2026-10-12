import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QueryError } from '@/components/feedback/QueryError'
import { formatApiError } from '@/lib/api/errors'
import { promoService } from '../promo.service'
import { validateSettings } from '../utils'
import type { ReferralSettings } from '../types'
import { usePromoText } from '../i18n'
import { usePromoWriteAccess } from '../access'
import {
  DateLabel,
  Empty,
  Pagination,
  PromoHeading,
  PromoSkeleton,
  ReadOnlyNotice,
  ResponsiveTable,
  StatusBadge,
  UnsavedChanges,
  UserLabel,
} from '../components/shared'
import '../promotions.css'

export function ReferralSettingsForm({ initial }: { initial: ReferralSettings }) {
  const t = usePromoText(),
    write = usePromoWriteAccess(),
    cache = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isDirty },
  } = useForm<ReferralSettings>({ defaultValues: initial })
  const mutation = useMutation({
    mutationFn: (input: ReferralSettings) => promoService.saveSettings(input),
    onSuccess: async (result) => {
      reset(result)
      await cache.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('Referral settings saved'))
    },
    onError: (error) => {
      for (const [key, messages] of Object.entries(
        formatApiError(error).validationErrors || {}
      ))
        setError(key as keyof ReferralSettings, { message: messages[0] })
    },
  })
  const disabled = !write || mutation.isPending
  const submit = handleSubmit((input) => {
    clearErrors()
    const fields = validateSettings(input)
    for (const [key, message] of Object.entries(fields))
      setError(
        key as keyof ReferralSettings,
        { message: t(message) },
        { shouldFocus: true }
      )
    if (write && Object.keys(fields).length === 0) mutation.mutate(input)
  })
  return (
    <section className="space-y-4 rounded-xl border bg-white p-5">
      <h2 className="text-lg font-semibold">{t('Referral settings')}</h2>
      <UnsavedChanges dirty={isDirty} />
      <form onSubmit={submit} noValidate className="space-y-5">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            role="switch"
            disabled={disabled}
            {...register('enabled')}
          />
          {t('Enable referrals')}
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          {(['referee', 'referrer'] as const).map((who) => (
            <fieldset
              key={who}
              disabled={disabled}
              className="space-y-2 rounded-lg border p-4"
            >
              <legend className="px-1 font-medium">
                {t(
                  who === 'referee'
                    ? 'Reward for invited passenger'
                    : 'Reward for inviter'
                )}
              </legend>
              <Label htmlFor={`${who}-type`}>{t('Discount type')}</Label>
              <select
                id={`${who}-type`}
                className="promo-select"
                {...register(`${who}_reward_type`)}
              >
                <option value="fixed">{t('Fixed')}</option>
                <option value="percent">{t('Percent')}</option>
              </select>
              <Label htmlFor={`${who}-value`}>{t('Discount value')}</Label>
              <Input
                id={`${who}-value`}
                type="number"
                step="1"
                min="0"
                aria-invalid={!!errors[`${who}_reward_value`]}
                aria-describedby={
                  errors[`${who}_reward_value`] ? `${who}-error` : undefined
                }
                {...register(`${who}_reward_value`, { valueAsNumber: true })}
              />
              {errors[`${who}_reward_value`]?.message && (
                <p id={`${who}-error`} role="alert" className="text-xs text-destructive">
                  {errors[`${who}_reward_value`]?.message}
                </p>
              )}
            </fieldset>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ['qualifying_min_fare', 'Minimum qualifying fare'],
              ['max_rewards_per_referrer', 'Maximum rewards per inviter'],
              ['reward_valid_days', 'Reward validity (days)'],
            ] as const
          ).map(([key, label]) => (
            <div className="space-y-2" key={key}>
              <Label htmlFor={key}>{t(label)}</Label>
              <Input
                id={key}
                type="number"
                step="1"
                min={key === 'qualifying_min_fare' ? 0 : 1}
                max={key === 'reward_valid_days' ? 3650 : Number.MAX_SAFE_INTEGER}
                disabled={disabled}
                aria-invalid={!!errors[key]}
                aria-describedby={errors[key] ? `${key}-error` : undefined}
                {...register(key, { valueAsNumber: true })}
              />
              {errors[key]?.message && (
                <p id={`${key}-error`} role="alert" className="text-xs text-destructive">
                  {errors[key]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
        {mutation.isError && <QueryError error={mutation.error} />}
        <p className="text-sm text-muted-foreground">
          {t(
            'Rewards are single-use promo codes after the invited passenger’s first qualifying ride. Driver inviter rewards wait for wallet support.'
          )}
        </p>
        {write && (
          <Button disabled={disabled || !isDirty} type="submit">
            {t(mutation.isPending ? 'Saving…' : 'Save changes')}
          </Button>
        )}
      </form>
    </section>
  )
}
export default function ReferralsPage() {
  const t = usePromoText()
  const [status, setStatus] = useState(''),
    [offset, setOffset] = useState(0)
  const settings = useQuery({
    queryKey: ['promotions', 'referral-settings'],
    queryFn: () => promoService.settings(),
  })
  const list = useQuery({
    queryKey: ['promotions', 'referrals', status, offset],
    queryFn: () => promoService.referrals(status, 20, offset),
  })
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PromoHeading title={t('Referrals')} />
      <ReadOnlyNotice />
      {settings.isPending ? (
        <PromoSkeleton />
      ) : settings.isError ? (
        <QueryError error={settings.error} retry={() => void settings.refetch()} />
      ) : (
        <ReferralSettingsForm initial={settings.data} />
      )}
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('Referrals')}</h2>
          <div>
            <Label htmlFor="referral-status">{t('Status')}</Label>
            <select
              id="referral-status"
              value={status}
              className="promo-select"
              onChange={(e) => {
                setStatus(e.target.value)
                setOffset(0)
              }}
            >
              {['', 'pending', 'qualified', 'rewarded', 'rejected'].map((s) => (
                <option key={s} value={s}>
                  {s ? t(s.replace(/^./, (c) => c.toUpperCase())) : t('All')}
                </option>
              ))}
            </select>
          </div>
        </div>
        {list.isPending ? (
          <PromoSkeleton />
        ) : list.isError ? (
          <QueryError error={list.error} retry={() => void list.refetch()} />
        ) : (
          <>
            {list.data.referrals.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveTable
                label={t('Referrals')}
                columns={['Inviter', 'Invited', 'Status', 'Reward status', 'Date'].map(
                  (s) => t(s)
                )}
                rows={list.data.referrals.map((r) => ({
                  id: r.id,
                  cells: [
                    <UserLabel id={r.referrer_id} />,
                    <UserLabel id={r.referee_id} />,
                    <>
                      <StatusBadge status={r.status} />
                      {r.reject_reason && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {r.reject_reason.replaceAll('_', ' ')}
                        </span>
                      )}
                    </>,
                    <StatusBadge status={r.referrer_reward_status} />,
                    <DateLabel value={r.created_at} relative />,
                  ],
                }))}
              />
            )}
            <Pagination offset={offset} total={list.data.total} onChange={setOffset} />
          </>
        )}
      </section>
    </main>
  )
}
