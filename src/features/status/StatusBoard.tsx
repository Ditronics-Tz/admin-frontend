import { useShipText } from '@/components/common/ship-text'
import type {
  StatusComponent,
  StatusDay,
  StatusLatency,
  StatusReport,
  StatusState,
} from './types'

const barColor: Record<StatusState, string> = {
  operational: 'bg-[#3dba5d]',
  degraded: 'bg-[#f0b429]',
  outage: 'bg-[#e5534b]',
  maintenance: 'bg-[#9aa0a6]',
  none: 'bg-[#e4e1da]',
}

const labelColor: Record<string, string> = {
  operational: 'text-[#2f9e44]',
  degraded: 'text-[#b58105]',
  outage: 'text-[#d23b34]',
  maintenance: 'text-[#6f6a62]',
  none: 'text-[#6f6a62]',
}

function stateLabel(state: string, t: (text: string) => string) {
  switch (state) {
    case 'degraded':
      return t('Degraded')
    case 'outage':
      return t('Outage')
    case 'maintenance':
      return t('Maintenance')
    case 'none':
      return t('No data')
    default:
      return t('Operational')
  }
}

function uptimeText(value: number | null, state: string, t: (text: string) => string) {
  if (value == null) {
    return state === 'maintenance'
      ? t('Not counted while jobs are off')
      : t('Collecting uptime')
  }
  return `${value.toFixed(2)}% ${t('uptime')}`
}

function historyCounts(days: StatusDay[], t: (text: string) => string) {
  const counts = { operational: 0, degraded: 0, outage: 0, maintenance: 0 }
  for (const day of days) {
    if (day.state in counts) counts[day.state as keyof typeof counts] += 1
  }
  const parts = []
  if (counts.outage) parts.push(`${counts.outage} ${t('days with an outage')}`)
  if (counts.degraded) parts.push(`${counts.degraded} ${t('degraded days')}`)
  if (counts.maintenance) parts.push(`${counts.maintenance} ${t('maintenance days')}`)
  if (parts.length === 0) {
    return counts.operational
      ? `${counts.operational} ${t('operational days in this window.')}`
      : t('History fills in while this process is running.')
  }
  return parts.join(' · ')
}

function eatClock(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Dar_es_Salaam',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

function processUptime(seconds: number) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function Sparkline({ points }: { points: StatusLatency[] }) {
  if (points.length < 2) return null
  const max = Math.max(1, ...points.map((point) => point.ms))
  const coords = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 148
      const y = 28 - (point.ms / max) * 26 - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox="0 0 148 28" className="h-7 w-36" aria-hidden="true">
      <polyline fill="none" stroke="#1C7C70" strokeWidth="1.5" points={coords} />
    </svg>
  )
}

function ComponentRow({ component }: { component: StatusComponent }) {
  const t = useShipText()
  const showSpark = component.latency_label !== '' && component.latency.length >= 2
  return (
    <article className="border-t border-[#e6e2da] py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#1c1b19]">{component.name}</h3>
          <p className="mt-0.5 text-sm text-[#6f6a62]">{component.summary}</p>
        </div>
        <p
          className={`text-sm font-semibold ${labelColor[component.state] ?? labelColor.none}`}
        >
          {stateLabel(component.state, t)}
        </p>
      </div>
      <div
        className="mt-3 flex h-[34px] gap-[3px]"
        role="img"
        aria-label={`${component.name} ${t('uptime')}`}
      >
        {component.days.map((day) => (
          <span
            key={day.date}
            title={`${day.date} ${day.state}`}
            className={`min-w-0 flex-1 rounded-[2px] ${barColor[day.state]}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2.5 text-xs text-[#8a8478]">
        <span>{t('90 days ago')}</span>
        <i className="h-px flex-1 bg-[#ddd9d0]" />
        <b className="font-semibold text-[#5f5a53]">
          {uptimeText(component.uptime_percent, component.state, t)}
        </b>
        <i className="h-px flex-1 bg-[#ddd9d0]" />
        <span>{t('Today')}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8a8478]">
        <p>{historyCounts(component.days, t)}</p>
        {showSpark && (
          <div className="flex items-center gap-2">
            <span>
              {t(component.latency_label)}
              {component.latency_ms > 0 ? ` · ${component.latency_ms} ms` : ''}
            </span>
            <Sparkline points={component.latency} />
          </div>
        )}
      </div>
    </article>
  )
}

export function StatusBoard({ report }: { report: StatusReport }) {
  const t = useShipText()
  const rows = report.components.map((component, index) => ({
    component,
    showGroup: index === 0 || report.components[index - 1]?.group !== component.group,
  }))
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#1c1b19]">
          Rida status
        </h2>
        <p className="text-sm text-[#8a8478]">{t('Uptime over the past 90 days')}</p>
      </div>
      <p className="mb-3 mt-4 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-[#1c1b19] sm:text-[28px]">
        <i
          className={`h-3 w-3 rounded-full ${
            report.overall === 'outage'
              ? 'bg-[#e5534b]'
              : report.overall === 'degraded'
                ? 'bg-[#f0b429]'
                : 'bg-[#3dba5d]'
          }`}
        />
        {t(report.summary)}
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6f6a62]">
        {(
          [
            ['operational', 'Operational'],
            ['degraded', 'Degraded'],
            ['outage', 'Outage'],
            ['maintenance', 'Maintenance'],
            ['none', 'No data'],
          ] as const
        ).map(([state, label]) => (
          <li key={state} className="flex items-center gap-1.5">
            <i className={`h-2.5 w-2.5 rounded-[2px] ${barColor[state]}`} />
            {t(label)}
          </li>
        ))}
      </ul>
      {rows.map(({ component, showGroup }) => (
        <div key={component.id}>
          {showGroup && (
            <h3 className="mb-1 mt-7 text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8478]">
              {t(component.group)}
            </h3>
          )}
          <ComponentRow component={component} />
        </div>
      ))}
      <h3 className="mb-2 mt-7 text-xs font-semibold uppercase tracking-[0.08em] text-[#8a8478]">
        {t('Recent checks')}
      </h3>
      {report.logs.length === 0 ? (
        <p className="text-sm text-[#6f6a62]">
          {t('Checks appear here as the monitor samples each component.')}
        </p>
      ) : (
        <ol className="max-h-80 overflow-auto rounded-xl border border-[#e6e2da] bg-white">
          {report.logs.map((log, index) => (
            <li
              key={`${log.at}-${log.component_id}-${index}`}
              className="grid gap-1 border-t border-[#f0ece6] px-3 py-2 font-mono text-xs first:border-t-0 sm:grid-cols-[92px_minmax(120px,180px)_110px_1fr_auto] sm:items-baseline sm:gap-2.5"
            >
              <span>{eatClock(log.at)}</span>
              <span>{log.component}</span>
              <span
                className={`font-semibold ${labelColor[log.state] ?? labelColor.none}`}
              >
                {stateLabel(log.state, t)}
              </span>
              <span className="text-[#3f3c38]">{log.summary}</span>
              <span className="text-[#8a8478]">
                {log.latency_ms > 0 ? `${log.latency_ms} ms` : ''}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 text-xs text-[#8a8478]">
        {t('Version')} {report.version} · {t('Uptime')}{' '}
        {processUptime(report.uptime_seconds)}
      </p>
    </div>
  )
}

export function StatusSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-8 w-64 animate-pulse rounded bg-[#e6e2da]" />
      <div className="h-9 w-full animate-pulse rounded bg-[#e6e2da]" />
      <div className="h-24 w-full animate-pulse rounded bg-[#e6e2da]" />
    </div>
  )
}
