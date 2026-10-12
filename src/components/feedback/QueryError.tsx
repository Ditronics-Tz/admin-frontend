import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatApiError } from '@/lib/api/errors'

export function QueryError({ error, retry }: { error: unknown; retry?: () => void }) {
  const detail = formatApiError(error)
  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm"
    >
      <p>{detail.message}</p>
      {detail.require2FA && (
        <Link
          className="font-semibold text-primary underline"
          to="/settings?tab=security"
        >
          Set up two-factor authentication
        </Link>
      )}
      {detail.mustChangePassword && (
        <Link className="font-semibold text-primary underline" to="/change-password">
          Change your temporary password
        </Link>
      )}
      {retry && (
        <div>
          <Button variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}
