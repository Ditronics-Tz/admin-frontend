import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { staffService } from '../services/staff.service'
import { DataTable, FilterBar } from '@/components/common/DataTable'
import { formatDateTime } from '@/lib/utils/formatters'
import { Input } from '@/components/ui/input'
import { useShipText } from '@/components/common/ship-text'

export function AuditLogPanel() {
  const t = useShipText(),
    [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState({
    q: '',
    action: '',
    actor: '',
    from: '',
    to: '',
  })
  const query = useQuery({
    queryKey: ['admin', 'audit-logs', offset, filters],
    queryFn: () => staffService.listAuditLogs(25, offset, filters),
  })
  const change = (field: keyof typeof filters, value: string) => {
    setFilters((previous) => ({ ...previous, [field]: value }))
    setOffset(0)
  }
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <h2 className="text-lg font-semibold">{t('Security audit trail')}</h2>
      <FilterBar q={filters.q} onSearch={(value) => change('q', value)}>
        {(['action', 'actor', 'from', 'to'] as const).map((field) => (
          <label className="grid gap-1 text-sm" key={field}>
            {t(field[0].toUpperCase() + field.slice(1))}
            <Input
              type={['from', 'to'].includes(field) ? 'date' : 'text'}
              value={filters[field]}
              onChange={(event) => change(field, event.target.value)}
            />
          </label>
        ))}
      </FilterBar>
      <DataTable
        label={t('Security audit trail')}
        columns={['Time (EAT)', 'Actor', 'Action / target', 'IP', 'Details'].map(t)}
        rows={(query.data?.logs || []).map((log) => ({
          id: log.id,
          cells: [
            formatDateTime(log.created_at),
            log.actor_id,
            `${log.action} · ${log.target_type}: ${log.target_id}`,
            log.ip,
            <code className="break-all">{log.meta}</code>,
          ],
        }))}
        total={query.data?.total || 0}
        limit={25}
        offset={offset}
        onPage={setOffset}
        loading={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
    </section>
  )
}
