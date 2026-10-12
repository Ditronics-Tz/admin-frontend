export default function LiveOperationsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <h1 className="text-2xl font-bold">Live operations</h1>
      <section className="space-y-3 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Live dispatch unavailable</h2>
        <p className="text-sm text-muted-foreground">
          The current service does not provide driver locations, dispatch events, or live
          trip tracking. Fleet and pickup estimates will appear here when those
          capabilities are available.
        </p>
      </section>
    </div>
  )
}
