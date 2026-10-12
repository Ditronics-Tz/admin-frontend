import { SafetyMap } from './SafetyMap'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/feedback/QueryError'
import { useOperationsPermission } from './api'
import {
  fraudApi,
  canEditFraudRules,
  canResolveFraud,
  type FraudFlag,
  type RuleStatus,
} from './fraud.api'
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
const explanations: Record<string, string> = {
  shared_device: 'More accounts than the configured limit used the same device.',
  duplicate_identifiers: 'Another account submitted a matching phone, licence or plate.',
  cancellation_abuse:
    'Cancellation frequency passed the threshold after the minimum ride count.',
  location_mismatch: 'Recorded movement was too short, repeated or implausibly fast.',
  collusion: 'A passenger and driver repeatedly completed suspicious rides.',
  rating_manipulation:
    'Repeated reciprocal five-star ratings or low ratings from new accounts were detected.',
  promo_referral_abuse: 'Connected accounts exceeded referral or promotion thresholds.',
  payout_anomaly:
    'A payout followed a cash-ride burst or shares a destination with many accounts.',
}
function parseEvidence(raw: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(raw)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}
function FraudRows({ flags }: { flags: FraudFlag[] }) {
  const t = useOpsText()
  return flags.length ? (
    <ResponsiveTable
      label={t('Fraud flags')}
      columns={['Rule', 'Severity', 'Score', 'Status', 'Assignee', 'Age', 'View'].map(t)}
      rows={flags.map((f) => ({
        id: f.id,
        cells: [
          t(f.rule_key.replaceAll('_', ' ')),
          <StatusBadge status={f.severity} />,
          f.score,
          <StatusBadge status={f.status} />,
          f.assigned_to || t('Unassigned'),
          <DateLabel value={f.created_at} relative />,
          <Link to={`/fraud/${f.id}`} className="text-brand-primary-teal underline">
            {t('View')}
          </Link>,
        ],
      }))}
    />
  ) : (
    <Empty />
  )
}
export function FraudPage() {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [status, setStatus] = useState('open'),
    [severity, setSeverity] = useState(''),
    [type, setType] = useState(''),
    [mine, setMine] = useState(false),
    [hold, setHold] = useState(''),
    [from, setFrom] = useState(''),
    [offset, setOffset] = useState(0)
  const params = {
    status,
    severity,
    type,
    assignee: mine ? access.user?.id || '' : '',
    hold,
    from: from ? new Date(from + 'T00:00:00+03:00').toISOString() : '',
    offset,
    limit: 20,
  }
  const q = useQuery({
    queryKey: ['operations', 'fraud', params],
    queryFn: () => fraudApi.flags(params),
  })
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Fraud">
        <Button asChild variant="outline">
          <Link to="/fraud/rules">{t('Rules')}</Link>
        </Button>
      </Heading>
      <div className="grid gap-3 sm:grid-cols-4">
        <Select
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v)
            setOffset(0)
          }}
          options={['', 'open', 'reviewing', 'confirmed', 'dismissed']}
        />
        <Select
          label="Severity"
          value={severity}
          onChange={(v) => {
            setSeverity(v)
            setOffset(0)
          }}
          options={['', 'low', 'medium', 'high']}
        />
        <Select
          label="Rule"
          value={type}
          onChange={(v) => {
            setType(v)
            setOffset(0)
          }}
          options={['', ...Object.keys(explanations)]}
        />
        <Select
          label="Payout hold"
          value={hold}
          onChange={(v) => {
            setHold(v)
            setOffset(0)
          }}
          options={['', 'active', 'none']}
        />
        <label className="grid gap-1 text-sm">
          {t('Created after (Dar es Salaam)')}
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setOffset(0)
            }}
          />
        </label>
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
          <p>
            {q.data.holds.length} {t('active holds on this page')}
          </p>
          <FraudRows flags={q.data.flags} />
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
    </main>
  )
}
export function FraudDetailPage() {
  const { id = '' } = useParams(),
    t = useOpsText(),
    access = useOperationsPermission(),
    [offset, setOffset] = useState(0),
    [action, setAction] = useState<string | null>(null),
    [suspend, setSuspend] = useState(false)
  const q = useQuery({
    queryKey: ['operations', 'fraud-detail', id, offset],
    queryFn: () => fraudApi.flag(id, offset),
  })
  if (q.isPending) return <Loading />
  if (q.isError) return <QueryError error={q.error} retry={() => void q.refetch()} />
  const d = q.data,
    canTriage = access.write
  const evidence = parseEvidence(d.flag.evidence)
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Fraud flag">
        <StatusBadge status={d.flag.severity} />
        <StatusBadge status={d.flag.status} />
      </Heading>
      <p className="max-w-3xl">{t(explanations[d.flag.rule_key] || d.flag.rule_key)}</p>
      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">{d.user.name}</h2>
        <p>
          {d.user.status} · {d.user.average_rating.toFixed(1)}/5
        </p>
        <Link to={d.user.role === 'driver' ? `/drivers/${d.user.id}` : '/passengers'}>
          {t('Account details')}
        </Link>
        <p>{d.holds.map((h) => t(h.type)).join(', ') || t('No active holds')}</p>
      </section>
      <ResponsiveTable
        label={t('Evidence')}
        columns={['Metric', 'Value'].map(t)}
        rows={Object.entries(evidence).map(([key, value]) => ({
          id: key,
          cells: [
            t(key.replaceAll('_', ' ')),
            Array.isArray(value) ? value.map(String).join(', ') : String(value),
          ],
        }))}
      />
      {d.flag.rule_key === 'location_mismatch' &&
        Array.isArray(evidence.ride_ids) &&
        evidence.ride_ids.map((ride) => (
          <FraudTrail key={String(ride)} id={String(ride)} />
        ))}
      <h2 className="font-semibold">{t('Linked accounts')}</h2>
      {d.linked_accounts.length ? (
        d.linked_accounts.map((a) => (
          <article className="rounded-lg border p-3" key={a.id}>
            <Link to={a.role === 'driver' ? `/drivers/${a.id}` : '/passengers'}>
              {a.name}
            </Link>{' '}
            · {a.status}
          </article>
        ))
      ) : (
        <Empty />
      )}
      <h2>{t('Related flags')}</h2>
      <FraudRows flags={d.related_flags} />
      <h2>{t('Timeline')}</h2>
      {d.actions.map((a) => (
        <article key={a.id}>
          <p>{t(a.action)}</p>
          <DateLabel value={a.at} />
        </article>
      ))}
      {d.notes.map((n) => (
        <article className="border-t py-3" key={n.id}>
          <p>{n.note}</p>
          <DateLabel value={n.created_at} />
        </article>
      ))}
      <Pagination
        total={Math.max(d.related_total, d.actions_total, d.notes_total)}
        offset={offset}
        onChange={setOffset}
      />
      {canTriage && (
        <div className="flex flex-wrap gap-2">
          {[
            'assign',
            'note',
            ...(canResolveFraud(access.user?.role, d.flag.severity, 'dismissed')
              ? ['dismissed']
              : []),
            ...(access.admin ? ['confirmed', 'hold-payouts', 'release'] : []),
          ].map((a) => (
            <Button
              key={a}
              variant={a === 'confirmed' ? 'destructive' : 'outline'}
              onClick={() => setAction(a)}
            >
              {t(a)}
            </Button>
          ))}
        </div>
      )}
      {!canTriage && <p>{t('Read-only access')}</p>}
      {action && (
        <ActionDialog
          title={action}
          onClose={() => setAction(null)}
          requireNote={['confirmed', 'dismissed', 'note'].includes(action)}
          run={(note) =>
            fraudApi.action(
              id,
              ['confirmed', 'dismissed'].includes(action) ? 'resolve' : action,
              { status: action, note, suspend: action === 'confirmed' && suspend }
            )
          }
        >
          {action === 'confirmed' && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={suspend}
                onChange={(e) => setSuspend(e.target.checked)}
              />
              {t('Also suspend this account')}
            </label>
          )}
        </ActionDialog>
      )}
    </main>
  )
}
export function FraudRulesPage() {
  const q = useQuery({ queryKey: ['operations', 'fraud-rules'], queryFn: fraudApi.rules })
  if (q.isPending) return <Loading />
  if (q.isError) return <QueryError error={q.error} retry={() => void q.refetch()} />
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Fraud rules" />
      {q.data.rules.map((r) => (
        <RuleCard key={r.rule.key + JSON.stringify(r)} initial={r} />
      ))}
    </main>
  )
}
function RuleCard({ initial }: { initial: RuleStatus }) {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [rule, setRule] = useState(initial.rule),
    [confirm, setConfirm] = useState(false),
    [dry, setDry] = useState(false),
    [count, setCount] = useState<number | null>(null)
  let params: Record<string, number> = {}
  try {
    params = JSON.parse(rule.params)
  } catch {
    params = {}
  }
  const write = canEditFraudRules(access.user?.role, access.write)
  return (
    <section className="space-y-3 rounded-lg border bg-white p-4">
      <h2 className="font-semibold">{t(rule.key.replaceAll('_', ' '))}</h2>
      <p className="text-sm">{t(explanations[rule.key] || '')}</p>
      {!initial.effective_enabled && (
        <p role="status" className="text-sm text-amber-800">
          {t(initial.disabled_reason || 'Disabled by an administrator')}
        </p>
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          role="switch"
          disabled={!write}
          checked={rule.enabled}
          onChange={(e) => setRule((r) => ({ ...r, enabled: e.target.checked }))}
        />
        {t('Enabled')}
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(params).map(([key, value]) => (
          <label key={key} className="text-sm">
            {t(key.replaceAll('_', ' '))}
            <Input
              type="number"
              min="1"
              step="1"
              disabled={!write}
              value={value}
              onChange={(e) =>
                setRule((r) => ({
                  ...r,
                  params: JSON.stringify({ ...params, [key]: Number(e.target.value) }),
                }))
              }
            />
          </label>
        ))}
      </div>
      <Select
        label="Severity"
        value={rule.severity}
        disabled={!write}
        onChange={(v) => {
          if (write) setRule((r) => ({ ...r, severity: v as typeof r.severity }))
        }}
        options={['low', 'medium', 'high']}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={!write}
          checked={rule.auto_mitigation.includes('payout_hold')}
          onChange={(e) =>
            setRule((r) => ({
              ...r,
              auto_mitigation: e.target.checked ? 'payout_hold,promo_block' : '',
            }))
          }
        />
        {t('Hold payouts and promos until review')}
      </label>
      {write && (
        <div className="flex gap-2">
          <Button
            disabled={Object.values(params).some(
              (v) => !Number.isSafeInteger(v) || v <= 0
            )}
            onClick={() => setConfirm(true)}
          >
            {t('Save rule')}
          </Button>
          <Button
            variant="outline"
            disabled={dry}
            onClick={() => {
              setDry(true)
              void fraudApi
                .dryRun(rule.key)
                .then((r) => setCount(r.matching_accounts))
                .catch((e) => toast.error(e.message))
                .finally(() => setDry(false))
            }}
          >
            {t('Dry run (30 days)')}
          </Button>
        </div>
      )}
      {count !== null && (
        <p role="status">
          {count} {t('accounts would match. No flags or holds were written.')}
        </p>
      )}
      {confirm && (
        <ActionDialog
          title="Save fraud rule"
          requireNote={false}
          onClose={() => setConfirm(false)}
          run={() => fraudApi.update([rule])}
        />
      )}
    </section>
  )
}
export function UserFraud({ id }: { id: string }) {
  const t = useOpsText(),
    [offset, setOffset] = useState(0)
  const q = useQuery({
    queryKey: ['operations', 'user-fraud', id, offset],
    queryFn: () => fraudApi.user(id, offset),
  })
  return (
    <section className="space-y-3">
      <h2 className="font-semibold">{t('Fraud')}</h2>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          <FraudRows flags={q.data.flags} />
          <p>
            {t('Linked accounts')}:{' '}
            {q.data.linked_accounts.map((a) => a.name).join(', ') || '—'}
          </p>
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
    </section>
  )
}
export function FraudDashboardCount() {
  const t = useOpsText()
  const q = useQuery({
    queryKey: ['operations', 'fraud-stats'],
    queryFn: fraudApi.stats,
    refetchInterval: 30000,
  })
  return q.isPending ? (
    <Loading />
  ) : q.isError ? (
    <QueryError error={q.error} retry={() => void q.refetch()} />
  ) : (
    <Link
      to="/fraud?severity=high"
      className="block rounded-lg border border-amber-200 bg-amber-50 p-4"
    >
      {q.data.high_severity} {t('open high-severity fraud flags')}
    </Link>
  )
}

function FraudTrail({ id }: { id: string }) {
  const [offset, setOffset] = useState(0),
    t = useOpsText()
  const q = useQuery({
    queryKey: ['operations', 'fraud-trail', id, offset],
    queryFn: () => fraudApi.trail(id, offset),
  })
  return (
    <section className="space-y-3">
      <h2>
        {t('Ride location evidence')}: {id}
      </h2>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : q.data.points.length ? (
        <>
          <SafetyMap
            lat={q.data.points[0].lat}
            lng={q.data.points[0].lng}
            trail={[...q.data.points].reverse()}
            pickup={{ lat: q.data.ride.pickup_lat, lng: q.data.ride.pickup_lng }}
            dropoff={{ lat: q.data.ride.dropoff_lat, lng: q.data.ride.dropoff_lng }}
          />
          <Pagination
            total={q.data.total}
            offset={offset}
            limit={100}
            onChange={setOffset}
          />
        </>
      ) : (
        <Empty />
      )}
    </section>
  )
}
