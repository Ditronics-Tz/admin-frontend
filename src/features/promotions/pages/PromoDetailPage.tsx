import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { QueryError } from '@/components/feedback/QueryError'
import { promoService } from '../promo.service'
import { usePromoText } from '../i18n'
import { usePromoWriteAccess } from '../access'
import { discountLabel, money } from '../utils'
import type { AudienceResult } from '../types'
import { PromoActions } from '../components/PromoActions'
import { AudiencePanel } from '../components/AudiencePanel'
import { AudienceReport } from '../components/AudiencePicker'
import { RedemptionsPanel } from '../components/RedemptionsPanel'
import {
  CodeCopy,
  ConfirmDialog,
  DateLabel,
  PromoHeading,
  PromoSkeleton,
  ReadOnlyNotice,
  StatusBadge,
} from '../components/shared'
import '../promotions.css'

export default function PromoDetailPage() {
  const { id = '' } = useParams(),
    t = usePromoText(),
    write = usePromoWriteAccess(),
    cache = useQueryClient(),
    location = useLocation()
  const [share, setShare] = useState(false)
  const query = useQuery({
    queryKey: ['promotions', 'detail', id],
    queryFn: () => promoService.detail(id),
    staleTime: 30_000,
  })
  const mutation = useMutation({
    mutationFn: () => promoService.share(id),
    onSuccess: async (result) => {
      setShare(false)
      await cache.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(
        t('Notifications accepted for {count} passengers.', {
          count: result.notified_count,
        })
      )
    },
  })
  const report = (location.state as { audienceReport?: AudienceResult } | null)
    ?.audienceReport
  if (query.isPending)
    return (
      <main className="p-6">
        <PromoSkeleton />
      </main>
    )
  if (query.isError)
    return (
      <main className="p-6">
        <QueryError error={query.error} retry={() => void query.refetch()} />
      </main>
    )
  const p = query.data
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PromoHeading title={p.title}>
        <PromoActions promo={p} />
        {write && (
          <Button
            disabled={p.effective_status !== 'active'}
            title={
              p.effective_status !== 'active'
                ? t('Only active promos can be shared')
                : undefined
            }
            onClick={() => {
              mutation.reset()
              setShare(true)
            }}
          >
            {t('Share with audience')}
          </Button>
        )}
      </PromoHeading>
      <div className="flex flex-wrap items-center gap-3">
        <CodeCopy code={p.code} />
        <StatusBadge status={p.effective_status} />
      </div>
      <ReadOnlyNotice />
      {!write && mutation.isError && <QueryError error={mutation.error} />}
      {report && <AudienceReport result={report} />}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('Overview')}</TabsTrigger>
          {p.audience === 'selected' && (
            <TabsTrigger value="audience">{t('Audience')}</TabsTrigger>
          )}
          <TabsTrigger value="redemptions">{t('Redemptions')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              [t('Redemptions'), p.redeemed_count],
              [t('Total discount given'), money(p.total_discount_given || 0)],
              [t('Audience'), t('{count} passengers', { count: p.audience_count || 0 })],
            ].map(([label, value]) => (
              <section key={label} className="rounded-xl border bg-white p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </section>
            ))}
          </div>
          <section className="space-y-4 rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold">{t('Promo rules')}</h2>
            <p className="whitespace-pre-wrap">{p.description}</p>
            <p className="text-lg font-medium text-brand-primary-teal">
              {discountLabel(p, t)}
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm">
              <li>{t('Minimum fare: {amount}', { amount: money(p.min_fare) })}</li>
              <li>
                {p.audience === 'all'
                  ? t('Available to all passengers.')
                  : t('Only selected passengers can use this code.')}
              </li>
              <li>{t('Up to {count} uses per passenger.', { count: p.max_per_user })}</li>
              <li>
                {p.max_redemptions === null
                  ? t('No total redemption limit.')
                  : t('Up to {count} total uses.', { count: p.max_redemptions })}
              </li>
              {p.first_ride_only && <li>{t('First completed ride only')}</li>}
            </ul>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t('Starts')}</dt>
                <dd>
                  <DateLabel value={p.starts_at} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('Expires')}</dt>
                <dd>
                  <DateLabel value={p.expires_at} relative />
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              {t(
                'Dates are shown in Africa/Dar_es_Salaam (EAT). Reserved uses count towards the limits.'
              )}
            </p>
          </section>
        </TabsContent>
        {p.audience === 'selected' && (
          <TabsContent value="audience" className="rounded-xl border bg-white p-5">
            <AudiencePanel id={id} />
          </TabsContent>
        )}
        <TabsContent value="redemptions" className="rounded-xl border bg-white p-5">
          <RedemptionsPanel id={id} />
        </TabsContent>
      </Tabs>
      {share && write && (
        <ConfirmDialog
          title={t('Notify {count} passengers?', {
            count: (p.audience_count || 0).toLocaleString(),
          })}
          description={t(
            'Share this promo with the current audience. Sending again may notify the same passengers again.'
          )}
          pending={mutation.isPending}
          error={mutation.error}
          onClose={() => setShare(false)}
          onConfirm={() => {
            if (write) mutation.mutate()
          }}
        />
      )}
    </main>
  )
}
