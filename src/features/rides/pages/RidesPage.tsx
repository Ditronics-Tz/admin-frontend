import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { rideService } from '../services/ride.service'
import { RideRows } from '../components/RideRows'
import { FilterBar } from '@/components/common/DataTable'
import { Pagination, PromoSkeleton, Empty } from '@/features/promotions/components/shared'
import { QueryError } from '@/components/feedback/QueryError'
import { Select } from '@/features/operations/shared'
import { Input } from '@/components/ui/input'
import { useShipText } from '@/components/common/ship-text'
export default function RidesPage() {
  const t = useShipText(),
    [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    from: '',
    to: '',
    passenger: '',
    driver: '',
  })
  const params = { ...filters, offset, limit: 20 }
  const query = useQuery({
    queryKey: ['rides', params],
    queryFn: () => rideService.list(params),
    retry: false,
  })
  const change = (key: keyof typeof filters, value: string) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
    setOffset(0)
  }
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <h1 className="text-2xl font-bold">{t('Rides')}</h1>
      <FilterBar q={filters.q} onSearch={(value) => change('q', value)}>
        <Select
          label={t('Status')}
          value={filters.status}
          options={[
            '',
            'requested',
            'offered',
            'accepted',
            'arrived',
            'in_progress',
            'completed',
            'cancelled',
            'timed_out',
          ]}
          onChange={(value) => change('status', value)}
        />
        {(['passenger', 'driver', 'from', 'to'] as const).map((field) => (
          <label className="grid gap-1 text-sm" key={field}>
            {t(field[0].toUpperCase() + field.slice(1))}
            <Input
              type={['from', 'to'].includes(field) ? 'date' : 'text'}
              value={filters[field]}
              onChange={(event) => change(field, event.target.value)}
            />
          </label>
        ))}
      </FilterBar>
      <section className="space-y-4 rounded-xl border bg-white p-4">
        {query.isPending ? (
          <PromoSkeleton />
        ) : query.isError ? (
          <QueryError error={query.error} retry={() => void query.refetch()} />
        ) : (
          <>
            {query.data.rides.length ? (
              <RideRows rides={query.data.rides} />
            ) : (
              <Empty message={t('No rides found')} />
            )}
            <Pagination
              total={query.data.total}
              limit={20}
              offset={offset}
              onChange={setOffset}
            />
          </>
        )}
      </section>
    </div>
  )
}
