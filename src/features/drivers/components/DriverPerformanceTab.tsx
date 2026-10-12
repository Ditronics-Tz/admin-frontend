import type { Driver } from '../types/driver.types'
export function DriverPerformanceTab({ driver }: { driver: Driver }) {
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Customer ratings</h2>
      <p className="text-2xl font-bold">
        {driver.rating === null ? 'No ratings yet' : `${driver.rating.toFixed(2)} / 5`}
      </p>
      <p className="text-sm">{driver.ratingCount} reviews</p>
      <p className="text-sm text-muted-foreground">
        Dispatch acceptance and cancellation metrics are not available.
      </p>
    </section>
  )
}
