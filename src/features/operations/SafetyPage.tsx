import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import { safetyApi } from './safety.api'
import { useOperationsPermission } from './api'
import { useSafetyLive, useOpenSOS, AgeTimer } from './safety.live'
import { SafetyMap } from './SafetyMap'
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
export function SafetyPage() {
  const t = useOpsText(),
    q = useOpenSOS(),
    live = useSafetyLive()
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Safety">
        <Button asChild variant="outline">
          <Link to="/safety/history">{t('SOS history')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/safety/incidents">{t('Incidents')}</Link>
        </Button>
      </Heading>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <span role="status">
          {t(live.connection)} · {q.data?.total ?? '—'} {t('open alerts')}
        </span>
        <Button
          variant="outline"
          onClick={() => {
            live.setMuted(!live.muted)
            if (live.muted) {
              const audio = new AudioContext()
              void audio.resume().then(() => audio.close())
            }
          }}
        >
          {t(live.muted ? 'Enable sound' : 'Mute')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (typeof Notification !== 'undefined') void Notification.requestPermission()
          }}
        >
          {t('Enable browser notifications')}
        </Button>
      </div>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : q.data.alerts.length ? (
        <ResponsiveTable
          label="Open SOS"
          columns={['Alert', 'Age / SLA', 'Status', 'Escalation', 'Assigned'].map(t)}
          rows={q.data.alerts.map((a) => ({
            id: a.id,
            cells: [
              <Link
                to={`/safety/sos/${a.id}`}
                className="font-semibold text-red-700 underline"
              >
                {a.role} · {a.id.slice(0, 8)}
              </Link>,
              <AgeTimer created={a.created_at} sla={q.data.sla_seconds || 60} />,
              <StatusBadge status={a.status} />,
              a.escalation_level,
              a.assigned_to || t('Unassigned'),
            ],
          }))}
        />
      ) : (
        <Empty message={t('No open emergencies')} />
      )}
    </main>
  )
}
export function SOSDetailPage() {
  const { id = '' } = useParams(),
    t = useOpsText(),
    access = useOperationsPermission(),
    [reveal, setReveal] = useState(false),
    [offset, setOffset] = useState(0),
    [action, setAction] = useState<string | null>(null),
    [outcome, setOutcome] = useState('safe'),
    [who, setWho] = useState('passenger'),
    [method, setMethod] = useState('phone'),
    [result, setResult] = useState('answered')
  const q = useQuery({
    queryKey: ['operations', 'sos', 'detail', id, reveal, offset],
    queryFn: () => safetyApi.alert(id, reveal, offset),
    refetchInterval: 10000,
  })
  if (q.isPending) return <Loading />
  if (q.isError) return <QueryError error={q.error} retry={() => void q.refetch()} />
  const d = q.data,
    held = !!d.alert.assigned_to && d.alert.assigned_to !== access.user?.id
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="SOS alert">
        <StatusBadge status={d.alert.status} />
        <AgeTimer created={d.alert.created_at} />
      </Heading>
      {held && (
        <p role="status" className="rounded border border-amber-300 bg-amber-50 p-3">
          {t('Held by another staff member')}: {d.alert.assigned_to}
        </p>
      )}
      {d.alert.user_reported_safe && (
        <p>{t('User reports they are safe. Review before closing.')}</p>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-3">
          <SafetyMap
            lat={d.alert.last_lat}
            lng={d.alert.last_lng}
            trail={d.trail}
            pickup={{ lat: d.ride.pickup_lat, lng: d.ride.pickup_lng }}
            dropoff={{ lat: d.ride.dropoff_lat, lng: d.ride.dropoff_lng }}
          />
          {d.alert.last_location_at && (
            <DateLabel value={d.alert.last_location_at} relative />
          )}
          <Pagination
            total={d.trail_total}
            offset={offset}
            limit={100}
            onChange={setOffset}
          />
        </section>
        <div className="space-y-4">
          {[d.passenger, d.driver].map((p) => (
            <section key={p.id} className="rounded-lg border p-4">
              <h2 className="font-semibold">
                {p.name} · {p.role}
              </h2>
              <p>
                {p.status} · {p.average_rating.toFixed(1)}/5 · {p.reports_received}{' '}
                {t('reports')}
              </p>
              {reveal ? (
                <a href={`tel:${d.phones[p.id]}`}>{d.phones[p.id]}</a>
              ) : (
                <span>{d.phones[p.id]}</span>
              )}
              {p.role === 'driver' && <p>{d.vehicle}</p>}
              <p>
                {d.flags
                  .filter((f) => f.user_id === p.id)
                  .map((f) => f.reason)
                  .join(', ')}
              </p>
            </section>
          ))}
          <section className="rounded-lg border p-4">
            <h2 className="font-semibold">{t('Emergency contacts')}</h2>
            <Button variant="outline" onClick={() => setReveal((v) => !v)}>
              {t(reveal ? 'Mask contacts' : 'Reveal contacts and phones (audited)')}
            </Button>
            {d.contacts.map((c) => (
              <p key={c.id}>
                {c.name} · {c.relationship} ·{' '}
                {reveal ? <a href={`tel:${c.phone}`}>{c.phone}</a> : c.phone}
              </p>
            ))}
          </section>
        </div>
      </div>
      <section className="rounded-lg border p-4">
        <h2>{t('Ride timeline')}</h2>
        <p>
          {d.ride.status} · {d.ride.pickup} → {d.ride.dropoff}
        </p>
        <DateLabel value={d.ride.created_at} />
        {d.ride.completed_at && <DateLabel value={d.ride.completed_at} />}
      </section>
      <section className="rounded-lg border p-4">
        <h2>{t('SOS timeline')}</h2>
        {d.timeline.map((e) => (
          <article className="border-b py-2" key={e.id}>
            <strong>{t(e.type)}</strong>
            <p>{e.note}</p>
            <DateLabel value={e.created_at} />
          </article>
        ))}
        <Pagination
          total={d.timeline_total}
          offset={offset}
          limit={100}
          onChange={setOffset}
        />
      </section>
      {access.write && !d.alert.resolved_at && (
        <div className="flex flex-wrap gap-2">
          {['acknowledge', 'note', 'call-attempt', 'escalate', 'resolve'].map((a) => (
            <Button key={a} disabled={held && !access.admin} onClick={() => setAction(a)}>
              {t(a)}
            </Button>
          ))}
        </div>
      )}
      {action && (
        <ActionDialog
          title={action}
          onClose={() => setAction(null)}
          requireNote={action === 'resolve' || action === 'note'}
          run={(note) =>
            safetyApi.action(id, action, {
              note,
              outcome,
              who,
              method,
              result,
              override: held && access.admin,
            })
          }
        >
          {action === 'resolve' && (
            <Select
              label="Outcome"
              value={outcome}
              onChange={setOutcome}
              options={['safe', 'police_contacted', 'medical', 'false_alarm', 'other']}
            />
          )}{' '}
          {action === 'call-attempt' && (
            <>
              <Select
                label="Who"
                value={who}
                onChange={setWho}
                options={['passenger', 'driver', 'emergency_contact']}
              />
              <Select
                label="Method"
                value={method}
                onChange={setMethod}
                options={['phone', 'sms']}
              />
              <Select
                label="Result"
                value={result}
                onChange={setResult}
                options={['answered', 'no_answer', 'failed']}
              />
            </>
          )}
          {held && access.admin && (
            <p>{t('This will override the current assignment.')}</p>
          )}
        </ActionDialog>
      )}
    </main>
  )
}
export function SOSHistoryPage() {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [offset, setOffset] = useState(0),
    [outcome, setOutcome] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [staff, setStaff] = useState('')
  const params = {
    offset,
    limit: 20,
    outcome,
    staff,
    from: from ? new Date(from + 'T00:00:00+03:00').toISOString() : '',
    to: to ? new Date(to + 'T00:00:00+03:00').toISOString() : '',
  }
  const q = useQuery({
    queryKey: ['operations', 'sos', 'history', params],
    queryFn: () => safetyApi.alerts(params),
  })
  return (
    <main className="space-y-4 p-4 sm:p-8">
      <Heading title="SOS history">
        {access.admin && (
          <Button
            variant="outline"
            onClick={() =>
              void safetyApi
                .csv(params)
                .then((blob) => {
                  const url = URL.createObjectURL(blob),
                    a = document.createElement('a')
                  a.href = url
                  a.download = 'sos-history.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                })
                .catch((e) =>
                  import('sonner').then(({ toast }) => toast.error(e.message))
                )
            }
          >
            {t('Export CSV')}
          </Button>
        )}
      </Heading>
      <div className="grid gap-3 sm:grid-cols-4">
        <Select
          label="Outcome"
          value={outcome}
          onChange={(v) => {
            setOutcome(v)
            setOffset(0)
          }}
          options={['', 'safe', 'police_contacted', 'medical', 'false_alarm', 'other']}
        />
        <label>
          {t('From date (Dar es Salaam)')}
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label>
          {t('Before date (Dar es Salaam)')}
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label>
          {t('Staff UUID')}
          <Input
            value={staff}
            onChange={(e) => {
              setStaff(e.target.value)
              setOffset(0)
            }}
          />
        </label>
      </div>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          {q.data.alerts.length ? (
            <ResponsiveTable
              label="SOS history"
              columns={['Alert', 'Outcome', 'Assigned', 'Date'].map(t)}
              rows={q.data.alerts.map((a) => ({
                id: a.id,
                cells: [
                  <Link to={`/safety/sos/${a.id}`}>{a.id}</Link>,
                  a.outcome || a.status,
                  a.assigned_to || '�',
                  <DateLabel value={a.created_at} />,
                ],
              }))}
            />
          ) : (
            <Empty />
          )}
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
    </main>
  )
}
export function IncidentsPage() {
  const t = useOpsText(),
    [offset, setOffset] = useState(0),
    [status, setStatus] = useState('new')
  const q = useQuery({
    queryKey: ['operations', 'incidents', offset, status],
    queryFn: () => safetyApi.incidents({ offset, limit: 20, status }),
  })
  return (
    <main className="space-y-4 p-4 sm:p-8">
      <Heading title="Incidents" />
      <Select
        label="Status"
        value={status}
        onChange={(v) => {
          setStatus(v)
          setOffset(0)
        }}
        options={['', 'new', 'in_review', 'resolved', 'closed']}
      />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          {q.data.incidents.length ? (
            <ResponsiveTable
              label="Incidents"
              columns={['Category', 'Severity', 'Status', 'Date', 'View'].map(t)}
              rows={q.data.incidents.map((i) => ({
                id: i.id,
                cells: [
                  t(i.category),
                  <StatusBadge status={i.severity} />,
                  i.status,
                  <DateLabel value={i.created_at} />,
                  <Link to={`/safety/incidents/${i.id}`}>{t('View')}</Link>,
                ],
              }))}
            />
          ) : (
            <Empty />
          )}
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
    </main>
  )
}
export function IncidentDetailPage() {
  const { id = '' } = useParams(),
    t = useOpsText(),
    access = useOperationsPermission(),
    [offset, setOffset] = useState(0),
    [action, setAction] = useState<string | null>(null)
  const q = useQuery({
    queryKey: ['operations', 'incident', id, offset],
    queryFn: () => safetyApi.incident(id, offset),
  })
  if (q.isPending) return <Loading />
  if (q.isError) return <QueryError error={q.error} retry={() => void q.refetch()} />
  const d = q.data
  return (
    <main className="space-y-4 p-4 sm:p-8">
      <Heading title="Incident detail">
        <StatusBadge status={d.incident.status} />
      </Heading>
      <h2>
        {t(d.incident.category)} · {t(d.incident.severity)}
      </h2>
      <p className="whitespace-pre-wrap">{d.incident.description}</p>
      <p>{d.incident.location}</p>
      <DateLabel value={d.incident.occurred_at} />
      <section className="flex flex-wrap gap-2">
        {d.attachments.map((f) => (
          <Button
            key={f.id}
            variant="outline"
            onClick={() =>
              void safetyApi
                .file(f.id)
                .then((blob) => {
                  const url = URL.createObjectURL(blob)
                  window.open(url, '_blank', 'noopener')
                  setTimeout(() => URL.revokeObjectURL(url), 60000)
                })
                .catch((e) =>
                  import('sonner').then(({ toast }) => toast.error(e.message))
                )
            }
          >
            {t('View attachment')}
          </Button>
        ))}
      </section>
      {d.notes.length ? (
        d.notes.map((n) => (
          <article key={n.id} className="rounded-lg border p-3">
            <p>{n.note}</p>
            <DateLabel value={n.created_at} />
          </article>
        ))
      ) : (
        <Empty />
      )}
      <Pagination total={d.notes_total} offset={offset} onChange={setOffset} />
      {access.write && (
        <div className="flex gap-2">
          {['assign', 'note', 'resolve'].map((a) => (
            <Button key={a} onClick={() => setAction(a)}>
              {t(a)}
            </Button>
          ))}
        </div>
      )}
      {action && (
        <ActionDialog
          title={action}
          onClose={() => setAction(null)}
          requireNote={action !== 'assign'}
          run={(note) => safetyApi.incidentAction(id, action, { note })}
        />
      )}
    </main>
  )
}
