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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  suspendDriverSchema,
  type SuspendDriverFormData,
} from '../schemas/driver.schema'
import type { Driver } from '../types/driver.types'
import { useSuspendDriver } from '../hooks/useDrivers'

interface SuspendDriverDialogProps {
  driver: Driver | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SuspendDriverDialog: React.FC<SuspendDriverDialogProps> = ({
  driver,
  open,
  onOpenChange,
}) => {
  const { mutate: suspendDriver, isPending } = useSuspendDriver()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuspendDriverFormData>({
    resolver: zodResolver(suspendDriverSchema),
    defaultValues: {
      reason: 'policy_violation',
      notes: '',
    },
  })

  const onSubmit = (data: SuspendDriverFormData) => {
    if (!driver) return
    suspendDriver(
      {
        driverId: driver.id,
        reason: data.reason,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg">Suspend Driver Account?</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 pt-1">
            This action will immediately prevent{' '}
            <strong className="text-slate-700">{driver?.fullName}</strong> (
            {driver?.driverCode}) from receiving and accepting new ride requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="suspend-reason" className="text-xs font-semibold">
              Suspension Reason <span className="text-rose-500">*</span>
            </Label>
            <select
              id="suspend-reason"
              {...register('reason')}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#172B36] outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            >
              <option value="policy_violation">Safety or Policy Violation</option>
              <option value="verification_issue">Document / Verification Issue</option>
              <option value="customer_complaints">Excessive Customer Complaints</option>
              <option value="administrative_review">Under Administrative Review</option>
              <option value="other">Other Regulatory Reason</option>
            </select>
            {errors.reason && (
              <p className="text-[11px] text-rose-500">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="suspend-notes" className="text-xs font-semibold">
              Internal Audit Notes (Optional)
            </Label>
            <Textarea
              id="suspend-notes"
              {...register('notes')}
              placeholder="Provide internal details regarding this enforcement action..."
              className="h-20 text-xs"
            />
            {errors.notes && (
              <p className="text-[11px] text-rose-500">{errors.notes.message}</p>
            )}
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
              variant="destructive"
              size="sm"
              disabled={isPending}
              className="gap-1.5 bg-rose-600 hover:bg-rose-700"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Suspend Driver
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
