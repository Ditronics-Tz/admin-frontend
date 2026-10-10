import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Radio, Clock, CheckCircle2, Navigation } from 'lucide-react'

interface StatusItem {
  title: string
  count: number
  description: string
  badgeText: string
  colorClasses: {
    bg: string
    text: string
    border: string
    indicator: string
  }
  icon: React.ElementType
}

const STATUS_ITEMS: StatusItem[] = [
  {
    title: 'Ongoing Rides',
    count: 142,
    description: 'Active trips currently in transit',
    badgeText: 'Active live',
    colorClasses: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-700',
      border: 'border-blue-200/80',
      indicator: 'bg-blue-500 animate-pulse',
    },
    icon: Navigation,
  },
  {
    title: 'Pending Requests',
    count: 28,
    description: 'Awaiting driver dispatch match',
    badgeText: 'Dispatch queue',
    colorClasses: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-700',
      border: 'border-amber-200/80',
      indicator: 'bg-amber-500',
    },
    icon: Clock,
  },
  {
    title: 'Available Drivers',
    count: 415,
    description: 'Online & ready for ride pickup',
    badgeText: 'Fleet ready',
    colorClasses: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-200/80',
      indicator: 'bg-emerald-500',
    },
    icon: Radio,
  },
  {
    title: 'Completed Rides',
    count: 2189,
    description: 'Completed successfully today',
    badgeText: 'Today total',
    colorClasses: {
      bg: 'bg-teal-50/70',
      text: 'text-teal-700',
      border: 'border-teal-200/80',
      indicator: 'bg-teal-600',
    },
    icon: CheckCircle2,
  },
]

export const OperationsStatus: React.FC = () => {
  return (
    <Card className="shadow-xs rounded-xl border border-slate-200/80 bg-white p-5">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#172B36]">
              Operations Status
            </CardTitle>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Live fleet readiness and ride dispatch pipeline across Tanzania service
              zones.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live Network
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className={`rounded-xl border ${item.colorClasses.border} ${item.colorClasses.bg} hover:shadow-xs p-4 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {item.title}
                  </span>
                  <div
                    className={`shadow-xs flex h-7 w-7 items-center justify-center rounded-lg bg-white ${item.colorClasses.text}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-[#172B36]">
                    {item.count.toLocaleString()}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${item.colorClasses.text}`}
                  >
                    {item.badgeText}
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
