import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ErrorScreen } from '@/components/feedback/ErrorScreen'
import { useShipText } from '@/components/common/ship-text'
import { ROUTES } from '@/lib/constants'
import { apiStatusURL, useStaffStatus } from '@/features/status/api'
import { StatusBoard, StatusSkeleton } from '@/features/status/StatusBoard'

export default function SystemStatusPage() {
  const t = useShipText()
  const query = useStaffStatus()
  const apiPage = apiStatusURL()
  return (
    <section className="bg-[#f6f5f2] p-4 sm:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#172B36]">{t('System status')}</h1>
          <p className="mt-1 max-w-xl text-sm text-[#6f6a62]">
            {t('Operations health and 90-day uptime from the API status module.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={ROUTES.PUBLIC_STATUS}>{t('Public status')}</Link>
          </Button>
          <Button variant="outline" onClick={() => void query.refetch()}>
            {t('Refresh')}
          </Button>
        </div>
      </header>
      {query.isPending ? (
        <StatusSkeleton />
      ) : query.isError ? (
        <ErrorScreen
          compact
          title={t('Status is unavailable')}
          detail={t('The status module did not respond.')}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <StatusBoard report={query.data} />
      )}
      {apiPage && (
        <p className="mt-6 text-sm text-[#6f6a62]">
          <a
            className="font-medium text-[#1C7C70] underline-offset-4 hover:underline"
            href={apiPage}
          >
            {t('Open the API status page')}
          </a>
        </p>
      )}
    </section>
  )
}
