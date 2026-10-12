import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountService } from '../services/account.service'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { formatDateTime } from '@/lib/utils/formatters'

export function AccountSupportPanel({ id }: { id: string }) {
  const { isAdmin } = usePermission()
  const cache = useQueryClient()
  const user = useQuery({ queryKey: ['user', id], queryFn: () => accountService.get(id) })
  const notes = useQuery({
    queryKey: ['user-notes', id],
    queryFn: () => accountService.notes(id),
  })
  const history = useQuery({
    queryKey: ['user-history', id],
    queryFn: () => accountService.history(id),
  })
  const [reason, setReason] = useState('')
  const [until, setUntil] = useState('')
  const [body, setBody] = useState('')
  const [action, setAction] = useState<'suspend' | 'reactivate' | 'ban'>('suspend')
  const mutation = useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: async () => {
      setReason('')
      setBody('')
      await Promise.all(
        [
          ['user', id],
          ['user-notes', id],
          ['user-history', id],
          ['drivers'],
          ['driver', id],
          ['customers'],
          ['verification', id],
        ].map((queryKey) => cache.invalidateQueries({ queryKey }))
      )
    },
  })
  if (user.isPending) return <p>Loading account…</p>
  if (user.isError)
    return <QueryError error={user.error} retry={() => void user.refetch()} />
  const account = user.data.user
  return (
    <section className="space-y-5 rounded-xl border bg-white p-5 text-sm">
      <h3 className="font-semibold">Account control and staff notes</h3>
      <p>
        Status:{' '}
        <strong className="capitalize">
          {account.status || (account.is_active ? 'active' : 'suspended')}
        </strong>
        {account.suspended_until && ` until ${formatDateTime(account.suspended_until)}`}
      </p>
      <p>
        Phone: {account.phone || 'Not collected'} ·{' '}
        {account.phone_verified_at ? 'OTP verified' : 'Not verified'}
      </p>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate(() =>
            accountService.status(
              id,
              action,
              reason,
              action === 'suspend' && until ? new Date(until).toISOString() : undefined
            )
          )
        }}
      >
        <label className="block">
          Action
          <select
            className="mt-1 block w-full rounded border p-2"
            value={action}
            onChange={(e) => setAction(e.target.value as typeof action)}
          >
            <option value="suspend">Suspend account</option>
            <option value="reactivate">Reactivate account</option>
            {isAdmin && <option value="ban">Permanent ban</option>}
          </select>
        </label>
        <label className="block">
          Reason (required)
          <textarea
            required
            maxLength={2000}
            className="mt-1 block w-full rounded border p-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {action === 'suspend' && (
          <label className="block">
            Until (optional, your local time)
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded border p-2"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
            />
          </label>
        )}
        {action === 'ban' && (
          <p className="text-rose-700">
            This permanently blocks the account. Only an admin can lift the ban.
          </p>
        )}
        <Button disabled={mutation.isPending || !reason.trim()} type="submit">
          Confirm account action
        </Button>
      </form>
      {mutation.isError && <QueryError error={mutation.error} />}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-semibold">Internal notes · staff only</h4>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate(() => accountService.addNote(id, body))
          }}
        >
          <textarea
            aria-label="Internal note"
            required
            maxLength={4000}
            className="block w-full rounded border p-2"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={mutation.isPending || !body.trim()}
          >
            Add note
          </Button>
        </form>
        {notes.isError && <QueryError error={notes.error} />}
        {notes.data?.map((note) => (
          <article className="space-y-1 border-b py-3" key={note.id}>
            <p className="whitespace-pre-wrap">{note.body}</p>
            <p className="text-xs text-muted-foreground">
              {note.author_name} · {formatDateTime(note.created_at)}
            </p>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate(() => accountService.deleteNote(id, note.id))
                }
              >
                Delete note
              </Button>
            )}
          </article>
        ))}
        {notes.data?.length === 0 && <p>No staff notes yet.</p>}
      </div>
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-semibold">Suspension and reactivation history</h4>
        {history.isError && <QueryError error={history.error} />}
        {history.data?.status_events.map((event) => (
          <article className="space-y-1 border-b py-3" key={event.id}>
            <p className="capitalize">
              {event.from_status} → {event.to_status}
            </p>
            <p className="whitespace-pre-wrap">{event.reason}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(event.created_at)} · {event.actor_id || 'System'}
              {event.until && ` · Until ${formatDateTime(event.until)}`}
            </p>
          </article>
        ))}
        {history.data?.status_events.length === 0 && <p>No status changes yet.</p>}
      </div>
    </section>
  )
}
