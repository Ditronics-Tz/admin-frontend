import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2 } from 'lucide-react'
import { driverFormSchema, type DriverFormData } from '../schemas/driver.schema'
import { useCreateDriver } from '../hooks/useDrivers'

interface AddDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AddDriverDialog: React.FC<AddDriverDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { mutate: createDriver, isPending } = useCreateDriver()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      city: 'Dar es Salaam',
      district: 'Kinondoni',
      vehicleType: 'bajaji',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: 2022,
      vehiclePlateNumber: '',
      vehicleColor: '',
    },
  })

  const onSubmit = (data: DriverFormData) => {
    createDriver(data, {
      onSuccess: () => {
        reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-brand-deep-teal">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft-mint text-brand-deep-teal">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Add New Driver</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Register a new driver account and assigned vehicle in Tanzania
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Group 1: Personal Information */}
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Personal & Contact Details
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-medium">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="e.g. Juma Hassan Rashidi"
                  className="h-9 text-xs"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>
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
                  placeholder="e.g. juma.rashidi@example.com"
                  className="h-9 text-xs"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Phone (Tanzania) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+255 754 123 456"
                  className="h-9 text-xs"
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="district" className="text-xs font-medium">
                  District / Area
                </Label>
                <Input
                  id="district"
                  {...register('district')}
                  placeholder="e.g. Kinondoni, Ilala, Ubungo"
                  className="h-9 text-xs"
                />
                {errors.district && (
                  <p className="text-[11px] text-rose-500">{errors.district.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Group 2: Vehicle Details */}
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Vehicle Information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  <p className="text-[11px] text-rose-500">{errors.vehicleType.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleMake" className="text-xs font-medium">
                  Manufacturer / Make <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleMake"
                  {...register('vehicleMake')}
                  placeholder="e.g. Bajaj, Toyota, TVS"
                  className="h-9 text-xs"
                />
                {errors.vehicleMake && (
                  <p className="text-[11px] text-rose-500">{errors.vehicleMake.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleModel" className="text-xs font-medium">
                  Model <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleModel"
                  {...register('vehicleModel')}
                  placeholder="e.g. RE Maxima, Vitz"
                  className="h-9 text-xs"
                />
                {errors.vehicleModel && (
                  <p className="text-[11px] text-rose-500">{errors.vehicleModel.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehiclePlateNumber" className="text-xs font-medium">
                  Plate Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehiclePlateNumber"
                  {...register('vehiclePlateNumber')}
                  placeholder="e.g. T 412 DKM"
                  className="h-9 text-xs"
                />
                {errors.vehiclePlateNumber && (
                  <p className="text-[11px] text-rose-500">
                    {errors.vehiclePlateNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleYear" className="text-xs font-medium">
                  Model Year <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  {...register('vehicleYear', { valueAsNumber: true })}
                  placeholder="2022"
                  className="h-9 text-xs"
                />
                {errors.vehicleYear && (
                  <p className="text-[11px] text-rose-500">{errors.vehicleYear.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleColor" className="text-xs font-medium">
                  Color <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="vehicleColor"
                  {...register('vehicleColor')}
                  placeholder="e.g. Yellow, White"
                  className="h-9 text-xs"
                />
                {errors.vehicleColor && (
                  <p className="text-[11px] text-rose-500">{errors.vehicleColor.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5 bg-brand-primary-teal hover:bg-brand-primary-hover text-white"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save & Register Driver
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
