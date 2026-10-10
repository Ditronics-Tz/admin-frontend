import React from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DriverAccountStatusBadge,
  DriverVerificationBadge,
  DriverAvailabilityBadge,
} from './DriverStatusBadge'
import { DriverRowActions } from './DriverRowActions'
import {
  formatTzPhone,
  getDriverInitials,
  getVehicleTypeLabel,
} from '../utils/driver-formatters'
import type { Driver, DriverFilters } from '../types/driver.types'
import { formatDateTime } from '@/lib/utils/formatters'

interface DriversTableProps {
  drivers: Driver[]
  total: number
  filters: DriverFilters
  onFiltersChange: (newFilters: Partial<DriverFilters>) => void
  onResetFilters: () => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export const DriversTable: React.FC<DriversTableProps> = ({
  drivers,
  total,
  filters,
  onFiltersChange,
  onResetFilters,
  isLoading,
  isError,
  onRetry,
}) => {
  const currentPage = filters.page || 1
  const pageSize = filters.pageSize || 10
  const totalPages = Math.ceil(total / pageSize) || 1

  const startIndex = total > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endIndex = Math.min(currentPage * pageSize, total)

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50/30 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-[#172B36]">
          Unable to Load Drivers
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          An error occurred while communicating with the driver service. Please check
          your connection and try again.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-50"
        >
          Retry Request
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Table Content Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-6 pr-3">Driver</th>
              <th className="px-3 py-3.5">Driver ID</th>
              <th className="px-3 py-3.5">Phone</th>
              <th className="px-3 py-3.5">Vehicle</th>
              <th className="px-3 py-3.5">Verification</th>
              <th className="px-3 py-3.5">Account Status</th>
              <th className="px-3 py-3.5">Availability</th>
              <th className="px-3 py-3.5">Rating</th>
              <th className="px-3 py-3.5">Joined</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="h-16">
                  <td className="pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="pr-6 text-right"><Skeleton className="ml-auto h-7 w-7 rounded-md" /></td>
                </tr>
              ))
            ) : drivers.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-[#172B36]">
                    No drivers found
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    No driver accounts match your current filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResetFilters}
                    className="mt-4 text-xs text-slate-600"
                  >
                    Reset Filters
                  </Button>
                </td>
              </tr>
            ) : (
              // Active Driver Rows
              drivers.map((driver) => {
                const initials = getDriverInitials(driver.fullName)
                return (
                  <tr
                    key={driver.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {/* Driver Avatar & Name */}
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft-mint font-semibold text-brand-deep-teal shadow-xs text-xs"
                          aria-hidden="true"
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/drivers/${driver.id}`}
                            className="block truncate font-semibold text-[#172B36] hover:text-brand-primary-teal"
                          >
                            {driver.fullName}
                          </Link>
                          <span className="block truncate text-[11px] text-slate-400">
                            {driver.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Driver Code */}
                    <td className="px-3 py-3.5">
                      <span className="font-mono text-[11px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {driver.driverCode}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {formatTzPhone(driver.phone)}
                    </td>

                    {/* Vehicle */}
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#172B36]">
                          {driver.vehicle.make} {driver.vehicle.model}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {getVehicleTypeLabel(driver.vehicle.type)} •{' '}
                          {driver.vehicle.plateNumber}
                        </span>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="px-3 py-3.5">
                      <DriverVerificationBadge status={driver.verificationStatus} />
                    </td>

                    {/* Account Status */}
                    <td className="px-3 py-3.5">
                      <DriverAccountStatusBadge status={driver.accountStatus} />
                    </td>

                    {/* Availability */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <DriverAvailabilityBadge status={driver.availabilityStatus} />
                    </td>

                    {/* Rating */}
                    <td className="px-3 py-3.5">
                      {driver.rating ? (
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{driver.rating.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({driver.ratingCount})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-3 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDateTime(driver.joinedAt)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 pl-3 pr-6 text-right">
                      <DriverRowActions driver={driver} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 border-t border-slate-200/80 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) =>
              onFiltersChange({ pageSize: Number(e.target.value), page: 1 })
            }
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:border-brand-primary-teal"
            aria-label="Rows per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="hidden sm:inline">
            Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of{' '}
            <strong>{total}</strong> drivers
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 sm:hidden">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({ page: currentPage - 1 })}
            disabled={currentPage <= 1 || isLoading}
            className="h-8 gap-1 px-2.5 text-xs"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          <span className="hidden text-xs text-slate-500 sm:inline px-2">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({ page: currentPage + 1 })}
            disabled={currentPage >= totalPages || isLoading}
            className="h-8 gap-1 px-2.5 text-xs"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
