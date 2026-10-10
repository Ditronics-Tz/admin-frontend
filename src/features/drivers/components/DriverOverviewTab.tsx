import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wallet,
  Car,
  Star,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import type { Driver } from '../types/driver.types'
import { formatTZS, formatDateTime } from '@/lib/utils/formatters'
import { formatTzPhone, getVehicleTypeLabel } from '../utils/driver-formatters'

interface DriverOverviewTabProps {
  driver: Driver
}

export const DriverOverviewTab: React.FC<DriverOverviewTabProps> = ({
  driver,
}) => {
  return (
    <div className="space-y-6">
      {/* Suspension Alert if suspended */}
      {driver.accountStatus === 'suspended' && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-xs text-rose-800">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-900">
                Account Suspended: {driver.suspensionReason || 'Operational Hold'}
              </p>
              {driver.suspensionNotes && (
                <p className="text-rose-700 leading-relaxed">
                  {driver.suspensionNotes}
                </p>
              )}
              {driver.suspendedAt && (
                <p className="text-[11px] text-rose-500 pt-1">
                  Enforced on {formatDateTime(driver.suspendedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Completed Trips</span>
              <Car className="h-4 w-4 text-brand-primary-teal" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#172B36]">
              {driver.totalTrips.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Total lifetime rides</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Driver Rating</span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#172B36]">
              {driver.rating ? driver.rating.toFixed(2) : '—'}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Based on {driver.ratingCount} reviews
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Gross Earnings</span>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-xl font-bold text-emerald-700">
              {formatTZS(driver.totalEarningsTZS)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Tanzanian Shillings</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Acceptance Rate</span>
              <ShieldCheck className="h-4 w-4 text-sky-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#172B36]">
              {driver.acceptanceRate}%
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Cancellation: {driver.cancellationRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Information Cards: Personal Details & Vehicle Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Details */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-[#172B36]">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="flex items-center gap-2 text-slate-500">
                <User className="h-3.5 w-3.5" /> Full Legal Name
              </span>
              <span className="font-semibold text-[#172B36]">{driver.fullName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="flex items-center gap-2 text-slate-500">
                <Phone className="h-3.5 w-3.5" /> Mobile Phone
              </span>
              <span className="font-semibold text-[#172B36]">
                {formatTzPhone(driver.phone)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="flex items-center gap-2 text-slate-500">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </span>
              <span className="font-semibold text-[#172B36]">{driver.email}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> City & District
              </span>
              <span className="font-semibold text-[#172B36]">
                {driver.city} {driver.district ? `(${driver.district})` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-3.5 w-3.5" /> Registration Date
              </span>
              <span className="font-semibold text-[#172B36]">
                {formatDateTime(driver.joinedAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Summary */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-[#172B36]">
              Assigned Vehicle Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Vehicle Type</span>
              <span className="font-semibold text-[#172B36]">
                {getVehicleTypeLabel(driver.vehicle.type)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Manufacturer & Model</span>
              <span className="font-semibold text-[#172B36]">
                {driver.vehicle.make} {driver.vehicle.model}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Plate Registration</span>
              <span className="font-mono font-bold text-brand-primary-teal bg-teal-50 px-2 py-0.5 rounded">
                {driver.vehicle.plateNumber}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Model Year & Color</span>
              <span className="font-semibold text-[#172B36]">
                {driver.vehicle.year} • {driver.vehicle.color}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">LATRA Inspection</span>
              <span
                className={`font-semibold capitalize ${
                  driver.vehicle.inspectionStatus === 'passed'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {driver.vehicle.inspectionStatus}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
