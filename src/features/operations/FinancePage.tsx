import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/feedback/QueryError'
import { useOperationsPermission } from './api'
import { financeApi, newMoneyKey, type Ledger, type Settings } from './finance.api'
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
  money,
} from './shared'
import { dateInputISO } from '@/features/promotions/utils'
export function FinanceNav() {
  const { admin } = useOperationsPermission(),
    t = useOpsText()
  return (
    <nav className="flex flex-wrap gap-3" aria-label="Finance">
      {[
        ['/finance', 'Dashboard'],
        ['/payments', 'Payments'],
        ['/finance/refunds', 'Refunds'],
        ...(admin
          ? [
              ['/finance/payouts', 'Payouts'],
              ['/finance/wallets', 'Wallets'],
              ['/finance/settings', 'Settings'],
              ['/finance/reconciliation', 'Reconciliation'],
            ]
          : []),
      ].map(([to, title]) => (
        <Link className="text-sm text-brand-primary-teal underline" key={to} to={to}>
          {t(title)}
        </Link>
      ))}
    </nav>
  )
}
export function FinanceDashboard() {
  const access = useOperationsPermission(),
    t = useOpsText()
  const q = useQuery({
    queryKey: ['operations', 'finance-summary'],
    queryFn: financeApi.summary,
    enabled: access.admin,
  })
  if (!access.admin) return <PaymentsPage />
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Finance">
        <Button
          onClick={() =>
            void financeApi
              .csv()
              .then((blob) => {
                const url = URL.createObjectURL(blob),
                  a = document.createElement('a')
                a.href = url
                a.download = 'payments.csv'
                a.click()
                URL.revokeObjectURL(url)
              })
              .catch((e) => toast.error(e.message))
          }
        >
          {t('Export CSV')}
        </Button>
      </Heading>
      <FinanceNav />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['GMV', q.data.gmv],
              ['Commission', q.data.commission],
              ['Pending payouts', q.data.pending_payouts],
              ['Refunds', q.data.refunds],
            ].map(([label, value]) => (
              <div className="rounded-lg border bg-white p-4" key={label}>
                <dt className="text-sm text-muted-foreground">{t(String(label))}</dt>
                <dd className="mt-2 text-xl font-semibold">{money(Number(value))}</dd>
              </div>
            ))}
          </dl>
          <section
            className="h-80 rounded-lg border bg-white p-4"
            aria-label={t('Daily financial activity')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={q.data.daily}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="gmv" stroke="#149d94" />
                <Line dataKey="commission" stroke="#195b9c" />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </main>
  )
}
export function PaymentsPage() {
  const t = useOpsText(),
    [status, setStatus] = useState(''),
    [method, setMethod] = useState(''),
    [ref, setRef] = useState(''),
    [user, setUser] = useState(''),
    [ride, setRide] = useState(''),
    [min, setMin] = useState(''),
    [max, setMax] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [offset, setOffset] = useState(0)
  const params = {
    status,
    method,
    provider_ref: ref,
    user,
    ride,
    min_amount: min,
    max_amount: max,
    from: from ? new Date(from + 'T00:00:00+03:00').toISOString() : '',
    to: to ? new Date(to + 'T00:00:00+03:00').toISOString() : '',
    offset,
    limit: 20,
  }
  const q = useQuery({
    queryKey: ['operations', 'payments', params],
    queryFn: () => financeApi.payments(params),
  })
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Payments" />
      <FinanceNav />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v)
            setOffset(0)
          }}
          options={[
            '',
            'initiated',
            'pending',
            'succeeded',
            'failed',
            'expired',
            'refunded',
            'partially_refunded',
          ]}
        />
        <Select
          label="Method"
          value={method}
          onChange={(v) => {
            setMethod(v)
            setOffset(0)
          }}
          options={['', 'mpesa', 'tigopesa', 'airtelmoney', 'cash', 'wallet']}
        />
        <label className="grid gap-1 text-sm">
          {t('Provider reference')}
          <Input
            value={ref}
            onChange={(e) => {
              setRef(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('Passenger or driver UUID')}
          <Input
            value={user}
            onChange={(e) => {
              setUser(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('Ride UUID')}
          <Input
            value={ride}
            onChange={(e) => {
              setRide(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('Minimum amount (TZS)')}
          <Input
            inputMode="numeric"
            value={min}
            onChange={(e) => {
              setMin(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('Maximum amount (TZS)')}
          <Input
            inputMode="numeric"
            value={max}
            onChange={(e) => {
              setMax(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('From (Dar es Salaam)')}
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setOffset(0)
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('To (Dar es Salaam)')}
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
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
          {q.data.payments.length ? (
            <ResponsiveTable
              label={t('Payments')}
              columns={['Payment', 'Amount', 'Method', 'Status', 'Date'].map(t)}
              rows={q.data.payments.map((p) => ({
                id: p.id,
                cells: [
                  <Link
                    to={`/payments/${p.id}`}
                    className="text-brand-primary-teal underline"
                  >
                    {p.id.slice(0, 8)}
                  </Link>,
                  money(p.amount),
                  p.method,
                  <StatusBadge status={p.status} />,
                  <DateLabel value={p.created_at} />,
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
export function LedgerTable({ rows }: { rows: Ledger[] }) {
  const t = useOpsText()
  return rows.length ? (
    <ResponsiveTable
      label={t('Ledger')}
      columns={['Account', 'Direction', 'Amount', 'Balance after', 'Date'].map(t)}
      rows={rows.map((e) => ({
        id: e.id,
        cells: [
          e.account,
          e.direction,
          money(e.amount),
          money(e.balance_after),
          <DateLabel value={e.created_at} />,
        ],
      }))}
    />
  ) : (
    <Empty />
  )
}
export function PaymentDetailPage() {
  const { id = '' } = useParams(),
    t = useOpsText(),
    access = useOperationsPermission(),
    [offset, setOffset] = useState(0),
    [refund, setRefund] = useState(false),
    [amount, setAmount] = useState(''),
    [key, setKey] = useState('')
  const q = useQuery({
    queryKey: ['operations', 'payment', id, offset],
    queryFn: () => financeApi.payment(id, offset),
  })
  if (q.isPending) return <Loading />
  if (q.isError) return <QueryError error={q.error} retry={() => void q.refetch()} />
  const d = q.data,
    p = d.payment
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Payment details">
        <StatusBadge status={p.status} />
      </Heading>
      <FinanceNav />
      <section className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <p>
          {t('Amount')}: {money(p.amount)}
        </p>
        <p>
          {t('Fare')}: {money(p.fare)}
        </p>
        <p>
          {t('Discount')}: {money(p.discount_amount)}
        </p>
        <p>
          {t('Commission')}: {money(p.commission)}
        </p>
        <p>
          {p.method} · {p.masked_phone}
        </p>
        <p>{p.failure_code}</p>
        <p>
          {p.provider_ref}
          <Button
            variant="ghost"
            onClick={() =>
              void navigator.clipboard
                .writeText(p.provider_ref)
                .then(() => toast.success(t('Copied')))
                .catch(() => toast.error(t('Unable to copy')))
            }
          >
            {t('Copy')}
          </Button>
        </p>
        <DateLabel value={p.created_at} />
        <DateLabel value={p.updated_at} />
      </section>
      <h2 className="font-semibold">{t('Ledger')}</h2>
      <LedgerTable rows={d.ledger} />
      <Pagination total={d.ledger_total} offset={offset} onChange={setOffset} />
      <h2 className="font-semibold">{t('Webhook events')}</h2>
      {d.webhooks.length ? (
        d.webhooks.map((e) => (
          <article key={e.id} className="rounded border p-3">
            <p>{e.event_id}</p>
            <DateLabel value={e.processed_at} />
          </article>
        ))
      ) : (
        <Empty />
      )}
      {access.write && ['succeeded', 'partially_refunded'].includes(p.status) && (
        <Button
          onClick={() => {
            setRefund(true)
            setKey(newMoneyKey())
            setAmount(String(p.amount - p.refunded_amount))
          }}
        >
          {t('Request refund')}
        </Button>
      )}
      {refund && (
        <ActionDialog
          title="Request refund"
          onClose={() => setRefund(false)}
          validate={() =>
            !Number.isSafeInteger(Number(amount)) ||
            Number(amount) <= 0 ||
            Number(amount) > p.amount - p.refunded_amount
              ? t('Enter an amount within the remaining paid balance.')
              : null
          }
          run={(note) => financeApi.refund(id, Number(amount), note, key)}
        >
          <label>
            {t('Amount (TZS)')}
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <p>{t('Refunds are credited to the passenger wallet after approval.')}</p>
        </ActionDialog>
      )}
    </main>
  )
}
export function RefundsPage() {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [offset, setOffset] = useState(0),
    [action, setAction] = useState<{ id: string; type: string; key: string } | null>(null)
  const q = useQuery({
    queryKey: ['operations', 'refunds', offset],
    queryFn: () => financeApi.refunds(offset),
  })
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Refunds" />
      <FinanceNav />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          <p>
            {t('Support approval limit')}: {money(q.data.support_limit)}
          </p>
          {q.data.refunds.length ? (
            <ResponsiveTable
              label={t('Refunds')}
              columns={['Payment', 'Amount', 'Reason', 'Status', 'Actions'].map(t)}
              rows={q.data.refunds.map((r) => ({
                id: r.id,
                cells: [
                  <Link to={`/payments/${r.transaction_id}`}>
                    {r.transaction_id.slice(0, 8)}
                  </Link>,
                  money(r.amount),
                  r.reason,
                  <StatusBadge status={r.status} />,
                  r.status === 'requested' &&
                  access.write &&
                  (access.admin || r.amount <= q.data.support_limit) ? (
                    <div className="flex gap-2">
                      {['approve', 'reject'].map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          onClick={() =>
                            setAction({ id: r.id, type, key: newMoneyKey() })
                          }
                        >
                          {t(type)}
                        </Button>
                      ))}
                    </div>
                  ) : null,
                ],
              }))}
            />
          ) : (
            <Empty />
          )}
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
        </>
      )}
      {action && (
        <ActionDialog
          title={`${action.type} refund`}
          requireNote={action.type === 'reject'}
          onClose={() => setAction(null)}
          run={(note) =>
            financeApi.refundAction(action.id, action.type, note, action.key)
          }
        />
      )}
    </main>
  )
}
export function PayoutsPage() {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [status, setStatus] = useState('requested'),
    [offset, setOffset] = useState(0),
    [selected, setSelected] = useState<string[]>([]),
    [action, setAction] = useState<{ id: string; type: string; key: string } | null>(null)
  const q = useQuery({
    queryKey: ['operations', 'payouts', status, offset],
    queryFn: () => financeApi.payouts(status, offset),
    enabled: access.admin,
  })
  if (!access.admin) return <p>{t('Admin permission required')}</p>
  const total = (q.data?.payouts || [])
    .filter((p) => selected.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0)
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Payouts" />
      <FinanceNav />
      <Select
        label="Status"
        value={status}
        onChange={(v) => {
          setStatus(v)
          setOffset(0)
          setSelected([])
        }}
        options={[
          'requested',
          'approved',
          'processing',
          'paid',
          'failed',
          'rejected',
          'cancelled',
        ]}
      />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          {q.data.payouts.length ? (
            <ResponsiveTable
              label={t('Payouts')}
              columns={[
                'Select',
                'Driver',
                'Amount',
                'Destination',
                'Approval',
                'Wallet balance',
                'Status',
                'Actions',
              ].map(t)}
              rows={q.data.payouts.map((p) => ({
                id: p.id,
                cells: [
                  <input
                    type="checkbox"
                    aria-label={`${t('Select')} ${p.id}`}
                    disabled={
                      p.status !== 'requested' ||
                      !p.verified ||
                      p.fraud_hold ||
                      !access.write
                    }
                    checked={selected.includes(p.id)}
                    onChange={(e) =>
                      setSelected((v) =>
                        e.target.checked ? [...v, p.id] : v.filter((id) => id !== p.id)
                      )
                    }
                  />,
                  <Link to={`/drivers/${p.driver_id}`}>
                    {p.driver_name || p.driver_id.slice(0, 8)}
                  </Link>,
                  money(p.amount),
                  p.masked_destination,
                  <span>
                    {t(p.verified ? 'Verified' : 'Unverified')}
                    {p.fraud_hold && (
                      <strong className="block text-red-700">
                        {t('Fraud payout hold')}
                      </strong>
                    )}
                  </span>,
                  money(p.wallet_balance),
                  <StatusBadge status={p.status} />,
                  access.write && p.status === 'requested' ? (
                    <div className="flex gap-2">
                      {['approve', 'reject'].map((type) => (
                        <Button
                          key={type}
                          disabled={type === 'approve' && (!p.verified || p.fraud_hold)}
                          onClick={() =>
                            setAction({ id: p.id, type, key: newMoneyKey() })
                          }
                        >
                          {t(type)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    p.reject_reason
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
      {access.write && selected.length > 0 && (
        <Button
          onClick={() => setAction({ id: 'batch', type: 'batch', key: newMoneyKey() })}
        >
          {t('Approve selected')} ({selected.length}) · {money(total)}
        </Button>
      )}
      {action && (
        <ActionDialog
          title={
            action.type === 'batch'
              ? `Approve ${selected.length} payouts · ${money(total)}`
              : `${action.type} payout`
          }
          requireNote={action.type === 'reject'}
          onClose={() => setAction(null)}
          run={(note) =>
            action.type === 'batch'
              ? financeApi.batchApprove(selected, action.key)
              : financeApi.payoutAction(action.id, action.type, note, action.key)
          }
        />
      )}
    </main>
  )
}
export function WalletsPage() {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [search, setSearch] = useState(''),
    [id, setId] = useState(''),
    [offset, setOffset] = useState(0),
    [adjust, setAdjust] = useState(false),
    [amount, setAmount] = useState(''),
    [typed, setTyped] = useState(''),
    [key, setKey] = useState('')
  const lookup = useQuery({
    queryKey: ['operations', 'driver-search', search],
    queryFn: () => financeApi.drivers(search),
    enabled: access.admin && search.trim().length >= 2,
  })
  const q = useQuery({
    queryKey: ['operations', 'wallet', id, offset],
    queryFn: () => financeApi.wallet(id, offset),
    enabled: !!id && access.admin,
  })
  if (!access.admin) return <p>{t('Admin permission required')}</p>
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Driver wallets" />
      <FinanceNav />
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setId(search.trim())
          setOffset(0)
        }}
      >
        <Input
          aria-label={t('User UUID')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Name, phone, email or UUID')}
        />
        <Button>{t('Search')}</Button>
      </form>
      {lookup.isFetching && <Loading />}
      {lookup.isError && (
        <QueryError error={lookup.error} retry={() => void lookup.refetch()} />
      )}
      <div className="flex flex-wrap gap-2">
        {lookup.data?.users.map((u) => (
          <Button
            key={u.id}
            variant="outline"
            onClick={() => {
              setId(u.id)
              setOffset(0)
            }}
          >
            {u.name}
          </Button>
        ))}
      </div>
      {!id ? (
        <Empty message={t('Search for a user wallet')} />
      ) : q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      ) : (
        <>
          <p className="text-xl font-semibold">
            {t('Balance')}: {money(q.data.wallet.balance)} · {t('Held')}:{' '}
            {money(q.data.wallet.held)}
          </p>
          <LedgerTable rows={q.data.ledger} />
          <Pagination total={q.data.total} offset={offset} onChange={setOffset} />
          {access.write && (
            <Button
              onClick={() => {
                setAdjust(true)
                setTyped('')
                setKey(newMoneyKey())
              }}
            >
              {t('Adjust balance')}
            </Button>
          )}
        </>
      )}
      {adjust && (
        <ActionDialog
          title="Adjust balance"
          onClose={() => setAdjust(false)}
          validate={() =>
            !Number.isSafeInteger(Number(amount)) ||
            Number(amount) === 0 ||
            typed !== amount
              ? t('Type the exact nonzero amount to confirm.')
              : null
          }
          run={(note) => financeApi.adjust(id, Number(amount), note, key)}
        >
          <label>
            {t('Adjustment (TZS)')}
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
            />
          </label>
          <label>
            {t('Type amount to confirm')}
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} />
          </label>
        </ActionDialog>
      )}
    </main>
  )
}
export function PaymentSettingsPage() {
  const access = useOperationsPermission(),
    [offset, setOffset] = useState(0)
  const q = useQuery({
    queryKey: ['operations', 'payment-settings', offset],
    queryFn: () => financeApi.settings(offset),
    enabled: access.admin,
  })
  if (!access.admin) return <p>Admin permission required</p>
  if (q.isPending) return <Loading />
  if (q.isError) return <QueryError error={q.error} retry={() => void q.refetch()} />
  return (
    <SettingsForm
      key={q.data.settings.id || 'default'}
      initial={q.data.settings}
      rules={q.data.commission_rules}
      history={q.data.history}
      total={Math.max(q.data.total, q.data.history_total)}
      offset={offset}
      onPage={setOffset}
    />
  )
}
function SettingsForm({
  initial,
  rules,
  history,
  total,
  offset,
  onPage,
}: {
  initial: Settings
  rules: Awaited<ReturnType<typeof financeApi.settings>>['commission_rules']
  history: Settings[]
  total: number
  offset: number
  onPage: (v: number) => void
}) {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [values, setValues] = useState(initial),
    [scope, setScope] = useState('default'),
    [vehicle, setVehicle] = useState(''),
    [percent, setPercent] = useState('15'),
    [fee, setFee] = useState('0'),
    [date, setDate] = useState(''),
    [confirm, setConfirm] = useState(false)
  const fields = [
    'driver_max_negative_balance',
    'payout_min',
    'payout_auto_approve_max',
    'refund_support_limit',
  ] as const
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Payment settings" />
      <FinanceNav />
      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field}>
            {t(field.replaceAll('_', ' '))}
            <Input
              type="number"
              min="1"
              step="1"
              disabled={!access.write}
              value={values[field]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field]: Number(e.target.value) }))
              }
            />
          </label>
        ))}
      </div>
      <h2>{t('New commission rule')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Scope"
          value={scope}
          onChange={setScope}
          options={['default', 'vehicle_type']}
        />
        {scope === 'vehicle_type' && (
          <label>
            {t('Vehicle type')}
            <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
          </label>
        )}
        <label>
          {t('Percent')}
          <Input
            type="number"
            min="0"
            max="100"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
          />
        </label>
        <label>
          {t('Minimum fee (TZS)')}
          <Input
            type="number"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </label>
        <label>
          {t('Effective from (Tanzania)')}
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      {access.write && (
        <Button
          disabled={
            fields.some((f) => !Number.isSafeInteger(values[f]) || values[f] <= 0) ||
            !Number.isInteger(Number(percent)) ||
            Number(percent) < 0 ||
            Number(percent) > 100 ||
            !Number.isSafeInteger(Number(fee)) ||
            Number(fee) < 0 ||
            (scope === 'vehicle_type' && !vehicle.trim())
          }
          onClick={() => setConfirm(true)}
        >
          {t('Save settings')}
        </Button>
      )}
      <h2>{t('Commission history')}</h2>
      {rules.length ? (
        <ResponsiveTable
          label="Commission history"
          columns={['Scope', 'Percent', 'Min fee', 'Effective from'].map(t)}
          rows={rules.map((r, i) => ({
            id: r.id || String(i),
            cells: [
              r.scope + ' ' + r.vehicle_type,
              `${r.percent}%`,
              money(r.min_fee),
              <DateLabel value={r.effective_from} />,
            ],
          }))}
        />
      ) : (
        <Empty />
      )}
      <h2>{t('Settings history')}</h2>
      {history.map((h, i) => (
        <p key={h.id || i}>
          {money(h.payout_min)} · {h.created_at && <DateLabel value={h.created_at} />}
        </p>
      ))}
      <Pagination total={total} offset={offset} onChange={onPage} />
      {confirm && (
        <ActionDialog
          title="Save payment settings"
          requireNote={false}
          onClose={() => setConfirm(false)}
          run={() =>
            financeApi.updateSettings(values, [
              {
                scope,
                vehicle_type: vehicle,
                percent: Number(percent),
                min_fee: Number(fee),
                effective_from: date ? dateInputISO(date) : new Date().toISOString(),
              },
            ])
          }
        />
      )}
    </main>
  )
}
export function ReconciliationPage() {
  const t = useOpsText(),
    access = useOperationsPermission(),
    [offset, setOffset] = useState(0),
    [action, setAction] = useState<{ id: string; key: string } | null>(null)
  const runs = useQuery({
      queryKey: ['operations', 'runs', offset],
      queryFn: () => financeApi.runs(offset),
      enabled: access.admin,
    }),
    exceptions = useQuery({
      queryKey: ['operations', 'exceptions', offset],
      queryFn: () => financeApi.exceptions(offset),
      enabled: access.admin,
    })
  if (!access.admin) return <p>{t('Admin permission required')}</p>
  return (
    <main className="space-y-5 p-4 sm:p-8">
      <Heading title="Reconciliation">
        {access.write && (
          <Button onClick={() => setAction({ id: 'run', key: newMoneyKey() })}>
            {t('Run now')}
          </Button>
        )}
      </Heading>
      <FinanceNav />
      {runs.isPending ? (
        <Loading />
      ) : runs.isError ? (
        <QueryError error={runs.error} retry={() => void runs.refetch()} />
      ) : runs.data.runs.length ? (
        <ResponsiveTable
          label="Reconciliation runs"
          columns={['Run', 'Status', 'Exceptions', 'Date'].map(t)}
          rows={runs.data.runs.map((r) => ({
            id: r.id,
            cells: [
              r.id,
              <StatusBadge status={r.status} />,
              r.exceptions,
              <DateLabel value={r.created_at} />,
            ],
          }))}
        />
      ) : (
        <Empty />
      )}
      {exceptions.isPending ? (
        <Loading />
      ) : exceptions.isError ? (
        <QueryError error={exceptions.error} retry={() => void exceptions.refetch()} />
      ) : (
        <>
          {exceptions.data.exceptions.length ? (
            <ResponsiveTable
              label="Exceptions"
              columns={['Type', 'Reference', 'Status', 'Action'].map(t)}
              rows={exceptions.data.exceptions.map((e) => ({
                id: e.id,
                cells: [
                  t(e.type),
                  e.transaction_id,
                  e.status,
                  e.status === 'open' && access.write ? (
                    <Button onClick={() => setAction({ id: e.id, key: '' })}>
                      {t('Resolve')}
                    </Button>
                  ) : (
                    e.note
                  ),
                ],
              }))}
            />
          ) : (
            <Empty />
          )}
          <Pagination
            total={Math.max(exceptions.data.total, runs.data?.total || 0)}
            offset={offset}
            onChange={setOffset}
          />
        </>
      )}
      {action && (
        <ActionDialog
          title={action.id === 'run' ? 'Run reconciliation' : 'Resolve exception'}
          requireNote={action.id !== 'run'}
          onClose={() => setAction(null)}
          run={(note) =>
            action.id === 'run'
              ? financeApi.run(action.key)
              : financeApi.resolve(action.id, note)
          }
        />
      )}
    </main>
  )
}
