import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import { operationsApi, useOperationsPermission, type Party } from './api'
import {
  Heading,
  Loading,
  Empty,
  Pagination,
  ResponsiveTable,
  StatusBadge,
  DateLabel,
  Select,
  ActionDialog,
  useOpsText,
} from './shared'
import { dateInputISO as fromLocalDateTime } from '@/features/promotions/utils'

export function ReportsPage() {
  const t = useOpsText(),
    { user } = useOperationsPermission(),
    [status, setStatus] = useState('open'),
    [category, setCategory] = useState(''),
    [mine, setMine] = useState(false),
    [offset, setOffset] = useState(0),
    [age, setAge] = useState('')
  const [now] = useState(() => Date.now())
  const [search] = useSearchParams()
  const params = {
    status,
    category,
    assignee: mine ? user?.id || '' : '',
    offset,
    limit: 20,
    ...(search.get('user') ? { user: search.get('user')! } : {}),
    ...(age ? { before: new Date(now - Number(age) * 86400000).toISOString() } : {}),
  }
  const q = useQuery({
    queryKey: ['operations', 'reports', params],
    queryFn: () => operationsApi.reports(params),
  })
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Reports">
        <Button asChild variant="outline">
          <Link to="/reports/flags">{t('Flagged accounts')}</Link>
        </Button>
      </Heading>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('Status')}>
        {['open', 'in_review', 'resolved'].map((s) => (
          <Button
            key={s}
            variant={s === status ? 'default' : 'outline'}
            onClick={() => {
              setStatus(s)
              setOffset(0)
            }}
          >
            {t(s === 'open' ? 'Open' : s === 'in_review' ? 'In review' : 'Resolved')}
          </Button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label="Category"
          value={category}
          onChange={(v) => {
            setCategory(v)
            setOffset(0)
          }}
          options={[
            '',
            'unsafe_driving',
            'harassment',
            'no_show',
            'fare_dispute',
            'vehicle_mismatch',
            'discrimination',
            'fraud',
            'other',
          ]}
        />
        <Select
          label="Older than (days)"
          value={age}
          onChange={(v) => {
            setAge(v)
            setOffset(0)
          }}
          options={['', '1', '7', '30']}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => {
              setMine(e.target.checked)
              setOffset(0)
            }}
          />
          {t('Assigned to me')}
        </label>
      </div>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          <ReportRows reports={q.data.reports} />
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
    </main>
  )
}
function ReportRows({
  reports,
}: {
  reports: Awaited<ReturnType<typeof operationsApi.reports>>['reports']
}) {
  const t = useOpsText()
  return reports.length ? (
    <ResponsiveTable
      label={t('Reports')}
      columns={['Category', 'Priority', 'Status', 'Date', 'View'].map(t)}
      rows={reports.map((r) => ({
        id: r.id,
        cells: [
          t(r.category.replaceAll('_', ' ')),
          <StatusBadge status={r.priority} />,
          <StatusBadge status={r.status} />,
          <DateLabel value={r.created_at} relative />,
          <Link className="text-brand-primary-teal underline" to={`/reports/${r.id}`}>
            {t('View')}
          </Link>,
        ],
      }))}
    />
  ) : (
    <Empty message={t('No records found')} />
  )
}
function PartyCard({ party, label }: { party: Party; label: string }) {
  const t = useOpsText()
  return (
    <section className="rounded-lg border p-4">
      <h2 className="font-semibold">
        {t(label)}: {party.name}
      </h2>
      <p>
        {party.role} · {party.status}
      </p>
      <p>
        {party.average_rating.toFixed(1)} / 5 · {party.reports_received}{' '}
        {t('previous reports')}
      </p>
      <Link
        to={party.role === 'driver' ? `/drivers/${party.id}` : '/passengers'}
        className="text-brand-primary-teal underline"
      >
        {t('Account details')}
      </Link>
    </section>
  )
}
export function ReportDetailPage() {
  const { id = '' } = useParams(),
    t = useOpsText(),
    access = useOperationsPermission(),
    [action, setAction] = useState<string | null>(null),
    [noteOffset, setNoteOffset] = useState(0)
  const q = useQuery({
    queryKey: ['operations', 'report', id, noteOffset],
    queryFn: () => operationsApi.report(id, noteOffset),
  })
  const perform = (note: string, until: string) =>
    operationsApi.reportAction(
      id,
      action === 'assign' ? 'assign' : action === 'note' ? 'note' : 'resolve',
      action === 'assign'
        ? {}
        : action === 'note'
          ? { note }
          : {
              outcome: action,
              note,
              ...(until ? { until: fromLocalDateTime(until) } : {}),
            }
    )
  if (q.isPending) return <Loading />
  if (q.isError) return <QueryError error={q.error} retry={() => void q.refetch()} />
  const d = q.data
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Report detail">
        <Link to="/reports">{t('Reports')}</Link>
        <StatusBadge status={d.report.status} />
      </Heading>
      <div className="grid gap-4 md:grid-cols-2">
        <PartyCard party={d.reporter} label="Reporter (staff only)" />
        <PartyCard party={d.reported} label="Reported account" />
      </div>
      <section className="space-y-2 rounded-lg border p-4">
        <h2 className="font-semibold">{t('Ride timeline')}</h2>
        <p>
          {d.ride.pickup} → {d.ride.dropoff}
        </p>
        <p>{d.ride.status}</p>
        <DateLabel value={d.ride.created_at} />
        {d.ride.completed_at && <DateLabel value={d.ride.completed_at} />}
      </section>
      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">{t(d.report.category.replaceAll('_', ' '))}</h2>
        <p className="whitespace-pre-wrap">{d.report.description}</p>
        {d.report.resolution_note && <p>{d.report.resolution_note}</p>}
      </section>
      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">{t('Notes')}</h2>
        {d.notes.length ? (
          d.notes.map((n) => (
            <article key={n.id} className="border-b py-3">
              <p className="whitespace-pre-wrap">{n.note}</p>
              <DateLabel value={n.created_at} />
            </article>
          ))
        ) : (
          <Empty />
        )}
        <Pagination total={d.notes_total} offset={noteOffset} onChange={setNoteOffset} />
      </section>
      {d.report.assigned_to && (
        <p>
          {t('Assigned to')}:{' '}
          {d.report.assigned_to === access.user?.id ? t('You') : d.report.assigned_to}
        </p>
      )}
      {access.write ? (
        <div className="flex flex-wrap gap-2">
          {Object.entries({
            assign: 'Assign to me',
            note: 'Add note',
            dismissed: 'Dismiss',
            warning: 'Warn',
            suspended: 'Suspend',
            escalated: 'Escalate',
          }).map(([key, label]) => (
            <Button
              key={key}
              variant={key === 'suspended' ? 'destructive' : 'outline'}
              onClick={() => setAction(key)}
            >
              {t(label)}
            </Button>
          ))}
        </div>
      ) : (
        <p>{t('Read-only access')}</p>
      )}
      {action && (
        <ActionDialog
          title={action}
          onClose={() => setAction(null)}
          run={perform}
          requireNote={action !== 'assign'}
          until={action === 'suspended'}
        >
          <p>
            {action === 'suspended' && !access.admin
              ? t('Support suspensions must end within seven days.')
              : t('This action is recorded in the audit log.')}
          </p>
        </ActionDialog>
      )}
    </main>
  )
}
export function FlagsPage() {
  const t = useOpsText(),
    [offset, setOffset] = useState(0),
    [id, setId] = useState<string | null>(null),
    access = useOperationsPermission()
  const q = useQuery({
    queryKey: ['operations', 'flags', offset],
    queryFn: () => operationsApi.flags(offset),
  })
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Flagged accounts" />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          {q.data.flags.length ? (
            <ResponsiveTable
              label={t('Flagged accounts')}
              columns={['User', 'Reason', 'Date', 'Actions'].map(t)}
              rows={q.data.flags.map((f) => ({
                id: f.id,
                cells: [
                  <Link to={`/reports?user=${f.user_id}`}>{f.user_id}</Link>,
                  t(f.reason),
                  <DateLabel value={f.created_at} />,
                  access.write ? (
                    <Button onClick={() => setId(f.id)}>{t('Resolve')}</Button>
                  ) : (
                    t('Read-only access')
                  ),
                ],
              }))}
            />
          ) : (
            <Empty />
          )}
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
      {id && (
        <ActionDialog
          title="Resolve flag"
          requireNote={false}
          onClose={() => setId(null)}
          run={() => operationsApi.resolveFlag(id)}
        />
      )}
    </main>
  )
}
export function UserReports({ id }: { id: string }) {
  const [offset, setOffset] = useState(0),
    t = useOpsText()
  const q = useQuery({
    queryKey: ['operations', 'user-reports', id, offset],
    queryFn: () => operationsApi.userReports(id, offset),
  })
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">{t('Reports')}</h2>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          <p>
            {q.data.party.reports_received} {t('reports received')} ·{' '}
            {q.data.blocked_by_count} {t('blocked by')} · {q.data.blocked_count}{' '}
            {t('blocked')}
          </p>
          <ReportRows reports={q.data.reports} />
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
    </section>
  )
}
