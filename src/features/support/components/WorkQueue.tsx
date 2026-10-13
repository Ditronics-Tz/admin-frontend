import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supportService, type WorkKind } from '../services/support.service'
import { DataTable, FilterBar } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/ReasonDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select } from '@/features/operations/shared'
import { useAuthStore } from '@/stores/useAuthStore'
import { useShipText } from '@/components/common/ship-text'
import { formatApiError } from '@/lib/api/errors'

export function WorkQueue({ kind }: { kind: WorkKind }) {
  const t = useShipText(),
    user = useAuthStore((state) => state.user)
  const [status, setStatus] = useState('open'),
    [offset, setOffset] = useState(0)
  const [q, setQ] = useState(''),
    [priority, setPriority] = useState(''),
    [category, setCategory] = useState(''),
    [assignee, setAssignee] = useState(''),
    [mine, setMine] = useState(false)
  const params = {
    status,
    q,
    priority,
    category,
    assignee: mine ? user?.id || '' : assignee,
    limit: 20,
    offset,
  }
  const query = useQuery({
    queryKey: ['support', kind, params],
    queryFn: () => supportService.page(kind, params),
    retry: false,
  })
  const statuses =
    kind === 'tickets'
      ? ['open', 'in_progress', 'resolved', 'closed']
      : ['open', 'in_review', 'resolved', 'dismissed']
  const change = (set: (value: string) => void, value: string) => {
    set(value)
    setOffset(0)
  }
  const unavailable =
    query.isError && [404, 501].includes(formatApiError(query.error).status || 0)
  return (
    <section className="space-y-4 rounded-xl border bg-white p-4 sm:p-6">
      <Tabs value={status} onValueChange={(value) => change(setStatus, value)}>
        <div className="overflow-x-auto">
          <TabsList>
            {statuses.map((value) => (
              <TabsTrigger key={value} value={value}>
                {t(value.replaceAll('_', ' '))}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={status} className="space-y-4">
          <FilterBar q={q} onSearch={(value) => change(setQ, value)}>
            <Select
              label={t('Priority')}
              value={priority}
              options={['', 'low', 'normal', 'high', 'urgent']}
              onChange={(value) => change(setPriority, value)}
            />
            <label className="grid gap-1 text-sm">
              {t('Category')}
              <Input
                value={category}
                onChange={(event) => change(setCategory, event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              {t('Assignee')}
              <Input
                disabled={mine}
                value={assignee}
                onChange={(event) => change(setAssignee, event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mine}
                onChange={(event) => {
                  setMine(event.target.checked)
                  setOffset(0)
                }}
              />
              {t('Assigned to me')}
            </label>
          </FilterBar>
          {unavailable && (
            <aside role="status" className="rounded-lg border bg-amber-50 p-3 text-sm">
              {t('Support persistence is unavailable on this server.')}
            </aside>
          )}
          <DataTable
            label={t(kind)}
            columns={['Subject', 'Status', 'Priority', 'Category', 'Assignee'].map(t)}
            loading={query.isPending}
            error={query.error}
            retry={() => void query.refetch()}
            rows={(query.data?.[kind] || []).map((item) => ({
              id: item.id,
              cells: [
                <Link
                  className="text-primary underline"
                  to={`/support/${kind}/${encodeURIComponent(item.id)}`}
                >
                  {item.subject || item.title || item.description || item.id}
                </Link>,
                <StatusBadge status={item.status} />,
                item.priority || '—',
                item.category || '—',
                item.assigned_to || t('Unassigned'),
              ],
            }))}
            total={query.data?.total || 0}
            offset={offset}
            onPage={setOffset}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
