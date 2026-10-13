import { Link } from 'react-router-dom'
import type { RideRecord } from '../services/ride.service'
import { ResponsiveTable, StatusBadge } from '@/features/promotions/components/shared'
import { formatDateTime } from '@/lib/utils/formatters'
import { useShipText } from '@/components/common/ship-text'

export function RideRows({ rides }: { rides: RideRecord[] }) {
  const t = useShipText()
  return (
    <div className="overflow-x-auto">
      <ResponsiveTable
        label={t('Rides')}
        columns={['Ride', 'Status', 'Passenger', 'Driver', 'Created'].map(t)}
        rows={rides.map((ride) => ({
          id: ride.id,
          cells: [
            <Link
              className="text-primary underline"
              to={`/rides/${encodeURIComponent(ride.id)}`}
            >
              {ride.id}
            </Link>,
            <StatusBadge status={ride.status} />,
            ride.passenger?.name || '—',
            ride.driver?.name || t('Unassigned'),
            formatDateTime(ride.created_at),
          ],
        }))}
      />
    </div>
  )
}
