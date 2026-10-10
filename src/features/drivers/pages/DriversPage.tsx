import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DriverStatsCards } from '../components/DriverStatsCards'
import { DriversToolbar } from '../components/DriversToolbar'
import { DriversTable } from '../components/DriversTable'
import { AddDriverDialog } from '../components/AddDriverDialog'
import { useDrivers, useDriverStats } from '../hooks/useDrivers'
import type { DriverFilters } from '../types/driver.types'
import { ROUTES } from '@/lib/constants'

export const DriversPage: React.FC = () => {
  const [filters, setFilters] = useState<DriverFilters>({
    search: '',
    accountStatus: 'all',
    verificationStatus: 'all',
    vehicleType: 'all',
    page: 1,
    pageSize: 10,
  })

  const [addDriverOpen, setAddDriverOpen] = useState(false)

  const {
    data: driversData,
    isLoading,
    isError,
    refetch,
  } = useDrivers(filters)

  const { data: stats, isLoading: isStatsLoading } = useDriverStats()

  const handleFiltersChange = (newFilters: Partial<DriverFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      accountStatus: 'all',
      verificationStatus: 'all',
      vehicleType: 'all',
      page: 1,
      pageSize: 10,
    })
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            Drivers
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage driver accounts, verification, vehicles, and operational availability in Tanzania.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick link to verification queue */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100/60"
          >
            <Link to={ROUTES.DRIVER_VERIFICATIONS}>
              <Clock3 className="h-3.5 w-3.5 text-amber-600" />
              <span>Verification Queue</span>
              {stats?.pendingVerification ? (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {stats.pendingVerification}
                </span>
              ) : null}
            </Link>
          </Button>

          {/* Add Driver CTA */}
          <Button
            size="sm"
            onClick={() => setAddDriverOpen(true)}
            className="h-9 gap-1.5 bg-brand-primary-teal hover:bg-brand-primary-hover text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Driver</span>
          </Button>
        </div>
      </div>

      {/* Driver Operational Statistics Cards */}
      <DriverStatsCards stats={stats} isLoading={isStatsLoading} />

      {/* Filter and Search Toolbar */}
      <DriversToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        totalCount={driversData?.total ?? 0}
      />

      {/* Driver Management Data Table */}
      <DriversTable
        drivers={driversData?.items ?? []}
        total={driversData?.total ?? 0}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />

      {/* Add Driver Dialog */}
      <AddDriverDialog
        open={addDriverOpen}
        onOpenChange={setAddDriverOpen}
      />
    </div>
  )
}

export default DriversPage
