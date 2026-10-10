import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { MapPinned, Radio, Compass, Users } from 'lucide-react'

export const LiveOperationsPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200/60 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            Live Operations
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live Dispatch Radar
          </span>
        </div>
        <p className="text-xs text-[#64748B] sm:text-sm">
          Real-time geospatial tracking and driver allocation across Dar es Salaam zones.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Radio className="h-4 w-4 text-emerald-600" />
            Active Fleet Radar
          </div>
          <p className="mt-2 text-2xl font-bold text-[#172B36]">415 Vehicles</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Online in metropolitan area
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Compass className="h-4 w-4 text-blue-600" />
            High Demand Zone
          </div>
          <p className="mt-2 text-2xl font-bold text-[#172B36]">Kariakoo & Posta</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Peak traffic demand cluster
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Users className="h-4 w-4 text-amber-600" />
            Average Dispatch ETA
          </div>
          <p className="mt-2 text-2xl font-bold text-[#172B36]">3.8 mins</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Pickup arrival response time
          </p>
        </div>
      </div>

      {/* Main Map View Placeholder */}
      <Card className="shadow-xs rounded-xl border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#172B36]">
            Interactive Geospatial Dispatch Map
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Map integration scheduled for Phase 6. Real-time telemetry connection ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
            <div className="shadow-xs flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft-mint text-brand-deep-teal">
              <MapPinned className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#172B36]">
              Geospatial Operations Map View
            </h3>
            <p className="mt-1 max-w-md text-xs text-[#64748B]">
              This interface will render live WebGL vector tiles for Dar es Salaam,
              Arusha, and Dodoma, displaying moving driver clusters and hot zones.
            </p>
            <div className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] text-slate-600">
              Module: src/features/live-operations · Phase 6 Dispatch
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveOperationsPage
