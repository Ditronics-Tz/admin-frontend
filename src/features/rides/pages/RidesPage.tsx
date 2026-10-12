import { RecentRidesTable } from '@/features/dashboard/components/RecentRidesTable'
export default function RidesPage() {
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <h1 className="text-2xl font-bold">Rides</h1>
      <p className="text-sm text-muted-foreground">
        The current ride endpoint returns an empty list. Dispatch and trip persistence are
        not yet available.
      </p>
      <RecentRidesTable />
    </div>
  )
}
