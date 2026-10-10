import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DriverProfileHeader } from '../components/DriverProfileHeader'
import { DriverOverviewTab } from '../components/DriverOverviewTab'
import { DriverVehicleTab } from '../components/DriverVehicleTab'
import { DriverDocumentsTab } from '../components/DriverDocumentsTab'
import { DriverRidesTab } from '../components/DriverRidesTab'
import { DriverPerformanceTab } from '../components/DriverPerformanceTab'
import { DriverActivityTab } from '../components/DriverActivityTab'
import { useDriver } from '../hooks/useDrivers'
import { ROUTES } from '@/lib/constants'

export const DriverDetailsPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>()
  const [activeTab, setActiveTab] = useState('overview')

  const {
    data: driver,
    isLoading,
    isError,
    error,
    refetch,
  } = useDriver(driverId)

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-10 w-80 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !driver) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-[#172B36]">
            Driver Not Found
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {error?.message ||
              `Unable to locate driver record with ID "${driverId}". The profile may have been removed or you may have followed an outdated link.`}
          </p>
          <div className="mt-5 flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.DRIVERS}>Back to Drivers</Link>
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
      {/* Driver Header Summary */}
      <DriverProfileHeader driver={driver} />

      {/* Accessible Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-11 bg-slate-100/80 p-1">
            <TabsTrigger value="overview" className="text-xs px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="text-xs px-4">
              Vehicle & Inspection
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs px-4">
              Documents ({driver.documents.length})
            </TabsTrigger>
            <TabsTrigger value="rides" className="text-xs px-4">
              Ride History
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs px-4">
              Performance
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs px-4">
              Account Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <DriverOverviewTab driver={driver} />
        </TabsContent>

        <TabsContent value="vehicle">
          <DriverVehicleTab vehicle={driver.vehicle} />
        </TabsContent>

        <TabsContent value="documents">
          <DriverDocumentsTab documents={driver.documents} />
        </TabsContent>

        <TabsContent value="rides">
          <DriverRidesTab driverId={driver.id} />
        </TabsContent>

        <TabsContent value="performance">
          <DriverPerformanceTab driver={driver} />
        </TabsContent>

        <TabsContent value="activity">
          <DriverActivityTab driver={driver} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DriverDetailsPage
