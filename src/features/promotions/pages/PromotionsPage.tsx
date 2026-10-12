import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QueryError } from '@/components/feedback/QueryError'
import { promoService } from '../promo.service'
import { discountLabel, money } from '../utils'
import { usePromoText } from '../i18n'
import { usePromoWriteAccess } from '../access'
import type { Promo } from '../types'
import { PromoActions } from '../components/PromoActions'
import {
  CodeCopy,
  DateLabel,
  Empty,
  Pagination,
  PromoSkeleton,
  ReadOnlyNotice,
  ResponsiveTable,
  StatusBadge,
} from '../components/shared'
import { useDebounced } from '../hooks'
import '../promotions.css'

function AudienceBadge({ promo }: { promo: Promo }) {
  const t = usePromoText()
  const detail = useQuery({
    queryKey: ['promotions', 'detail', promo.id],
    queryFn: () => promoService.detail(promo.id),
    enabled: promo.audience === 'selected',
  })
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
      {promo.audience === 'all' ? (
        t('All passengers')
      ) : detail.isPending ? (
        t('Loading…')
      ) : detail.isError ? (
        <button className="underline" onClick={() => void detail.refetch()}>
          {t('Retry audience count')}
        </button>
      ) : (
        t('{count} passengers', { count: detail.data.audience_count || 0 })
      )}
    </span>
  )
}
export default function PromotionsPage() {
  const t = usePromoText(),
    write = usePromoWriteAccess()
  const [q, setQ] = useState(''),
    [status, setStatus] = useState(''),
    [audience, setAudience] = useState(''),
    [offset, setOffset] = useState(0)
  const search = useDebounced(q)
  const list = useQuery({
    queryKey: ['promotions', 'list', { q: search, status, audience, offset }],
    queryFn: () => promoService.list({ q: search, status, audience, limit: 20, offset }),
    staleTime: 30_000,
  })
  const stats = useQuery({
    queryKey: ['promotions', 'summary'],
    queryFn: () => promoService.summary(),
    staleTime: 60_000,
  })
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#172B36]">{t('Promotions')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Give passengers a reason to take their next ride.')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/promotions/referrals">{t('Referrals')}</Link>
          </Button>
          {write && (
            <Button asChild>
              <Link to="/promotions/new">{t('Create promo')}</Link>
            </Button>
          )}
        </div>
      </header>
      <ReadOnlyNotice />
      {stats.isPending ? (
        <PromoSkeleton />
      ) : stats.isError ? (
        <QueryError error={stats.error} retry={() => void stats.refetch()} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [t('Active'), stats.data.active],
            [t('Scheduled'), stats.data.scheduled],
            [t('Expired'), stats.data.expired],
            [t('Total discount given'), money(stats.data.discount)],
          ].map(([label, value]) => (
            <section key={label} className="rounded-xl border bg-white p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-[#172B36]">{value}</p>
            </section>
          ))}
        </div>
      )}
      <section className="space-y-4 rounded-xl border bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-48 flex-1">
            <Label htmlFor="promo-search">{t('Search by code or title')}</Label>
            <Input
              id="promo-search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setOffset(0)
              }}
            />
          </div>
          <div>
            <Label htmlFor="promo-audience-filter">{t('Audience')}</Label>
            <select
              id="promo-audience-filter"
              className="promo-select"
              value={audience}
              onChange={(e) => {
                setAudience(e.target.value)
                setOffset(0)
              }}
            >
              <option value="">{t('All')}</option>
              <option value="all">{t('All passengers')}</option>
              <option value="selected">{t('Selected passengers')}</option>
            </select>
          </div>
        </div>
        <Tabs
          value={status || 'all'}
          onValueChange={(s) => {
            setStatus(s === 'all' ? '' : s)
            setOffset(0)
          }}
        >
          <TabsList
            aria-label={t('Promo status')}
            className="h-auto flex-wrap justify-start"
          >
            {['all', 'active', 'scheduled', 'paused', 'expired', 'archived'].map((s) => (
              <TabsTrigger key={s} value={s}>
                {t(s.replace(/^./, (c) => c.toUpperCase()))}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {list.isPending ? (
          <PromoSkeleton />
        ) : list.isError ? (
          <QueryError error={list.error} retry={() => void list.refetch()} />
        ) : (
          <>
            {list.data.promos.length === 0 ? (
              <Empty message="No promotions found" />
            ) : (
              <ResponsiveTable
                label={t('Promotions')}
                columns={[
                  'Code',
                  'Title',
                  'Discount',
                  'Audience',
                  'Usage',
                  'Validity',
                  'Status',
                  'Actions',
                ].map((c) => t(c))}
                rows={list.data.promos.map((p) => ({
                  id: p.id,
                  cells: [
                    <CodeCopy code={p.code} />,
                    <Link
                      className="font-medium text-brand-primary-teal hover:underline"
                      to={`/promotions/${p.id}`}
                    >
                      {p.title}
                    </Link>,
                    discountLabel(p, t),
                    <AudienceBadge promo={p} />,
                    <div className="min-w-24">
                      <span>
                        {p.redeemed_count} / {p.max_redemptions ?? t('Unlimited')}
                      </span>
                      {p.max_redemptions !== null && (
                        <progress
                          className="mt-1 block h-2 w-full accent-teal-600"
                          aria-label={t('Usage')}
                          value={p.redeemed_count}
                          max={p.max_redemptions}
                        />
                      )}
                    </div>,
                    <div>
                      <DateLabel value={p.starts_at} />
                      <span className="block text-xs text-muted-foreground">
                        {t('Expires')} <DateLabel value={p.expires_at} />
                      </span>
                    </div>,
                    <StatusBadge status={p.effective_status} />,
                    <PromoActions promo={p} menu />,
                  ],
                }))}
              />
            )}
            <Pagination total={list.data.total} offset={offset} onChange={setOffset} />
          </>
        )}
      </section>
    </main>
  )
}
