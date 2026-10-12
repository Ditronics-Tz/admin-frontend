import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Loader2 } from 'lucide-react'
import type { Driver } from '../types/driver.types'
import { useReactivateDriver } from '../hooks/useDrivers'

interface ReactivateDriverDialogProps {
  driver: Driver | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ReactivateDriverDialog: React.FC<ReactivateDriverDialogProps> = ({
  driver,
  open,
  onOpenChange,
}) => {
  const { mutate: reactivateDriver, isPending } = useReactivateDriver()
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (!driver) return
    reactivateDriver(
      { driverId: driver.id, reason },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-700">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg">Lift Driver Suspension?</DialogTitle>
          </div>
          <DialogDescription className="pt-1 text-xs leading-relaxed text-slate-500">
            This action will lift the suspension for{' '}
            <strong className="text-slate-700">{driver?.fullName}</strong> (
            {driver?.driverCode}).
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800">
          <p className="font-semibold">Compliance Note:</p>
          <p className="mt-0.5 text-[11px] text-emerald-700">
            Document decisions stay in force. The driver must still have valid approval to
            go online.
          </p>
        </div>
        <label className="space-y-2 text-sm">
          Reason (required)
          <textarea
            required
            maxLength={2000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded border p-2"
          />
        </label>

        <DialogFooter className="gap-2 pt-2 sm:gap-0">
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
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isPending || !reason.trim()}
            className="gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Reactivation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
