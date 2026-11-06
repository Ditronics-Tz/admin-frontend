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
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout>
    async function refresh() {
      try {
        const [s, page] = await Promise.all([
          request(apiClient.get<Settings>('/admin/transport/settings')),
          request(
            apiClient.get<{ trips: Trip[] }>('/admin/shared-trips', {
              params: { limit: 25, offset },
            })
          ),
        ])
        if (active) {
          setSettings((current) => current ?? s)
          setTrips(page.trips)
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
  }, [offset])
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
              {t.status === 'completed' && ' collected'}
            </p>
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
