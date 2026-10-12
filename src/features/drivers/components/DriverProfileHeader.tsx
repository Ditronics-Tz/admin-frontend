import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, FileCheck2, UserX, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DriverAccountStatusBadge,
  DriverVerificationBadge,
  DriverAvailabilityBadge,
} from './DriverStatusBadge'
import { SuspendDriverDialog } from './SuspendDriverDialog'
import { ReactivateDriverDialog } from './ReactivateDriverDialog'
import { getDriverInitials, formatTzPhone } from '../utils/driver-formatters'
import type { Driver } from '../types/driver.types'
import { ROUTES } from '@/lib/constants'
import { UserRoleAction } from '@/features/customers/components/UserRoleAction'

interface DriverProfileHeaderProps {
  driver: Driver
}

export const DriverProfileHeader: React.FC<DriverProfileHeaderProps> = ({ driver }) => {
  const navigate = useNavigate()
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)

  const initials = getDriverInitials(driver.fullName)

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div>
        <Link
          to={ROUTES.DRIVERS}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-primary-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Drivers</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Avatar and Basic Details */}
          <div className="flex items-start gap-4">
            <div
              className="shadow-xs flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-soft-mint text-xl font-bold text-brand-deep-teal"
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#172B36] sm:text-2xl">
                  {driver.fullName}
                </h1>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                  {driver.driverCode}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {driver.email} • {formatTzPhone(driver.phone)} • {driver.city}
                {driver.district ? `, ${driver.district}` : ''}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <DriverAccountStatusBadge status={driver.accountStatus} />
                <DriverVerificationBadge status={driver.verificationStatus} />
                <DriverAvailabilityBadge status={driver.availabilityStatus} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <UserRoleAction id={driver.id} name={driver.fullName} role="driver" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/drivers/${driver.id}/edit`)}
              disabled
              title="Staff editing of driver profiles is not supported by the server"
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Driver</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/drivers/verifications/${driver.id}`)}
              className="h-9 gap-1.5 border-brand-primary-teal/30 text-xs font-medium text-brand-primary-teal hover:bg-teal-50"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Review Documents</span>
            </Button>

            {driver.accountStatus === 'suspended' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReactivateOpen(true)}
                className="h-9 gap-1.5 border-emerald-300 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Reactivate</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuspendOpen(true)}
                className="h-9 gap-1.5 border-rose-300 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <UserX className="h-3.5 w-3.5" />
                <span>Suspend</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <SuspendDriverDialog
        driver={driver}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
      />

      <ReactivateDriverDialog
        driver={driver}
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
      />
    </div>
  )
}
