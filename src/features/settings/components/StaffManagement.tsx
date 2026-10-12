import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService, type CreateStaffPayload } from '../services/staff.service'
import type { BackendStaffUser } from '@/lib/api/types'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/feedback/QueryError'
import { toast } from 'sonner'
import { authService } from '@/features/auth/services/authService'

export function StaffManagement() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const staff = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => staffService.listStaff(),
  })
  const [dialog, setDialog] = useState<'create' | 'edit' | null>(null)
  const [target, setTarget] = useState<BackendStaffUser | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<CreateStaffPayload['role']>('support')
  const [active, setActive] = useState(true)
  const [secret, setSecret] = useState<{ name: string; password: string } | null>(null)
  const [confirmation, setConfirmation] = useState<{
    title: string
    action: () => Promise<unknown>
  } | null>(null)
  const mutation = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      useAuthStore.getState().setUser(await authService.getCurrentUser())
      setDialog(null)
      setConfirmation(null)
      toast.success('Staff account updated.')
    },
  })
  function edit(member: BackendStaffUser) {
    mutation.reset()
    setTarget(member)
    setName(member.name)
    setActive(member.is_active)
    setDialog('edit')
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate(async () => {
      if (dialog === 'create') {
        const result = await staffService.createStaff({
          name: name.trim(),
          email: email.trim(),
          role,
        })
        setSecret({ name: result.staff.name, password: result.one_time_password })
      } else if (target) {
        await staffService.updateStaff(target.id, {
          name: name.trim(),
          is_active: active,
        })
      }
    })
  }
  function confirm(title: string, action: () => Promise<unknown>) {
    mutation.reset()
    setConfirmation({ title, action })
  }
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Staff accounts</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => void staff.refetch()}>
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              mutation.reset()
              setTarget(null)
              setName('')
              setEmail('')
              setRole('support')
              setDialog('create')
            }}
          >
            Add staff
          </Button>
        </div>
      </div>
      {staff.isPending ? (
        <p>Loading staff…</p>
      ) : staff.isError ? (
        <QueryError error={staff.error} retry={() => void staff.refetch()} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="p-3">Name / email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Security</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.data.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="p-3">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`Role for ${member.name}`}
                      value={member.role}
                      disabled={member.id === user?.id || mutation.isPending}
                      onChange={(e) => {
                        const next = e.target.value as CreateStaffPayload['role']
                        confirm(`Change ${member.name}'s role to ${next}?`, () =>
                          staffService.updateStaffRole(member.id, next)
                        )
                      }}
                      className="rounded border p-2"
                    >
                      <option value="admin">Admin</option>
                      <option value="support">Support</option>
                    </select>
                  </td>
                  <td className="p-3">{member.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="p-3 text-xs">
                    <p>2FA: {member.totp_enabled ? 'Enabled' : 'Disabled'}</p>
                    {member.must_change_password && <p>Password change required</p>}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => edit(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title={
                          member.id === user?.id
                            ? 'Change your own password in My security.'
                            : undefined
                        }
                        disabled={mutation.isPending || member.id === user?.id}
                        onClick={() =>
                          confirm(
                            `Reset ${member.name}'s password and revoke refresh sessions?`,
                            async () => {
                              const result = await staffService.resetPassword(member.id)
                              setSecret({
                                name: member.name,
                                password: result.one_time_password,
                              })
                            }
                          )
                        }
                      >
                        Reset password
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() =>
                          confirm(
                            `Revoke all refresh sessions for ${member.name}? Existing access tokens remain valid until expiry.`,
                            () => staffService.revokeSessions(member.id)
                          )
                        }
                      >
                        Revoke sessions
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.data.length === 0 && <p className="p-4">No staff accounts found.</p>}
        </div>
      )}
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setDialog(null)
            mutation.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === 'create' ? 'Add staff account' : `Edit ${target?.name}`}
            </DialogTitle>
            <DialogDescription>
              {dialog === 'create'
                ? 'The new account receives a temporary password and must change it on first sign in.'
                : 'Update the staff name and account status. The server protects your own account and the last active administrator.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {mutation.isError && <QueryError error={mutation.error} />}
            <label className="block space-y-2 text-sm">
              Full name
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mutation.isPending}
              />
            </label>
            {dialog === 'create' ? (
              <>
                <label className="block space-y-2 text-sm">
                  Email
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={mutation.isPending}
                  />
                </label>
                <label className="block space-y-2 text-sm">
                  Role
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as CreateStaffPayload['role'])
                    }
                    className="block rounded border p-2"
                    disabled={mutation.isPending}
                  >
                    <option value="support">Support</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </>
            ) : (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={active}
                  disabled={target?.id === user?.id || mutation.isPending}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Active account
              </label>
            )}
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending ? 'Saving…' : 'Save account'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setConfirmation(null)
            mutation.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm staff action</DialogTitle>
            <DialogDescription>{confirmation?.title}</DialogDescription>
          </DialogHeader>
          {mutation.isError && <QueryError error={mutation.error} />}
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              if (confirmation) mutation.mutate(confirmation.action)
            }}
          >
            Confirm
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={secret !== null}
        onOpenChange={(open) => {
          if (!open) setSecret(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary password for {secret?.name}</DialogTitle>
            <DialogDescription>
              Copy this password and share it securely. It disappears when you close this
              dialog.
            </DialogDescription>
          </DialogHeader>
          <code className="select-all break-all rounded bg-muted p-4">
            {secret?.password}
          </code>
          <Button onClick={() => setSecret(null)}>Done</Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
