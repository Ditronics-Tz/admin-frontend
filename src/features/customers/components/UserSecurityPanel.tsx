import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { securityService } from '../services/security.service'
import { DataTable } from '@/components/common/DataTable'
import { ConfirmDialog, StatusBadge } from '@/components/common/ReasonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/feedback/QueryError'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'

export function UserSecurityPanel({ id }: { id: string }) {
  const t = useShipText(),
    cache = useQueryClient(),
    { isAdmin, canWrite } = usePermission()
  const [offset, setOffset] = useState(0),
    [eventOffset, setEventOffset] = useState(0),
    [type, setType] = useState('')
  const [confirm, setConfirm] = useState<{
    title: string
    run: () => Promise<void>
  } | null>(null)
  const sessions = useQuery({
    queryKey: ['user-security', id, 'sessions', offset],
    queryFn: () => securityService.sessions(id, offset),
    retry: false,
    refetchInterval: 30000,
  })
  const events = useQuery({
    queryKey: ['user-security', id, 'events', type, eventOffset],
    queryFn: () => securityService.events(id, type, eventOffset),
    retry: false,
  })
  const action = useMutation({
    mutationFn: () => confirm!.run(),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ['user-security', id] })
      setConfirm(null)
      toast.success(t('Security action completed'))
    },
    onError: (error) => toast.error(error.message),
  })
  const locked =
    !!sessions.data?.locked_until &&
    Date.parse(sessions.data.locked_until) > sessions.dataUpdatedAt
  const ask = (title: string, run: () => Promise<void>) => {
    action.reset()
    setConfirm({ title: t(title), run })
  }
  return (
    <section className="space-y-5 rounded-xl border bg-white p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{t('Security and sessions')}</h3>
        <Button
          variant="outline"
          disabled={!canWrite || !sessions.data || action.isPending}
          onClick={() => ask('Log out everywhere', () => securityService.revoke(id))}
        >
          {t('Log out everywhere')}
        </Button>
      </header>
      {sessions.data && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={locked ? 'locked' : 'unlocked'} />
          {locked && <span>{formatDateTime(sessions.data.locked_until!)}</span>}
          <span>
            {t('Failed login count')}:{' '}
            {sessions.data.failed_login_count ?? t('Unavailable')}
          </span>
          {isAdmin && locked && (
            <Button
              size="sm"
              disabled={!canWrite || action.isPending}
              onClick={() => ask('Unlock account', () => securityService.unlock(id))}
            >
              {t('Unlock account')}
            </Button>
          )}
        </div>
      )}
      <DataTable
        label={t('Active sessions')}
        columns={['Device', 'IP', 'Created', 'Last used', 'Actions'].map(t)}
        loading={sessions.isPending}
        error={sessions.error}
        retry={() => void sessions.refetch()}
        rows={(sessions.data?.sessions || []).map((session) => ({
          id: session.id,
          cells: [
            `${session.platform || t('Unknown device')} · ${session.device_id || '—'}`,
            session.ip || '—',
            formatDateTime(session.created_at),
            session.last_used_at ? formatDateTime(session.last_used_at) : '—',
            <Button
              size="sm"
              variant="outline"
              disabled={!canWrite || action.isPending}
              onClick={() =>
                ask('Revoke session', () => securityService.revoke(id, session.id))
              }
            >
              {t('Revoke')}
            </Button>,
          ],
        }))}
        total={sessions.data?.total || 0}
        offset={offset}
        onPage={setOffset}
      />
      <h4 className="font-semibold">{t('Security events')}</h4>
      <label className="grid gap-1 text-sm">
        {t('Event type')}
        <Input
          value={type}
          onChange={(event) => {
            setType(event.target.value)
            setEventOffset(0)
          }}
        />
      </label>
      <DataTable
        label={t('Security events')}
        columns={['Type', 'IP', 'Time (EAT)'].map(t)}
        loading={events.isPending}
        error={events.error}
        retry={() => void events.refetch()}
        rows={(events.data?.events || []).map((event) => ({
          id: event.id,
          cells: [event.type, event.ip || '—', formatDateTime(event.created_at)],
        }))}
        total={events.data?.total || 0}
        offset={eventOffset}
        onPage={setEventOffset}
      />
      {!confirm && action.isError && <QueryError error={action.error} />}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          description={t('This action changes the account security state.')}
          pending={action.isPending}
          error={action.error}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            if (canWrite) action.mutate()
          }}
        />
      )}
    </section>
  )
}
