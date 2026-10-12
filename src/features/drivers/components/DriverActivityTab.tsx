import { Link } from 'react-router-dom'
import type { Driver } from '../types/driver.types'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { AccountSupportPanel } from '@/features/customers/components/AccountSupportPanel'
export function DriverActivityTab({ driver }: { driver: Driver }) {
  const { canViewAuditLogs } = usePermission()
  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Account activity</h2>
        <p className="text-sm text-muted-foreground">
          Document submissions, reviewer claims, decisions, suspension and expiry are kept
          in the permanent review history.
        </p>
        <Link
          className="block text-sm text-primary underline"
          to={`/drivers/verifications/${driver.id}`}
        >
          View this driver's review history
        </Link>
        {canViewAuditLogs && (
          <Link className="text-sm text-primary underline" to="/settings?tab=audit">
            View the administrative audit trail
          </Link>
        )}
      </section>
      <AccountSupportPanel id={driver.id} />
    </div>
  )
}
