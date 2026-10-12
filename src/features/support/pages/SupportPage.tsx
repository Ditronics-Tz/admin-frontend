import { WorkQueue } from '../components/WorkQueue'
export default function SupportPage() {
  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customer tickets and complaints.
        </p>
      </div>
      <WorkQueue kind="tickets" />
      <WorkQueue kind="complaints" />
    </div>
  )
}
