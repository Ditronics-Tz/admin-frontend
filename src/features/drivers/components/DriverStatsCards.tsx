import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UsersRound, UserCheck, Clock3, UserX } from 'lucide-react'
import type { DriverStatistics } from '../types/driver.types'
import { Skeleton } from '@/components/ui/skeleton'

interface DriverStatsCardsProps {
  stats: DriverStatistics | undefined
  isLoading: boolean
}

export const DriverStatsCards: React.FC<DriverStatsCardsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-200/80 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="mt-3 h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const items = [
    {
      title: 'Total Drivers',
      value: stats?.totalDrivers ?? '—',
      description: 'Registered fleet drivers in Tanzania',
      icon: UsersRound,
      iconBg: 'bg-teal-50 text-brand-primary-teal',
    },
    {
      title: 'Active Accounts',
      value: stats?.activeDrivers ?? '—',
      description: 'Accounts marked active',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Pending Verification',
      value: stats?.pendingVerification ?? '—',
      description: 'Documents awaiting compliance review',
      icon: Clock3,
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Deactivated Accounts',
      value: stats?.deactivatedDrivers ?? '—',
      description: 'Accounts marked inactive',
      icon: UserX,
      iconBg: 'bg-rose-50 text-rose-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card
            key={item.title}
            className="border-slate-200/80 bg-white transition-shadow hover:shadow-sm"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{item.title}</span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold tracking-tight text-[#172B36]">
                  {item.value}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{item.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
