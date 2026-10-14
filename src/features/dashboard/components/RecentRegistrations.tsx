import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, UserPlus } from 'lucide-react'
import { customerService } from '@/features/customers/services/customer.service'
import { QueryError } from '@/components/feedback/QueryError'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'

export function RecentRegistrations() {
  const t = useShipText()
  const createdFrom = useMemo(
    () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    []
  )
  const query = useQuery({
    queryKey: ['admin', 'recent-registrations', createdFrom.slice(0, 10)],
    queryFn: () =>
      customerService.listPage({ role: '', created_from: createdFrom, limit: 5, offset: 0 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  return (
    <section className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-[#172B36]">{t('New registrations')}</h2>
            <p className="text-xs text-muted-foreground">{t('Last 30 days')}</p>
          </div>
        </div>
        <Link className="inline-flex items-center gap-1 text-sm font-medium text-primary underline" to="/passengers">
          {t('View all users')} <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {query.isPending ? (
        <p className="text-sm text-muted-foreground">{t('Loading registrations…')}</p>
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tight text-[#172B36]">
            {query.data.total.toLocaleString()}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {t('accounts registered')}
            </span>
          </p>
          {query.data.users.length ? (
            <ul className="divide-y divide-slate-100">
              {query.data.users.map((user) => (
                <li key={user.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="capitalize text-slate-700">{user.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.created_at ? formatDateTime(user.created_at) : '—'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-muted-foreground">
              {t('No new registrations in this period')}
            </p>
          )}
        </>
      )}
    </section>
  )
}
