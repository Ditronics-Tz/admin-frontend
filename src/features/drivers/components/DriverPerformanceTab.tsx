import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import type { Driver } from '../types/driver.types'

interface DriverPerformanceTabProps {
  driver: Driver
}

export const DriverPerformanceTab: React.FC<DriverPerformanceTabProps> = ({
  driver,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Rating Breakdown */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-[#172B36]">
              Customer Rating Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#172B36]">
                {driver.rating ? driver.rating.toFixed(2) : '—'}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    driver.rating && star <= Math.round(driver.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-slate-500 font-medium">
                {driver.ratingCount} total reviews
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Quality standard requires maintaining 4.5+ rating in Dar es Salaam.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-[#172B36]">
              Dispatch Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">
                {driver.acceptanceRate}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${driver.acceptanceRate}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              High acceptance ensures priority dispatch allocation during peak hours.
            </p>
          </CardContent>
        </Card>

        {/* Cancellation Rate */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-[#172B36]">
              Ride Cancellation Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold ${
                  driver.cancellationRate > 5 ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {driver.cancellationRate}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  driver.cancellationRate > 5 ? 'bg-rose-500' : 'bg-slate-400'
                }`}
                style={{ width: `${Math.min(100, driver.cancellationRate * 5)}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Target maximum cancellation threshold is 5.0%.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
