import { FraudDashboardCount } from '@/features/operations/FraudPage'
import React from 'react'
import { CarFront, Users, UserRound, Wallet, Calendar, Sparkles } from 'lucide-react'
import { MetricCard } from '../components/MetricCard'
import { RideActivityChart } from '../components/RideActivityChart'
import { OperationsStatus } from '../components/OperationsStatus'
import { RecentRidesTable } from '../components/RecentRidesTable'
import { formatDateTime } from '@/lib/utils/formatters'
import { useDashboardStats } from '../hooks/useDashboard'
import { QueryError } from '@/components/feedback/QueryError'

export const DashboardPage: React.FC = () => {
  const currentDate = new Date()
  const { data: stats, isLoading, error, refetch } = useDashboardStats()

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <FraudDashboardCount />
      {/* Dashboard Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
            Welcome to Rida Admin. Operations overview connected to live Go backend.
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
            <span>Dar es Salaam Operations</span>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards Grid with Real Backend Data */}
      {error && <QueryError error={error} retry={() => void refetch()} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Rides"
          value={
            isLoading
              ? '...'
              : stats?.activeRides != null
                ? stats.activeRides.toLocaleString()
                : 'Unavailable'
          }
          icon={CarFront}
          change={
            stats?.activeRides != null
              ? {
                  value: 'Real count',
                  isPositive: true,
                  period: 'active persisted trips',
                }
              : undefined
          }
        />
        <MetricCard
          label="Registered Drivers"
          value={
            isLoading
              ? '...'
              : stats
                ? stats.totalDrivers.toLocaleString()
                : 'Unavailable'
          }
          icon={Users}
          change={{
            value: 'Real count',
            isPositive: true,
            period: 'registered accounts',
          }}
        />
        <MetricCard
          label="Total Passengers"
          value={
            isLoading
              ? '...'
              : stats
                ? stats.totalPassengers.toLocaleString()
                : 'Unavailable'
          }
          icon={UserRound}
          change={{
            value: 'Real count',
            isPositive: true,
            period: 'registered riders',
          }}
        />
        <MetricCard
          label="Gross Revenue"
          value="Unavailable"
          icon={Wallet}
          subtext="Financial service not deployed in backend"
        />
      </div>

      {/* Ride Activity Trends & Operations Status */}
      <div className="space-y-6">
        <RideActivityChart />
        <OperationsStatus />
      </div>

      {/* Recent Rides Table */}
      <RecentRidesTable />
    </div>
  )
}

export default DashboardPage
