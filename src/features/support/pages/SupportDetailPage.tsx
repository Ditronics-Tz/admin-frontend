import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supportService, workKind, type WorkKind } from '../services/support.service'
import { QueryError } from '@/components/feedback/QueryError'
import { PromoSkeleton, Empty } from '@/features/promotions/components/shared'
import { ReasonDialog, StatusBadge } from '@/components/common/ReasonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/features/operations/shared'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'

export default function SupportDetailPage() {
  const params = useParams(),
    kind = workKind(params.kind)
  if (kind && kind !== 'tickets' && params.id)
    return <Navigate to={`/reports/${encodeURIComponent(params.id)}`} replace />
  return kind && params.id ? (
    <SupportDetail key={`${kind}:${params.id}`} kind={kind} id={params.id} />
  ) : (
    <Empty message="Support record not found" />
  )
}
function SupportDetail({ kind, id }: { kind: WorkKind; id: string }) {
  const t = useShipText(),
    cache = useQueryClient(),
    { canWrite, user } = usePermission()
  const query = useQuery({
    queryKey: ['support', kind, id],
    queryFn: () => supportService.detail(kind, id),
    retry: false,
  })
  const [dialog, setDialog] = useState<'resolve' | 'update' | 'assign' | null>(null)
  const [status, setStatus] = useState(''),
    [priority, setPriority] = useState(''),
    [assignee, setAssignee] = useState(''),
    [note, setNote] = useState('')
  const mutation = useMutation({
    mutationFn: (run: () => Promise<void>) => run(),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ['support'] })
      setDialog(null)
      setNote('')
      toast.success(t('Support record updated'))
    },
    onError: (error) => toast.error(error.message),
  })
  if (query.isPending)
    return (
      <div className="p-5">
        <PromoSkeleton />
      </div>
    )
  if (query.isError)
    return (
      <div className="p-5">
        <QueryError error={query.error} retry={() => void query.refetch()} />
      </div>
    )
  const { item, notes } = query.data
  const statuses =
    kind === 'tickets'
      ? ['open', 'in_review', 'resolved', 'closed']
      : ['open', 'in_review', 'resolved', 'dismissed']
  const open = (mode: 'resolve' | 'update' | 'assign') => {
    mutation.reset()
    setStatus(item.status)
    setPriority(item.priority || 'normal')
    setAssignee(item.assigned_to || user?.id || '')
    setDialog(mode)
  }
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Link className="text-primary underline" to="/support">
        {t('Back to support')}
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{item.subject || item.title || item.id}</h1>
        <StatusBadge status={item.status} />
        <p className="text-sm">
          {item.category} · {item.priority} · {item.assigned_to || t('Unassigned')}
        </p>
      </header>
      <p className="whitespace-pre-wrap">{item.description}</p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!canWrite || mutation.isPending} onClick={() => open('assign')}>
          {t('Assign')}
        </Button>
        <Button
          variant="outline"
          disabled={!canWrite || mutation.isPending}
          onClick={() => open('update')}
        >
          {t('Change status or priority')}
        </Button>
        <Button
          disabled={
            !canWrite ||
            mutation.isPending ||
            ['resolved', 'closed'].includes(item.status)
          }
          onClick={() => open('resolve')}
        >
          {t('Resolve')}
        </Button>
      </div>
      <section className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">{t('Notes')}</h2>
        {notes.length ? (
          notes.map((entry) => (
            <article key={entry.id} className="border-b py-3">
              <p className="whitespace-pre-wrap">{entry.body || entry.note}</p>
              <p className="text-xs text-muted-foreground">
                {entry.author_name || entry.staff_id || '—'} ·{' '}
                {formatDateTime(entry.created_at)}
              </p>
            </article>
          ))
        ) : (
          <Empty message={t('No notes yet')} />
        )}
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (canWrite && note.trim())
              mutation.mutate(() => supportService.note(kind, id, note.trim()))
          }}
        >
          <label className="grid gap-1 text-sm">
            {t('Add note')}
            <Textarea
              required
              maxLength={4000}
              value={note}
              disabled={!canWrite || mutation.isPending}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <Button disabled={!canWrite || mutation.isPending || !note.trim()}>
            {t('Add note')}
          </Button>
        </form>
      </section>
      {!dialog && mutation.isError && <QueryError error={mutation.error} />}
      {dialog && (
        <ReasonDialog
          title={t(
            dialog === 'resolve'
              ? 'Resolve'
              : dialog === 'assign'
                ? 'Assign'
                : 'Change status or priority'
          )}
          pending={mutation.isPending}
          error={mutation.error}
          maxLength={kind === 'tickets' ? 500 : 2000}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => {
            if (canWrite)
              mutation.mutate(() =>
                supportService.patch(
                  kind,
                  id,
                  dialog === 'resolve'
                    ? { status: 'resolved', resolution_note: reason, reason }
                    : dialog === 'assign'
                      ? { assigned_to: assignee || null, reason }
                      : {
                          status,
                          priority,
                          reason,
                          ...(status === 'resolved' ? { resolution_note: reason } : {}),
                        }
                )
              )
          }}
        >
          {dialog === 'update' && (
            <>
              <Select
                label={t('Status')}
                value={status}
                options={statuses}
                onChange={setStatus}
              />
              <Select
                label={t('Priority')}
                value={priority}
                options={['low', 'normal', 'high', 'urgent']}
                onChange={setPriority}
              />
            </>
          )}
          {dialog === 'assign' && (
            <label className="grid gap-1 text-sm">
              {t('Staff ID (leave blank to assign to yourself)')}
              <Input
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
              />
            </label>
          )}
        </ReasonDialog>
      )}
    </main>
  )
}
