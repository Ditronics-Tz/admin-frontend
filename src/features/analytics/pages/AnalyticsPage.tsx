import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { Users, CarFront, CircleCheck, UserRound } from 'lucide-react'
import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { dashboardService } from '@/features/dashboard/services/dashboard.service'
import { QueryError } from '@/components/feedback/QueryError'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'
import { Button } from '@/components/ui/button'

const ranges = [7, 30, 90] as const

function utcDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

export const AnalyticsPage = () => {
  const t = useShipText()
  const [days, setDays] = useState<number>(30)
  const period = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setUTCDate(start.getUTCDate() - days + 1)
    return { from: utcDay(start), to: utcDay(end) }
  }, [days])
  const query = useQuery({
    queryKey: ['admin', 'analytics', period],
    queryFn: () => dashboardService.getAnalytics(period.from, period.to),
    staleTime: 60_000,
  })
  const data = query.data

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            {t('Growth and operations')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            {t('Track account registrations and ride activity from persisted backend records.')}
          </p>
        </div>
        <div className="flex gap-2" aria-label={t('Analytics period')}>
          {ranges.map((range) => (
            <Button
              key={range}
              size="sm"
              variant={days === range ? 'default' : 'outline'}
              aria-pressed={days === range}
              onClick={() => setDays(range)}
            >
              {range} {t('days')}
            </Button>
          ))}
        </div>
      </header>

      <p className="text-xs text-muted-foreground">
        {t('UTC date range')}: {period.from} — {period.to}
      </p>
      {query.isError && <QueryError error={query.error} retry={() => void query.refetch()} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t('New passengers')} value={data?.totals.passengers.toLocaleString() ?? '—'} icon={UserRound} subtext={t('in selected period')} />
        <MetricCard label={t('New drivers')} value={data?.totals.drivers.toLocaleString() ?? '—'} icon={Users} subtext={t('in selected period')} />
        <MetricCard label={t('Ride requests')} value={data?.totals.ride_requests.toLocaleString() ?? '—'} icon={CarFront} subtext={t('created in selected period')} />
        <MetricCard label={t('Completed rides')} value={data?.totals.completed_rides.toLocaleString() ?? '—'} icon={CircleCheck} subtext={t('completed in selected period')} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <h2 className="font-semibold text-[#172B36]">{t('Account registrations')}</h2>
            <p className="text-xs text-muted-foreground">{t('Daily passenger and driver accounts created')}</p>
          </div>
          {query.isPending ? (
            <div className="h-[280px] animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="h-[280px] w-full" role="img" aria-label={t('Daily registrations chart')}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.registrations ?? []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e8eef0" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(value: string) => formatDateTime(`${value}T00:00:00Z`, 'dd MMM')} tick={{ fontSize: 11 }} minTickGap={24} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(value) => formatDateTime(`${value}T00:00:00Z`, 'dd MMM yyyy')} />
                  <Legend />
                  <Area type="monotone" dataKey="passengers" name={t('Passengers')} stroke="#087f75" fill="#cdece4" strokeWidth={2} />
                  <Area type="monotone" dataKey="drivers" name={t('Drivers')} stroke="#d28a28" fill="#f7e8c9" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <h2 className="font-semibold text-[#172B36]">{t('Ride activity')}</h2>
            <p className="text-xs text-muted-foreground">{t('Requests by creation date and completions by completion date')}</p>
          </div>
          {query.isPending ? (
            <div className="h-[280px] animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="h-[280px] w-full" role="img" aria-label={t('Daily ride activity chart')}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.rides ?? []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e8eef0" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(value: string) => formatDateTime(`${value}T00:00:00Z`, 'dd MMM')} tick={{ fontSize: 11 }} minTickGap={24} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(value) => formatDateTime(`${value}T00:00:00Z`, 'dd MMM yyyy')} />
                  <Legend />
                  <Line type="monotone" dataKey="requested" name={t('Ride requests')} stroke="#087f75" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="completed" name={t('Completed rides')} stroke="#4f7891" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
        {t('Registration counts use account creation time. Ride requests use ride creation time; completed rides use completion time. These figures are not revenue or payment settlement reports.')}
      </p>
    </div>
  )
}

export default AnalyticsPage
