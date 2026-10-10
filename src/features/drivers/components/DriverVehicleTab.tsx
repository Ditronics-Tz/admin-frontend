import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, ShieldCheck, AlertCircle } from 'lucide-react'
import type { DriverVehicle } from '../types/driver.types'
import { getVehicleTypeLabel } from '../utils/driver-formatters'
import { formatDateTime } from '@/lib/utils/formatters'

interface DriverVehicleTabProps {
  vehicle: DriverVehicle
}

export const DriverVehicleTab: React.FC<DriverVehicleTabProps> = ({
  vehicle,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vehicle Specs */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-brand-primary-teal" />
              <CardTitle className="text-sm font-semibold text-[#172B36]">
                Vehicle Specifications
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Classification</span>
              <span className="font-semibold text-[#172B36]">
                {getVehicleTypeLabel(vehicle.type)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Make (Manufacturer)</span>
              <span className="font-semibold text-[#172B36]">{vehicle.make}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Model Name</span>
              <span className="font-semibold text-[#172B36]">{vehicle.model}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Manufacture Year</span>
              <span className="font-semibold text-[#172B36]">{vehicle.year}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Exterior Color</span>
              <span className="font-semibold text-[#172B36]">{vehicle.color}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Registration Number</span>
              <span className="font-mono font-bold text-brand-primary-teal bg-teal-50 px-2 py-0.5 rounded">
                {vehicle.plateNumber}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Roadworthiness & LATRA Inspection */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm font-semibold text-[#172B36]">
                Roadworthiness & Compliance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Inspection Status
                  </span>
                  <p className="mt-0.5 font-bold capitalize text-[#172B36]">
                    {vehicle.inspectionStatus}
                  </p>
                </div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    vehicle.inspectionStatus === 'passed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {vehicle.inspectionStatus === 'passed' ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Inspection Validity</span>
                <span className="font-medium text-slate-700">
                  {vehicle.inspectionExpiry
                    ? formatDateTime(vehicle.inspectionExpiry)
                    : 'Pending Initial Inspection'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Commercial Operation Permit</span>
                <span className="font-medium text-emerald-700">
                  LATRA Registered Carrier
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
