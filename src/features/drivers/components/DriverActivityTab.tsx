import { Link } from 'react-router-dom'
import type { Driver } from '../types/driver.types'
import { usePermission } from '@/features/auth/hooks/usePermission'
export function DriverActivityTab({ driver: _driver }: { driver: Driver }) {
  const { canViewAuditLogs } = usePermission()
  return (
    <section className="space-y-3 rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Account activity</h2>
      <p className="text-sm text-muted-foreground">
        A driver-specific activity timeline is not available.
      </p>
      {canViewAuditLogs && (
        <Link className="text-sm text-primary underline" to="/settings?tab=audit">
          View the administrative audit trail
        </Link>
      )}
    </section>
  )
}
