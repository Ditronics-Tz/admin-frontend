export function DriverRidesTab({ driverId: _driverId }: { driverId: string }) {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Ride history unavailable</h2>
      <p className="text-sm text-muted-foreground">
        The current service does not provide ride history for individual drivers.
      </p>
    </section>
  )
}
