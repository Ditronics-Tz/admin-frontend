import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { customerService } from '../services/customer.service'
import { UserDetailsDialog } from '../components/UserDetailsDialog'
import { DataTable, FilterBar } from '@/components/common/DataTable'
import { MaskedValue } from '@/components/common/MaskedValue'
import { StatusBadge } from '@/components/common/ReasonDialog'
import { useShipText } from '@/components/common/ship-text'
import { Select } from '@/features/operations/shared'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils/formatters'

export default function CustomersPage() {
  const t = useShipText(),
    [selectedId, setSelectedId] = useState<string | null>(null)
  const [q, setQ] = useState(''),
    [status, setStatus] = useState(''),
    [role, setRole] = useState(''),
    [registrationWindow, setRegistrationWindow] = useState('All time'),
    [offset, setOffset] = useState(0)
  const windowDays: Record<string, number> = {
    'Last 24 hours': 1,
    'Last 7 days': 7,
    'Last 30 days': 30,
  }
  const days = windowDays[registrationWindow]
  const createdFrom = useMemo(
    () =>
      days == null
        ? undefined
        : new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    [days]
  )
  const params = { q, status, role, offset, limit: 20, created_from: createdFrom }
  const query = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.listPage(params),
  })
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('User directory')}</h1>
        <Button variant="outline" onClick={() => void query.refetch()}>
          {t('Refresh')}
        </Button>
      </header>
      <FilterBar
        q={q}
        onSearch={(value) => {
          setQ(value)
          setOffset(0)
        }}
      >
        <Select
          label={t('Role')}
          value={role}
          options={['', 'passenger', 'driver']}
          onChange={(value) => {
            setRole(value)
            setOffset(0)
          }}
        />
        <Select
          label={t('Status')}
          value={status}
          options={['', 'active', 'suspended', 'banned']}
          onChange={(value) => {
            setStatus(value)
            setOffset(0)
          }}
        />
        <Select
          label={t('Registration date')}
          value={registrationWindow}
          options={['All time', 'Last 24 hours', 'Last 7 days', 'Last 30 days']}
          onChange={(value) => {
            setRegistrationWindow(value)
            setOffset(0)
          }}
        />
      </FilterBar>
      <section className="rounded-xl border bg-white p-4">
        <DataTable
          label={t('User directory')}
          loading={query.isPending}
          error={query.error}
          retry={() => void query.refetch()}
          columns={['Name', 'Email', 'Phone', 'Role', 'Status', 'Registered (EAT)'].map(t)}
          rows={(query.data?.users || []).map((user) => ({
            id: user.id,
            cells: [
              <button
                className="text-primary underline"
                onClick={() => setSelectedId(user.id)}
              >
                {user.name}
              </button>,
              user.email,
              <MaskedValue key={user.id} value={user.phone || ''} userId={user.id} />,
              user.role,
              <StatusBadge
                status={user.status || (user.is_active ? 'active' : 'suspended')}
              />,
              user.created_at ? formatDateTime(user.created_at) : '—',
            ],
          }))}
          total={query.data?.total || 0}
          offset={offset}
          onPage={setOffset}
        />
      </section>
      {selectedId && (
        <UserDetailsDialog
          key={selectedId}
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
