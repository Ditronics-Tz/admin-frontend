import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { QueryError } from '@/components/feedback/QueryError'
import { PromoSkeleton } from '@/features/promotions/components/shared'
import { Button } from '@/components/ui/button'
import { useShipText } from '@/components/common/ship-text'

export default function SystemStatusPage() {
  const t = useShipText()
  const query = useQuery({
    queryKey: ['system-ready'],
    queryFn: async () =>
      (
        await apiClient.get<{
          status: string
          database: string
          version: string
          uptime_seconds: number
        }>('/ready')
      ).data,
    refetchInterval: 30000,
    retry: false,
  })
  return (
    <section className="space-y-5 p-4 sm:p-8">
      <h1 className="text-2xl font-bold">{t('System status')}</h1>
      <Button variant="outline" onClick={() => void query.refetch()}>
        {t('Refresh')}
      </Button>
      {query.isPending ? (
        <PromoSkeleton />
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <dl className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          {[
            ['Status', query.data.status],
            ['Database', query.data.database],
            ['Version', query.data.version],
            ['Uptime', `${Math.floor(query.data.uptime_seconds)} s`],
          ].map(([key, value]) => (
            <div key={key}>
              <dt className="text-sm text-muted-foreground">{t(key)}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
