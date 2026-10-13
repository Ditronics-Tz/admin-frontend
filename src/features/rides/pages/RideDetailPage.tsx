import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { rideService } from '../services/ride.service'
import { RideMap } from '../components/RideMap'
import { ReasonDialog, StatusBadge } from '@/components/common/ReasonDialog'
import { PromoSkeleton, Empty } from '@/features/promotions/components/shared'
import { QueryError } from '@/components/feedback/QueryError'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'

export default function RideDetailPage() {
  const { id } = useParams()
  return id ? <RideDetail key={id} id={id} /> : <Empty message="Ride not found" />
}
function RideDetail({ id }: { id: string }) {
  const t = useShipText(),
    cache = useQueryClient(),
    { canWrite } = usePermission()
  const query = useQuery({
    queryKey: ['ride-detail', id],
    queryFn: () => rideService.get(id),
    refetchInterval: 30000,
    retry: false,
  })
  const [dialog, setDialog] = useState<'cancel' | 'reassign' | null>(null),
    [driver, setDriver] = useState('')
  const mutation = useMutation({
    mutationFn: (reason: string) =>
      dialog === 'cancel'
        ? rideService.cancel(id, reason)
        : rideService.reassign(id, driver.trim(), reason),
    onSuccess: async () => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: ['ride-detail', id] }),
        cache.invalidateQueries({ queryKey: ['rides'] }),
        cache.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ])
      setDialog(null)
      toast.success(t('Ride updated'))
    },
    onError: (error) => toast.error(error.message),
  })
  if (query.isPending)
    return (
      <div className="p-5">
        <PromoSkeleton />
      </div>
    )
  if (query.isError)
    return (
      <div className="p-5">
        <QueryError error={query.error} retry={() => void query.refetch()} />
      </div>
    )
  const ride = query.data,
    terminal = ['completed', 'cancelled', 'timed_out'].includes(ride.status)
  const fare = (value: number | null | undefined) =>
    typeof value === 'number' && Number.isFinite(value)
      ? `TSh ${value.toLocaleString('en-TZ')}`
      : t('Unavailable')
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Link className="text-primary underline" to="/rides">
        {t('Back to rides')}
      </Link>
      <h1 className="break-all text-2xl font-bold">
        {t('Ride')} {ride.id}
      </h1>
      <StatusBadge status={ride.status} />
      <dl className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-2">
        {[
          ['Passenger', `${ride.passenger.name} (${ride.passenger.id})`],
          [
            'Driver',
            ride.driver ? `${ride.driver.name} (${ride.driver.id})` : t('Unassigned'),
          ],
          ['Pickup', ride.pickup.address],
          ['Dropoff', ride.dropoff.address],
          ['Vehicle type', ride.vehicle_type],
          ['Estimated fare', fare(ride.estimated_fare)],
          ['Final fare', fare(ride.final_fare)],
          ['Created', formatDateTime(ride.created_at)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{t(label)}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          disabled={!canWrite || terminal || mutation.isPending}
          onClick={() => {
            mutation.reset()
            setDialog('cancel')
          }}
        >
          {t('Cancel ride')}
        </Button>
        <Button
          variant="outline"
          disabled={
            !canWrite ||
            terminal ||
            ['in_progress', 'arrived'].includes(ride.status) ||
            mutation.isPending
          }
          onClick={() => {
            mutation.reset()
            setDriver('')
            setDialog('reassign')
          }}
        >
          {t('Reassign driver')}
        </Button>
      </div>
      <RideMap pickup={ride.pickup} dropoff={ride.dropoff} />
      <section className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">{t('Ride timeline')}</h2>
        {ride.events.length ? (
          <ol className="divide-y">
            {ride.events.map((event, index) => (
              <li key={`${event.at}:${index}`} className="py-3">
                <strong>{event.type.replaceAll('_', ' ')}</strong>
                <p className="text-sm">
                  {event.actor_type} · {formatDateTime(event.at)}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <Empty message={t('No events yet')} />
        )}
      </section>
      {dialog && (
        <ReasonDialog
          title={t(dialog === 'cancel' ? 'Cancel ride' : 'Reassign driver')}
          canConfirm={canWrite && (dialog !== 'reassign' || !!driver.trim())}
          pending={mutation.isPending}
          error={mutation.error}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => {
            if (canWrite) mutation.mutate(reason)
          }}
        >
          {dialog === 'reassign' && (
            <label className="grid gap-1 text-sm">
              {t('Driver ID')}
              <Input
                required
                value={driver}
                onChange={(event) => setDriver(event.target.value)}
              />
            </label>
          )}
        </ReasonDialog>
      )}
    </main>
  )
}
