import React from 'react'
import { CarFront, Users, UserRound, Wallet, Calendar, Sparkles } from 'lucide-react'
import { MetricCard } from '../components/MetricCard'
import { RideActivityChart } from '../components/RideActivityChart'
import { OperationsStatus } from '../components/OperationsStatus'
import { RecentRidesTable } from '../components/RecentRidesTable'
import { formatTZS, formatDateTime } from '@/lib/utils/formatters'

export const DashboardPage: React.FC = () => {
  const currentDate = new Date()

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 7. Dashboard Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
            Welcome to Rida Admin. Here's your operations overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Calendar Date Indicator */}
          <div className="shadow-xs inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{formatDateTime(currentDate, 'dd MMM yyyy')}</span>
            <span className="text-[11px] text-muted-foreground">(EAT)</span>
          </div>

          <div className="hidden items-center gap-1 rounded-lg border border-brand-soft-mint bg-brand-soft-mint/50 px-2.5 py-1 text-xs font-semibold text-brand-deep-teal sm:inline-flex">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Dar es Salaam Live</span>
          </div>
        </div>
      </div>

      {/* 7. Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Rides"
          value="24,580"
          icon={CarFront}
          change={{
            value: '+12.4%',
            isPositive: true,
            period: 'vs last week',
          }}
        />
        <MetricCard
          label="Active Drivers"
          value="842"
          icon={Users}
          change={{
            value: '+5.1%',
            isPositive: true,
            period: 'fleet online',
          }}
        />
        <MetricCard
          label="Total Customers"
          value="118,920"
          icon={UserRound}
          change={{
            value: '+8.2%',
            isPositive: true,
            period: 'registered riders',
          }}
        />
        <MetricCard
          label="Gross Revenue"
          value={formatTZS(148250000)}
          icon={Wallet}
          change={{
            value: '+15.8%',
            isPositive: true,
            period: 'month-to-date',
          }}
        />
      </div>

      {/* 8. Ride Activity Chart & 9. Operations Status */}
      <div className="space-y-6">
        <RideActivityChart />
        <OperationsStatus />
      </div>

      {/* 10. Recent Rides Table */}
      <RecentRidesTable />
    </div>
  )
}

export default DashboardPage
