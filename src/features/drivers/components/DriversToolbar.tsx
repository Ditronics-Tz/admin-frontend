import React, { useState, useEffect } from 'react'
import { Search, X, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DriverFilters } from '../types/driver.types'

interface DriversToolbarProps {
  filters: DriverFilters
  onFiltersChange: (newFilters: Partial<DriverFilters>) => void
  onResetFilters: () => void
  totalCount: number
}

export const DriversToolbar: React.FC<DriversToolbarProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  totalCount,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search)
  const [prevSearchProp, setPrevSearchProp] = useState(filters.search)

  if (filters.search !== prevSearchProp) {
    setPrevSearchProp(filters.search)
    setSearchValue(filters.search)
  }

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ search: searchValue, page: 1 })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, filters.search, onFiltersChange])

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.accountStatus && filters.accountStatus !== 'all') ||
    (filters.verificationStatus && filters.verificationStatus !== 'all') ||
    (filters.vehicleType && filters.vehicleType !== 'all')
  )

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name, phone, email, plate, or driver ID..."
            className="h-10 pl-9 pr-8 text-sm focus-visible:ring-brand-primary-teal"
            aria-label="Search drivers"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('')
                onFiltersChange({ search: '', page: 1 })
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Account Status Filter */}
          <select
            value={filters.accountStatus}
            onChange={(e) => onFiltersChange({ accountStatus: e.target.value, page: 1 })}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#172B36] outline-none transition-colors hover:border-slate-300 focus:border-brand-primary-teal focus:ring-1 focus:ring-brand-primary-teal"
            aria-label="Filter by account status"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={filters.verificationStatus}
            onChange={(e) =>
              onFiltersChange({ verificationStatus: e.target.value, page: 1 })
            }
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#172B36] outline-none transition-colors hover:border-slate-300 focus:border-brand-primary-teal focus:ring-1 focus:ring-brand-primary-teal"
            aria-label="Filter by verification status"
          >
            <option value="all">All Verifications</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending_documents">Pending Documents</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Vehicle Type Filter */}
          <select
            value={filters.vehicleType}
            disabled
            title="Vehicle type is not provided by the server yet"
            onChange={(e) => onFiltersChange({ vehicleType: e.target.value, page: 1 })}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#172B36] outline-none transition-colors hover:border-slate-300 focus:border-brand-primary-teal focus:ring-1 focus:ring-brand-primary-teal"
            aria-label="Filter by vehicle type"
          >
            <option value="all">Vehicle type unavailable</option>
            <option value="motorcycle">Motorcycle (Boda)</option>
            <option value="bajaji">Bajaji</option>
            <option value="car">Car</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 gap-1.5 px-3 text-xs text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Count & Active Feedback */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-700">{totalCount}</strong>{' '}
          {totalCount === 1 ? 'driver' : 'drivers'}
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] font-medium text-brand-primary-teal">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  )
}
