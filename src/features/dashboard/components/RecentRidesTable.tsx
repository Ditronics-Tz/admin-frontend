import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatTZS, formatDateTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

export type RideStatus = 'ongoing' | 'completed' | 'cancelled' | 'pending'

export interface RideRecord {
  id: string
  customerName: string
  customerPhone: string
  driverName: string
  vehiclePlate: string
  pickupLocation: string
  destinationLocation: string
  fareAmount: number
  status: RideStatus
  timestamp: string
}

const SAMPLE_RIDES: RideRecord[] = [
  {
    id: 'RD-8942',
    customerName: 'Juma Mwamburi',
    customerPhone: '+255 754 123 456',
    driverName: 'Emanuel Mushi',
    vehiclePlate: 'T 482 DKE',
    pickupLocation: 'Kariakoo Market',
    destinationLocation: 'Julius Nyerere Int. Airport (JNIA)',
    fareAmount: 22500,
    status: 'completed',
    timestamp: '2026-10-10T15:20:00Z',
  },
  {
    id: 'RD-8941',
    customerName: 'Fatma Said',
    customerPhone: '+255 713 987 654',
    driverName: 'Baraka Kimaro',
    vehiclePlate: 'T 319 BMZ',
    pickupLocation: 'Masaki Peninsula',
    destinationLocation: 'Posta Mpya, CBD',
    fareAmount: 14000,
    status: 'ongoing',
    timestamp: '2026-10-10T15:35:00Z',
  },
  {
    id: 'RD-8940',
    customerName: 'Kelvin Temba',
    customerPhone: '+255 682 334 112',
    driverName: 'Rashid Bakari',
    vehiclePlate: 'T 704 CRX',
    pickupLocation: 'Mlimani City Mall',
    destinationLocation: 'Mwenge Bus Stand',
    fareAmount: 6500,
    status: 'completed',
    timestamp: '2026-10-10T15:05:00Z',
  },
  {
    id: 'RD-8939',
    customerName: 'Amina Selemani',
    customerPhone: '+255 765 890 234',
    driverName: 'Hassan Nyoni',
    vehiclePlate: 'T 551 DJK',
    pickupLocation: 'Ubungo Maji',
    destinationLocation: 'Sinza Palestina Hospital',
    fareAmount: 5000,
    status: 'pending',
    timestamp: '2026-10-10T15:42:00Z',
  },
  {
    id: 'RD-8938',
    customerName: 'David Makundi',
    customerPhone: '+255 784 445 678',
    driverName: 'John Mbise',
    vehiclePlate: 'T 910 AEQ',
    pickupLocation: 'Mikocheni B',
    destinationLocation: 'Oysterbay Police Station',
    fareAmount: 8500,
    status: 'cancelled',
    timestamp: '2026-10-10T14:48:00Z',
  },
]

const STATUS_CONFIG: Record<RideStatus, { label: string; className: string }> = {
  ongoing: {
    label: 'Ongoing',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
}

export const RecentRidesTable: React.FC = () => {
  return (
    <Card className="shadow-xs rounded-xl border border-slate-200/80 bg-white p-5">
      <CardHeader className="p-0 pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-[#172B36]">
                Recent Rides
              </CardTitle>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                Sample Stream
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Live ride transactions across Dar es Salaam metropolitan area.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">Showing 5 latest trips</span>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-1">
        {/* Horizontal scroll container for table */}
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 font-semibold text-[#64748B]">
              <tr>
                <th className="px-3.5 py-3">Ride ID</th>
                <th className="px-3.5 py-3">Customer</th>
                <th className="px-3.5 py-3">Driver</th>
                <th className="px-3.5 py-3">Pickup</th>
                <th className="px-3.5 py-3">Destination</th>
                <th className="px-3.5 py-3 text-right">Fare (TZS)</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                <th className="px-3.5 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {SAMPLE_RIDES.map((ride) => {
                const statusMeta = STATUS_CONFIG[ride.status]
                return (
                  <tr key={ride.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-3.5 py-3 font-semibold text-primary">
                      {ride.id}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3">
                      <div className="font-medium text-[#172B36]">
                        {ride.customerName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {ride.customerPhone}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3">
                      <div className="font-medium text-[#172B36]">{ride.driverName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {ride.vehiclePlate}
                      </div>
                    </td>
                    <td
                      className="max-w-[160px] truncate px-3.5 py-3 text-muted-foreground"
                      title={ride.pickupLocation}
                    >
                      {ride.pickupLocation}
                    </td>
                    <td
                      className="max-w-[160px] truncate px-3.5 py-3 text-muted-foreground"
                      title={ride.destinationLocation}
                    >
                      {ride.destinationLocation}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-right font-semibold text-[#172B36]">
                      {formatTZS(ride.fareAmount)}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                          statusMeta.className
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-right text-[11px] text-muted-foreground">
                      {formatDateTime(ride.timestamp, 'HH:mm')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
