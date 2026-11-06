import { useEffect, useState, type FormEvent } from 'react'
import { apiClient } from '@/lib/api/client'
import { request } from '@/features/operations/api'
import { useAuthStore } from '@/stores/useAuthStore'

type Settings = {
  version: number
  enabled: boolean
  shared_fee: number
  hail_percent: number
}
type Assessment = {
  mode: string
  trip_id: string
  gross: number
  fee: number
  net: number
  status: string
}
type Trip = {
  id: string
  pickup: { address: string }
  dropoff: { address: string }
  status: string
  seats: number
  held: number
  confirmed: number
  price: number
  fee: number
  receipt?: Assessment
  version: number
}
const errorText = (err: unknown) =>
  err instanceof Error ? err.message : 'Could not reach Rida.'

export function Fees({
  settings,
  onSave,
  admin,
}: {
  settings: Settings
  onSave: (s: Settings) => void
  admin: boolean
}) {
  const [enabled, setEnabled] = useState(settings.enabled)
  const [fee, setFee] = useState(settings.version ? String(settings.shared_fee) : '')
  const [percent, setPercent] = useState(
    settings.version ? String(settings.hail_percent) : ''
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')
  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const updated = await request(
        apiClient.put<Settings>('/admin/transport/settings', {
          version: settings.version,
          enabled,
          shared_fee: Number(fee),
          hail_percent: Number(percent),
          reason: reason.trim(),
        })
      )
      onSave(updated)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border p-5">
      <h2 className="text-xl font-semibold">Trip fees</h2>
      <fieldset disabled={!admin || busy} className="grid gap-4 sm:grid-cols-2">
        <label>
          Shared fee per completed trip (TZS)
          <input
            className="block w-full rounded border p-2"
            type="number"
            min="500"
            max="1000"
            required
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </label>
        <label>
          Ride-hailing commission (%)
          <input
            className="block w-full rounded border p-2"
            type="number"
            min="0"
            max="100"
            required
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
          />
        </label>
        <label>
          Reason for changing trip settings
          <input
            className="block w-full rounded border p-2"
            maxLength={250}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />{' '}
          Allow new shared bookings
        </label>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {admin && (
        <button
          disabled={busy}
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          {busy ? 'Saving…' : 'Save trip settings'}
        </button>
      )}
    </form>
  )
}

