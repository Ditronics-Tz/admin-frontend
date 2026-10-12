import { useRecentRides } from '../hooks/useDashboard'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'

export function RecentRidesTable() {
  const query = useRecentRides()
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <div className="flex justify-between">
        <h2 className="font-semibold">Recent rides</h2>
        <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
          Refresh
        </Button>
      </div>
      {query.isPending ? (
        <p role="status">Loading ride records…</p>
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <p className="text-sm">{query.data.count} ride records returned.</p>
          <p className="py-8 text-center text-sm text-muted-foreground">
            {query.data.rides.length === 0
              ? 'No ride records. Trip persistence is not yet available.'
              : 'Ride records are available, but this server does not yet define a supported ride detail contract.'}
          </p>
        </>
      )}
    </section>
  )
}
