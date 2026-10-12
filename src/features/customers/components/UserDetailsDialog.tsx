import { useQuery } from '@tanstack/react-query'
import { customerService } from '../services/customer.service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/feedback/QueryError'
import { UserRoleAction } from './UserRoleAction'
import { AccountSupportPanel } from './AccountSupportPanel'

export function UserDetailsDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const query = useQuery({
    queryKey: ['user', id],
    queryFn: () => customerService.getCustomer(id),
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account details</DialogTitle>
          <DialogDescription>
            Registered account and profile information.
          </DialogDescription>
        </DialogHeader>
        {query.isPending ? (
          <p>Loading profile…</p>
        ) : query.isError ? (
          <QueryError error={query.error} retry={() => void query.refetch()} />
        ) : (
          <div className="space-y-4 text-sm">
            <dl className="space-y-2">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd>{query.data.user.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{query.data.user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role / status</dt>
                <dd>
                  {query.data.user.role} ·{' '}
                  {query.data.user.status ||
                    (query.data.user.is_active ? 'Active' : 'Inactive')}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Profile name</dt>
                <dd>{query.data.passenger_profile?.full_name || 'Not collected'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{query.data.passenger_profile?.phone || 'Not collected'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rating</dt>
                <dd>
                  {query.data.total_ratings > 0
                    ? `${query.data.average_rating.toFixed(2)} / 5 (${query.data.total_ratings} reviews)`
                    : 'No ratings yet'}
                </dd>
              </div>
            </dl>
            <UserRoleAction
              id={id}
              name={query.data.user.name}
              role={query.data.user.role}
              onChanged={onClose}
            />
            <AccountSupportPanel id={id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
