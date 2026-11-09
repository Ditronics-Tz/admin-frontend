import { Link } from 'react-router-dom'
import { ErrorScreen } from '@/components/feedback/ErrorScreen'
import { ROUTES } from '@/lib/constants'
import { useShipText } from '@/components/common/ship-text'
import { apiStatusURL, useStatusReport } from './api'
import { StatusBoard, StatusSkeleton } from './StatusBoard'

export default function PublicStatusPage() {
  const t = useShipText()
  const query = useStatusReport()
  const apiPage = apiStatusURL()
  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1c1b19]">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6 flex justify-end">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm font-medium text-[#1C7C70] underline-offset-4 hover:underline"
          >
            {t('Staff sign in')}
          </Link>
        </div>
        {query.isPending ? (
          <StatusSkeleton />
        ) : query.isError ? (
          <ErrorScreen
            title={t('Status is unavailable')}
            detail={t(
              'The status module did not respond. Reload to try the latest sample.'
            )}
            onRetry={() => void query.refetch()}
          />
        ) : (
          <StatusBoard report={query.data} />
        )}
        <p className="mt-8 text-xs text-[#8a8478]">
          {t(
            'This page reads the API status module. The API also serves /status on its own, so the history stays available when an admin screen cannot load.'
          )}
          {apiPage && (
            <>
              {' '}
              <a
                className="font-medium text-[#1C7C70] underline-offset-4 hover:underline"
                href={apiPage}
              >
                {apiPage}
              </a>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
