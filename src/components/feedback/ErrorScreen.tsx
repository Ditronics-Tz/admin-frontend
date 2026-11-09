import { Button } from '@/components/ui/button'

export function ErrorScreen({
  title,
  detail,
  technical,
  onRetry,
  compact = false,
}: {
  title: string
  detail?: string
  technical?: string
  onRetry?: () => void
  compact?: boolean
}) {
  return (
    <div
      role="alert"
      className={
        compact
          ? 'flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-white px-4 py-6 text-center'
          : 'flex min-h-screen flex-col items-center justify-center bg-[#f6f5f2] px-6 py-10 text-center'
      }
    >
      <img
        src="/error-500.gif"
        alt=""
        className={compact ? 'h-40 w-auto' : 'h-auto w-full max-w-md'}
      />
      <h1
        className={
          compact
            ? 'text-base font-semibold text-[#172B36]'
            : 'text-2xl font-semibold tracking-tight text-[#172B36]'
        }
      >
        {title}
      </h1>
      {detail && <p className="max-w-md text-sm text-[#5f5a53]">{detail}</p>}
      {technical && technical !== detail && (
        <p className="max-w-lg break-all text-xs text-[#8a8478]">{technical}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button type="button" variant="brand" onClick={onRetry}>
            {compact ? 'Retry' : 'Reload'}
          </Button>
        )}
        {!compact && (
          <Button asChild variant="outline">
            <a href="/dashboard">Dashboard</a>
          </Button>
        )}
      </div>
    </div>
  )
}
