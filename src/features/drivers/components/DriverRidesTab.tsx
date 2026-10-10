import React from 'react'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatTZS, formatDateTime } from '@/lib/utils/formatters'
import type { DriverTripSummary } from '../types/driver.types'

interface DriverRidesTabProps {
  driverId: string
}

// Sample recent trips for this driver
const SAMPLE_TRIPS: DriverTripSummary[] = [
  {
    id: 'trip-101',
    tripCode: 'RD-DSM-8821',
    customerName: 'Amina Salum',
    pickupLocation: 'Masaki, Toure Drive',
    dropoffLocation: 'Kariakoo Market, Congo St',
    fareTZS: 9500,
    status: 'completed',
    completedAt: '2026-10-10T14:15:00Z',
  },
  {
    id: 'trip-102',
    tripCode: 'RD-DSM-8819',
    customerName: 'Daniel Mrosso',
    pickupLocation: 'Posta, Samora Avenue',
    dropoffLocation: 'Sinza Mori, Shekilango Rd',
    fareTZS: 8200,
    status: 'completed',
    completedAt: '2026-10-10T11:40:00Z',
  },
  {
    id: 'trip-103',
    tripCode: 'RD-DSM-8815',
    customerName: 'Zawadi Khalfan',
    pickupLocation: 'Mlimani City Mall',
    dropoffLocation: 'Mwenge Bus Terminal',
    fareTZS: 4500,
    status: 'completed',
    completedAt: '2026-10-09T18:20:00Z',
  },
  {
    id: 'trip-104',
    tripCode: 'RD-DSM-8810',
    customerName: 'Joseph Kavishe',
    pickupLocation: 'Kivukoni Ferry Terminal',
    dropoffLocation: 'Kinondoni Manyanya',
    fareTZS: 7000,
    status: 'completed',
    completedAt: '2026-10-09T15:05:00Z',
  },
]

export const DriverRidesTab: React.FC<DriverRidesTabProps> = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#172B36]">
              Recent Completed Rides
            </h3>
            <span className="text-xs text-slate-500">
              Showing last {SAMPLE_TRIPS.length} operational dispatches
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 pl-6 pr-3">Trip ID</th>
                <th className="px-3 py-3">Rider</th>
                <th className="px-3 py-3">Route (Dar es Salaam)</th>
                <th className="px-3 py-3">Fare (TZS)</th>
                <th className="px-3 py-3">Status</th>
                <th className="py-3 pl-3 pr-6 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SAMPLE_TRIPS.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pl-6 pr-3 font-mono font-medium text-brand-primary-teal">
                    {trip.tripCode}
                  </td>
                  <td className="px-3 py-3 font-medium text-[#172B36]">
                    {trip.customerName}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col text-[11px]">
                      <span className="text-slate-700 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {trip.pickupLocation}
                      </span>
                      <span className="text-slate-500 pl-4">
                        ↳ {trip.dropoffLocation}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-800">
                    {formatTZS(trip.fareTZS)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="success" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Completed
                    </Badge>
                  </td>
                  <td className="py-3 pl-3 pr-6 text-right text-slate-500">
                    {formatDateTime(trip.completedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
