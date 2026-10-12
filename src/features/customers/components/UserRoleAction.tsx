import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { driverService } from '@/features/drivers/services/driver.service'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/feedback/QueryError'
import { toast } from 'sonner'

export function UserRoleAction({
  id,
  name,
  role,
  onChanged,
}: {
  id: string
  name: string
  role: 'driver' | 'passenger'
  onChanged?: () => void
}) {
  const { canChangeUserRoles } = usePermission()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const next = role === 'driver' ? 'passenger' : 'driver'
  const mutation = useMutation({
    mutationFn: () => driverService.updateUserRole(id, next),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drivers'] }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['driver', id] }),
        queryClient.invalidateQueries({ queryKey: ['user', id] }),
      ])
      setOpen(false)
      toast.success(`${name} is now a ${next}.`)
      if (onChanged) onChanged()
      else navigate('/drivers')
    },
  })
  if (!canChangeUserRoles) return null
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          mutation.reset()
          setOpen(true)
        }}
      >
        Change to {next}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!mutation.isPending) setOpen(value)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change account role?</DialogTitle>
            <DialogDescription>
              Change {name} from {role} to {next}. The server will create the
              corresponding profile if necessary. Existing app tokens retain their
              previous role until they expire.
            </DialogDescription>
          </DialogHeader>
          {mutation.isError && <QueryError error={mutation.error} />}
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            Confirm role change
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
