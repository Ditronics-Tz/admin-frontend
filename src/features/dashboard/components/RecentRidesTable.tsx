import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { rideService } from '@/features/rides/services/ride.service'
import { RideRows } from '@/features/rides/components/RideRows'
import { QueryError } from '@/components/feedback/QueryError'
import { PromoSkeleton, Empty } from '@/features/promotions/components/shared'
import { useShipText } from '@/components/common/ship-text'

export function RecentRidesTable() {
  const t = useShipText()
  const query = useQuery({
    queryKey: ['rides', 'recent'],
    queryFn: () => rideService.list({ limit: 5, offset: 0 }),
    retry: false,
  })
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <header className="flex flex-wrap justify-between gap-3">
        <h2 className="font-semibold">{t('Recent rides')}</h2>
        <Link className="text-primary underline" to="/rides">
          {t('View all rides')}
        </Link>
      </header>
      {query.isPending ? (
        <PromoSkeleton />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : query.data.rides.length ? (
        <RideRows rides={query.data.rides} />
      ) : (
        <Empty message={t('No rides found')} />
      )}
    </section>
  )
}
