import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { driverFormSchema, type DriverFormData } from '../schemas/driver.schema'
import { useDriver, useUpdateDriver } from '../hooks/useDrivers'
import { ROUTES } from '@/lib/constants'

export const DriverEditPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>()
  const navigate = useNavigate()

  const {
    data: driver,
    isLoading,
    isError,
  } = useDriver(driverId)

  const { mutate: updateDriver, isPending: isSaving } = useUpdateDriver()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
  })

  // Prefill form when driver data is loaded
  useEffect(() => {
    if (driver) {
      reset({
        fullName: driver.fullName,
        email: driver.email,
        phone: driver.phone,
        city: driver.city,
        district: driver.district || '',
        vehicleType: driver.vehicle.type,
        vehicleMake: driver.vehicle.make,
        vehicleModel: driver.vehicle.model,
        vehicleYear: driver.vehicle.year,
        vehiclePlateNumber: driver.vehicle.plateNumber,
        vehicleColor: driver.vehicle.color,
      })
    }
  }, [driver, reset])

  const onSubmit = (data: DriverFormData) => {
    if (!driverId) return
    updateDriver(
      {
        driverId,
        data,
      },
      {
        onSuccess: () => {
          navigate(`/drivers/${driverId}`)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !driver) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50/40 p-12 text-center">
          <AlertCircle className="h-8 w-8 text-rose-600" />
          <h2 className="mt-3 text-lg font-semibold text-[#172B36]">
            Driver Not Found
          </h2>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to={ROUTES.DRIVERS}>Back to Drivers</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Navigation and Title */}
      <div>
        <Link
          to={`/drivers/${driver.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-primary-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Cancel & Back to Profile</span>
        </Link>
      </div>

      <div className="border-b border-slate-200/60 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36]">
            Edit Driver: {driver.fullName}
          </h1>
          <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {driver.driverCode}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Update driver contact information and assigned vehicle specifications.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Personal Details */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Personal & Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-medium">
                  Full Legal Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  className="h-9 text-xs"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="h-9 text-xs"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Tanzania Phone Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="h-9 text-xs"
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="district" className="text-xs font-medium">
                  District / Area
                </Label>
                <Input
                  id="district"
                  {...register('district')}
                  className="h-9 text-xs"
                />
                {errors.district && (
                  <p className="text-[11px] text-rose-500">
                    {errors.district.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Vehicle Details */}
        <Card className="border-slate-200/80 shadow-none">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Vehicle Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="vehicleType" className="text-xs font-medium">
                  Vehicle Type <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="vehicleType"
                  {...register('vehicleType')}
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-brand-primary-teal focus:ring-1 focus:ring-brand-primary-teal"
                >
                  <option value="bajaji">Bajaji (Three-wheeler)</option>
                  <option value="motorcycle">Motorcycle (Boda)</option>
                  <option value="car">Car (Standard)</option>
                </select>
                {errors.vehicleType && (
                  <p className="text-[11px] text-rose-500">
                    {errors.vehicleType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleMake" className="text-xs font-medium">
                  Make / Manufacturer <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleMake"
                  {...register('vehicleMake')}
                  className="h-9 text-xs"
                />
                {errors.vehicleMake && (
                  <p className="text-[11px] text-rose-500">
                    {errors.vehicleMake.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleModel" className="text-xs font-medium">
                  Model <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleModel"
                  {...register('vehicleModel')}
                  className="h-9 text-xs"
                />
                {errors.vehicleModel && (
                  <p className="text-[11px] text-rose-500">
                    {errors.vehicleModel.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehiclePlateNumber" className="text-xs font-medium">
                  Plate Registration <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehiclePlateNumber"
                  {...register('vehiclePlateNumber')}
                  className="h-9 text-xs font-mono"
                />
                {errors.vehiclePlateNumber && (
                  <p className="text-[11px] text-rose-500">
                    {errors.vehiclePlateNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleYear" className="text-xs font-medium">
                  Manufacture Year <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  {...register('vehicleYear', { valueAsNumber: true })}
                  className="h-9 text-xs"
                />
                {errors.vehicleYear && (
                  <p className="text-[11px] text-rose-500">
                    {errors.vehicleYear.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleColor" className="text-xs font-medium">
                  Color <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleColor"
                  {...register('vehicleColor')}
                  className="h-9 text-xs"
                />
                {errors.vehicleColor && (
                  <p className="text-[11px] text-rose-500">
                    {errors.vehicleColor.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-200/60 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/drivers/${driver.id}`)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSaving || !isDirty}
            className="gap-1.5 bg-brand-primary-teal hover:bg-brand-primary-hover text-white text-xs font-semibold"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default DriverEditPage
