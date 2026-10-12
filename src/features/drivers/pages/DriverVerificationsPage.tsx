import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock3,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useVerificationRequests } from '../hooks/useDrivers'
import {
  formatTzPhone,
  getVehicleTypeLabel,
  getDriverInitials,
} from '../utils/driver-formatters'
import { formatDateTime } from '@/lib/utils/formatters'
import { ROUTES } from '@/lib/constants'

export const DriverVerificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: requests, isLoading, isError, refetch } = useVerificationRequests()

  const pendingCount = requests?.filter((r) => r.status === 'pending').length ?? 0
  const missingDocumentCount = requests?.filter((r) => r.documentsCount === 0).length ?? 0

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header and Back Link */}
      <div className="space-y-4">
        <div>
          <Link
            to={ROUTES.DRIVERS}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-primary-teal"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Drivers</span>
          </Link>
        </div>

        <div className="flex flex-col gap-2 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
              Driver Verification Queue
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Review uploaded driving licences and verify driver profiles.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-xs text-slate-500">Pending Review</span>
              <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-xs text-slate-500">Total In Queue</span>
              <p className="mt-1 text-2xl font-bold text-[#172B36]">
                {requests?.length ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-brand-primary-teal">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-xs text-slate-500">Licence image missing</span>
              <p className="mt-1 text-2xl font-bold text-rose-600">
                {missingDocumentCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Queue Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Applicant Driver</th>
                <th className="px-3 py-3.5">Driver ID</th>
                <th className="px-3 py-3.5">Phone</th>
                <th className="px-3 py-3.5">Vehicle Category</th>
                <th className="px-3 py-3.5">Documents</th>
                <th className="px-3 py-3.5">Profile Created</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="h-16">
                    <td className="pl-6">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="px-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="pr-6 text-right">
                      <Skeleton className="ml-auto h-7 w-20" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-rose-600">
                    <AlertCircle className="mx-auto mb-2 h-6 w-6" />
                    Failed to load verification queue.
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="mx-auto mt-3 block"
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : !requests || requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-[#172B36]">
                      Queue is completely clear!
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      No driver compliance applications awaiting review.
                    </p>
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft-mint text-xs font-semibold text-brand-deep-teal">
                          {getDriverInitials(item.driverName)}
                        </div>
                        <span className="font-semibold text-[#172B36]">
                          {item.driverName}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 font-mono text-[11px] text-slate-700">
                      {item.driverCode}
                    </td>

                    <td className="px-3 py-3.5 font-medium text-slate-700">
                      {formatTzPhone(item.driverPhone)}
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="capitalize text-slate-700">
                        {getVehicleTypeLabel(item.vehicleType)}
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="font-semibold text-slate-700">
                        {item.documentsCount} docs
                      </span>
                    </td>

                    <td className="px-3 py-3.5 text-slate-500">
                      {formatDateTime(item.submissionDate)}
                    </td>

                    <td className="px-3 py-3.5">
                      <Badge
                        variant={
                          item.status === 'approved'
                            ? 'success'
                            : item.status === 'rejected'
                              ? 'destructive'
                              : 'warning'
                        }
                        className="text-[10px] capitalize"
                      >
                        {item.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 pl-3 pr-6 text-right">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/drivers/verifications/${item.driverId}`)
                        }
                        className="hover:bg-brand-primary-hover h-8 gap-1.5 bg-brand-primary-teal text-xs font-medium text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect & Review</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DriverVerificationsPage
