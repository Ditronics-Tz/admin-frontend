import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportService, type WorkKind } from '../services/support.service'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

function toRecord(value: unknown): { id: string; title: string; status: string } | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== 'string') return null
  return {
    id: item.id,
    title:
      typeof item.subject === 'string'
        ? item.subject
        : typeof item.title === 'string'
          ? item.title
          : item.id,
    status: typeof item.status === 'string' ? item.status : 'Not provided',
  }
}
export function WorkQueue({ kind }: { kind: WorkKind }) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', kind],
    queryFn: () => supportService.list(kind),
  })
  const [selected, setSelected] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (id: string) => supportService.update(kind, id),
    onSuccess: async (result) => {
      toast.success(`Server response: ${result.status}`)
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      setSelected(null)
    },
  })
  const records = (query.data || []).map(toRecord).filter((value) => value !== null)
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold capitalize">{kind}</h2>
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          Refresh
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        The current service returns an empty queue. Ticket and complaint persistence is
        still pending.
      </p>
      {query.isPending ? (
        <p>Loading queue…</p>
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : records.length === 0 ? (
        <p className="py-8 text-center text-sm">No {kind} returned by the service.</p>
      ) : (
        <ul className="divide-y">
          {records.map((record) => (
            <li key={record.id} className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{record.title}</p>
                <p className="text-xs text-muted-foreground">{record.status}</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  mutation.reset()
                  setSelected(record.id)
                }}
              >
                {kind === 'tickets' ? 'Mark in progress' : 'Resolve complaint'}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setSelected(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update {kind === 'tickets' ? 'ticket' : 'complaint'}?
            </DialogTitle>
            <DialogDescription>
              The current endpoint returns a status acknowledgement and writes an audit
              entry. It does not yet persist support records.
            </DialogDescription>
          </DialogHeader>
          {mutation.isError && <QueryError error={mutation.error} />}
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              if (selected) mutation.mutate(selected)
            }}
          >
            Confirm
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
