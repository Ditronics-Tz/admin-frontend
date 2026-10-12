import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Driver } from '../types/driver.types'
import { driverService } from '../services/driver.service'
import { LicencePreview } from './LicencePreview'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/feedback/QueryError'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { toast } from 'sonner'

export function VerificationReviewPanel({ driver }: { driver: Driver }) {
  const { canVerifyDrivers } = usePermission()
  const [decision, setDecision] = useState<boolean | null>(null)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (verified: boolean) => driverService.verifyDriver(driver.id, verified),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drivers'] }),
        queryClient.invalidateQueries({ queryKey: ['driver', driver.id] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] }),
      ])
      setDecision(null)
      toast.success('Driver verification updated.')
    },
  })
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">{driver.fullName}</h2>
        <p className="text-sm">{driver.email}</p>
        <p className="text-sm">Plate: {driver.vehicle.plateNumber}</p>
        <p className="text-sm">
          Verification:{' '}
          {driver.verificationStatus === 'approved' ? 'Verified' : 'Unverified'}
        </p>
        <p className="text-sm text-muted-foreground">
          Verification applies to the driver profile. The server records a
          verified/unverified flag; it does not store rejection reasons or individual
          document decisions.
        </p>
        {canVerifyDrivers && (
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={
                mutation.isPending ||
                driver.documents.length === 0 ||
                driver.verificationStatus === 'approved'
              }
              onClick={() => {
                mutation.reset()
                setDecision(true)
              }}
            >
              Mark verified
            </Button>
            <Button
              variant="outline"
              disabled={mutation.isPending || driver.verificationStatus !== 'approved'}
              onClick={() => {
                mutation.reset()
                setDecision(false)
              }}
            >
              Mark unverified
            </Button>
          </div>
        )}
      </section>
      <section className="space-y-4 rounded-xl border bg-white p-6 lg:col-span-2">
        <h2 className="font-semibold">Uploaded licence</h2>
        {driver.documents.length > 0 ? (
          <LicencePreview driverId={driver.id} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No licence image has been uploaded.
          </p>
        )}
      </section>
      <Dialog
        open={decision !== null}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setDecision(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision ? 'Mark driver verified?' : 'Mark driver unverified?'}
            </DialogTitle>
            <DialogDescription>
              Update verification for {driver.fullName}. This action is recorded in the
              security audit trail.
            </DialogDescription>
          </DialogHeader>
          {mutation.isError && <QueryError error={mutation.error} />}
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              if (decision !== null) mutation.mutate(decision)
            }}
          >
            {mutation.isPending ? 'Saving…' : 'Confirm'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
