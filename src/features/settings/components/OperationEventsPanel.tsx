import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/common/DataTable'
import { useShipText } from '@/components/common/ship-text'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils/formatters'
import { staffService } from '../services/staff.service'

const PAGE_SIZE = 25

export function OperationEventsPanel() {
  const t = useShipText()
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState({
    action: '',
    actor_type: '',
    actor_id: '',
    from: '',
    to: '',
    request_id: '',
  })
  const update = (field: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }))
    setOffset(0)
  }
  const events = useQuery({
    queryKey: ['admin', 'operation-events', offset, filters],
    queryFn: () =>
      staffService.listOperationEvents({ limit: PAGE_SIZE, offset, ...filters }),
  })

  return (
    <section className="space-y-5 rounded-xl border bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#172B36]">
            {t('Operation history')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              'Registrations, sign-ins, and API changes are recorded without request contents or credentials.'
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void events.refetch()}
          disabled={events.isFetching}
        >
          {t('Refresh')}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1 text-sm">
          {t('Action')}
          <Input
            value={filters.action}
            onChange={(event) => update('action', event.target.value)}
            placeholder="user_login"
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('Actor type')}
          <select
            className="h-10 rounded-md border border-input bg-background px-3"
            value={filters.actor_type}
            onChange={(event) => update('actor_type', event.target.value)}
          >
            <option value="">{t('All')}</option>
            <option value="app">{t('App user')}</option>
            <option value="staff">{t('Staff')}</option>
            <option value="anonymous">{t('Anonymous')}</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {t('Actor ID')}
          <Input
            value={filters.actor_id}
            onChange={(event) => update('actor_id', event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('From')}
          <Input
            type="date"
            value={filters.from}
            onChange={(event) => update('from', event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('To')}
          <Input
            type="date"
            value={filters.to}
            onChange={(event) => update('to', event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t('Request ID')}
          <Input
            value={filters.request_id}
            onChange={(event) => update('request_id', event.target.value)}
          />
        </label>
      </div>
      <DataTable
        label={t('Operation history')}
        columns={['Time (EAT)', 'Action', 'Actor', 'Route', 'Status', 'Request ID'].map(
          t
        )}
        rows={(events.data?.events ?? []).map((entry) => ({
          id: entry.id,
          cells: [
            formatDateTime(entry.created_at),
            <span className="font-medium">{entry.action.replaceAll('_', ' ')}</span>,
            entry.actor_type === 'app' && entry.actor_id ? (
              <Link
                className="break-all text-primary underline"
                to={ROUTES.USER_DETAILS.replace(
                  ':userId',
                  encodeURIComponent(entry.actor_id)
                )}
              >
                {entry.actor_id}
              </Link>
            ) : (
              <span className="break-all">
                {entry.actor_id || t('Anonymous')} ({entry.actor_type})
              </span>
            ),
            <code className="break-all text-xs">
              {entry.method} {entry.route}
            </code>,
            <span
              className={
                entry.status >= 400
                  ? 'font-semibold text-red-700'
                  : 'font-semibold text-emerald-700'
              }
            >
              {entry.status}
            </span>,
            <code className="break-all text-xs">{entry.request_id}</code>,
          ],
        }))}
        total={events.data?.total ?? 0}
        limit={PAGE_SIZE}
        offset={offset}
        onPage={setOffset}
        loading={events.isPending}
        error={events.error}
        retry={() => void events.refetch()}
      />
    </section>
  )
}
