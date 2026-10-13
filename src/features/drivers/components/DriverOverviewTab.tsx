import type { Driver } from '../types/driver.types'
import { formatDateTime } from '@/lib/utils/formatters'
export function DriverOverviewTab({ driver }: { driver: Driver }) {
  const fields = [
    ['Name', driver.fullName],
    ['Email', driver.email],
    ['Account status', driver.accountStatus],
    [
      'Driver profile created',
      driver.joinedAt ? formatDateTime(driver.joinedAt) : 'Not available',
    ],
    ['Plate number', driver.vehicle.plateNumber],
    [
      'Vehicle card',
      driver.vehicle.id.startsWith('veh-') ? 'Not collected' : driver.vehicle.id,
    ],
    [
      'Rating',
      driver.rating === null
        ? 'No ratings yet'
        : `${driver.rating.toFixed(2)} / 5 (${driver.ratingCount} reviews)`,
    ],
  ]
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Driver profile</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        Location, trip totals, earnings, and dispatch performance are not collected by the
        current service.
      </p>
    </section>
  )
}
