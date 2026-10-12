import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QueryError } from '@/components/feedback/QueryError'
import { promoService } from '../promo.service'
import { usePromoText } from '../i18n'
import { discountLabel } from '../utils'
import { DateLabel, Empty, PromoSkeleton, StatusBadge } from './shared'
import { RedemptionTable } from './RedemptionsPanel'
import '../promotions.css'

export function PassengerPromos({ id }: { id: string }) {
  const t = usePromoText()
  const query = useQuery({
    queryKey: ['promotions', 'user', id],
    queryFn: () => promoService.userPromos(id),
  })
  return (
    <section className="space-y-3 border-t pt-4">
      <h2 className="text-lg font-semibold">{t('Promotions')}</h2>
      {query.isPending ? (
        <PromoSkeleton />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <h3 className="font-medium">{t('Granted promos')}</h3>
          {query.data.granted.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {query.data.granted.map((p) => (
                <li key={p.id} className="space-y-1 rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`/promotions/${p.id}`}
                      className="font-semibold text-brand-primary-teal hover:underline"
                    >
                      {p.code} — {p.title}
                    </Link>
                    <StatusBadge status={p.effective_status} />
                  </div>
                  <p>{discountLabel(p, t)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('Expires')}: <DateLabel value={p.expires_at} />
                  </p>
                </li>
              ))}
            </ul>
          )}
          <h3 className="font-medium">{t('Redemptions')}</h3>
          <RedemptionTable rows={query.data.redemptions} showPassenger={false} />
        </>
      )}
    </section>
  )
}