export default function TransportPage() {
  const admin = useAuthStore((s) => s.user?.role === 'admin')
  const [settings, setSettings] = useState<Settings>()
  const [trips, setTrips] = useState<Trip[]>([])
  const [offset, setOffset] = useState(0)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [assessmentOffset, setAssessmentOffset] = useState(0)
  const [assessmentTotal, setAssessmentTotal] = useState(0)
  const [pendingOnly, setPendingOnly] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout>
    async function refresh() {
      try {
        const [s, page, ledger] = await Promise.all([
          request(apiClient.get<Settings>('/admin/transport/settings')),
          request(
            apiClient.get<{ trips: Trip[] }>('/admin/shared-trips', {
              params: { limit: 25, offset },
            })
          ),
          request(
            apiClient.get<{ assessments: Assessment[]; total: number }>(
              '/admin/transport/assessments',
              {
                params: {
                  limit: 25,
                  offset: assessmentOffset,
                  status: pendingOnly ? 'receivable' : undefined,
                },
              }
            )
          ),
        ])
        if (active) {
          setSettings((current) => current ?? s)
          setTrips(page.trips)
          setAssessments(ledger.assessments)
          setAssessmentTotal(ledger.total)
          setError('')
        }
      } catch (err) {
        if (active) setError(errorText(err))
      } finally {
        if (active) timer = setTimeout(refresh, 5000)
      }
    }
    void refresh()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [offset, assessmentOffset, pendingOnly])
  const [cancelId, setCancelId] = useState('')
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  async function cancelTrip() {
    if (!cancelId || !reason.trim()) return
    setCancelling(true)
    try {
      await request(
        apiClient.post('/admin/shared-trips/' + cancelId + '/cancel', {
          reason: reason.trim(),
        })
      )
      setTrips((current) =>
        current.map((t) =>
          t.id === cancelId ? { ...t, status: 'cancelled', confirmed: 0, held: 0 } : t
        )
      )
      setCancelId('')
      setReason('')
      setNotice('Shared trip cancelled. Passenger seats have been released.')
    } catch (err) {
      setError(errorText(err))
    } finally {
      setCancelling(false)
    }
  }
  return (
    <main className="space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Shared rides and trip fees</h1>
      {error && <p role="alert">{error}</p>}
      <p role="status">{notice}</p>
      {settings && (
        <Fees
          key={settings.version}
          admin={admin}
          settings={settings}
          onSave={(s) => {
            setSettings(s)
            setNotice('Trip settings saved.')
          }}
        />
      )}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Transport fee assessments</h2>
        <label>
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => {
              setPendingOnly(e.target.checked)
              setAssessmentOffset(0)
            }}
          />{' '}
          Pending collection only
        </label>
        {assessments.map((a) => (
          <article className="rounded-xl border p-4" key={a.mode + '/' + a.trip_id}>
            <p>
              {a.mode === 'shared' ? 'Shared ride' : 'Ride hailing'} · {a.trip_id}
            </p>
            <p>
              Gross TZS {a.gross.toLocaleString()} · Fee TZS {a.fee.toLocaleString()} ·
              Driver net TZS {a.net.toLocaleString()}
            </p>
            <p>
              {a.status === 'wallet_debited'
                ? 'Fee posted to driver wallet; cash fares paid directly to driver'
                : 'Fee receivable — wallet collection pending'}
            </p>
          </article>
        ))}
        {!assessments.length && <p>No assessments on this page.</p>}
        <div className="flex gap-4">
          <button
            disabled={!assessmentOffset}
            onClick={() => setAssessmentOffset((v) => Math.max(0, v - 25))}
          >
            Previous assessments
          </button>
          <button
            disabled={assessmentOffset + 25 >= assessmentTotal}
            onClick={() => setAssessmentOffset((v) => v + 25)}
          >
            Next assessments
          </button>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Shared trips</h2>
        {!settings && !error && <p>Loading trips…</p>}
        {settings && !trips.length && <p>No trips on this page.</p>}
        {trips.map((t) => (
          <article key={t.id} className="rounded-xl border p-4">
            <h3 className="font-semibold">
              {t.pickup.address} → {t.dropoff.address}
            </h3>
            <p>
              {t.status} · {t.held} held · {t.confirmed} verified · {t.seats} seats
              offered
            </p>
            <p>
              TZS {t.price.toLocaleString()} per seat · Whole-trip fee TZS{' '}
              {t.fee.toLocaleString()}
              {t.status === 'completed' &&
                (t.receipt?.status === 'wallet_debited'
                  ? ' posted to driver wallet'
                  : t.receipt?.status === 'receivable'
                    ? ' receivable — collection pending'
                    : ' settlement unavailable')}
            </p>
            {admin &&
              t.status === 'waiting' &&
              (cancelId === t.id ? (
                <div className="mt-3 space-y-2">
                  <label>
                    Reason for cancellation
                    <input
                      className="block w-full rounded border p-2"
                      maxLength={250}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                  <button
                    disabled={cancelling || !reason.trim()}
                    onClick={() => void cancelTrip()}
                  >
                    Confirm cancellation
                  </button>
                  <button
                    className="ml-4"
                    disabled={cancelling}
                    onClick={() => setCancelId('')}
                  >
                    Keep trip
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCancelId(t.id)
                    setReason('')
                  }}
                >
                  Cancel trip
                </button>
              ))}
          </article>
        ))}
        <div className="flex gap-4">
          <button
            disabled={!offset}
            onClick={() => setOffset((v) => Math.max(0, v - 25))}
          >
            Previous
          </button>
          <button disabled={trips.length < 25} onClick={() => setOffset((v) => v + 25)}>
            Next
          </button>
        </div>
      </section>
    </main>
  )
}
