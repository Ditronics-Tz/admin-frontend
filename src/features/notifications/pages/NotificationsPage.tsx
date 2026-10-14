import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Bell, CheckCircle2, Clock3, TriangleAlert } from 'lucide-react'
import { notificationService } from '../services/notification.service'
import { DataTable } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/ReasonDialog'
import { Select } from '@/features/operations/shared'
import { Button } from '@/components/ui/button'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'

export default function NotificationsPage() {
  const t = useShipText()
  const [status, setStatus] = useState('')
  const [offset, setOffset] = useState(0)
  const params = { status, offset, limit: 20 }
  const query = useQuery({
    queryKey: ['admin', 'notifications', params],
    queryFn: () => notificationService.deliveries(params),
    refetchInterval: 30_000,
  })
  const counts = query.data?.by_status

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            {t('Notification deliveries')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            {t('Review notification jobs created by safety and account workflows.')}
          </p>
        </div>
        <Button variant="outline" onClick={() => void query.refetch()}>
          {t('Refresh')}
        </Button>
      </header>

      {query.data?.sender_mode === 'logging_stub' && (
        <aside role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">{t('External SMS and push delivery is not configured')}</p>
              <p className="mt-1 leading-5">
                {t('The current backend sender is a logging stub. Stored delivered status means the job was accepted by that stub; it does not confirm a message reached a phone or app.')}
              </p>
            </div>
          </div>
        </aside>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('Pending'), value: counts?.pending, icon: Clock3, tone: 'text-amber-700' },
          { label: t('Processing'), value: counts?.processing, icon: Activity, tone: 'text-sky-700' },
          { label: t('Sender accepted'), value: counts?.delivered, icon: CheckCircle2, tone: 'text-emerald-700' },
          { label: t('Failed'), value: counts?.failed, icon: Bell, tone: 'text-rose-700' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <section key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[#172B36]">{value?.toLocaleString() ?? '—'}</p>
            </div>
            <Icon className={`h-5 w-5 ${tone}`} />
          </section>
        ))}
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[#172B36]">{t('Delivery queue history')}</h2>
            <p className="text-xs text-muted-foreground">{t('Recipient phone numbers and personal identifiers are hidden.')}</p>
          </div>
          <Select
            label={t('Status')}
            value={status}
            options={['', 'pending', 'processing', 'delivered', 'failed']}
            onChange={(value) => {
              setStatus(value)
              setOffset(0)
            }}
          />
        </div>
        <DataTable
          label={t('Delivery queue history')}
          loading={query.isPending}
          error={query.error}
          retry={() => void query.refetch()}
          columns={['Created (EAT)', 'Template', 'Language', 'Status', 'Attempts'].map(t)}
          rows={(query.data?.notifications ?? []).map((item) => ({
            id: item.id,
            cells: [
              formatDateTime(item.created_at),
              item.template.replaceAll('_', ' '),
              item.language.toUpperCase(),
              <StatusBadge key={`${item.id}-status`} status={item.status} />,
              item.attempts,
            ],
          }))}
          total={query.data?.total ?? 0}
          offset={offset}
          limit={20}
          onPage={setOffset}
        />
      </section>
    </div>
  )
}
