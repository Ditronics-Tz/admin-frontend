import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VerificationReviewPanel } from '../components/VerificationReviewPanel'
import { useDriver } from '../hooks/useDrivers'
import { ROUTES } from '@/lib/constants'

export const VerificationDetailsPage: React.FC = () => {
  const { verificationId } = useParams<{ verificationId: string }>()

  const { data: driver, isLoading, isError, error, refetch } = useDriver(verificationId)

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-4 lg:col-span-7">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !driver) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50/40 p-12 text-center">
          <AlertCircle className="h-8 w-8 text-rose-600" />
          <h2 className="mt-3 text-lg font-semibold text-[#172B36]">
            Application Not Found
          </h2>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {error?.message ||
              `Unable to locate verification request for reference "${verificationId}".`}
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.DRIVER_VERIFICATIONS}>Back to Queue</Link>
            </Button>
            <Button size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Back to Queue Navigation */}
      <div>
        <Link
          to={ROUTES.DRIVER_VERIFICATIONS}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-primary-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Verification Queue</span>
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-3 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172B36]">
              Compliance Review: {driver.fullName}
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              {driver.driverCode}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Inspect uploaded evidence against Rida's configured verification policy.
          </p>
        </div>

        <div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to={`/drivers/${driver.id}`}>View Full Profile</Link>
          </Button>
        </div>
      </div>

      {/* Two Column Review Panel */}
      <VerificationReviewPanel driver={driver} />
    </div>
  )
}

export default VerificationDetailsPage
