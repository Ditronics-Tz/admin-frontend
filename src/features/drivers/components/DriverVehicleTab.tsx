import type { DriverVehicle } from '../types/driver.types'
export function DriverVehicleTab({ vehicle }: { vehicle: DriverVehicle }) {
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Vehicle information</h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Plate number</dt>
          <dd>{vehicle.plateNumber}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Vehicle card number</dt>
          <dd>{vehicle.id.startsWith('veh-') ? 'Not collected' : vehicle.id}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">
        Vehicle make, model, category, year, color, and inspection records are not
        collected by the current service.
      </p>
    </section>
  )
}
