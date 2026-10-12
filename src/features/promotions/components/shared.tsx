import { useEffect, type ReactNode } from 'react'
import { Link, useBlocker } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/feedback/QueryError'
import { useUiStore } from '@/stores/useUiStore'
import { promoService } from '../promo.service'
import { promoDate, relativeDate } from '../utils'
import { usePromoText } from '../i18n'
import { usePromoWriteAccess } from '../access'

export function ReadOnlyNotice() {
  const t = usePromoText(),
    write = usePromoWriteAccess()
  return write ? null : (
    <aside
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
    >
      <strong>{t('Read-only access')}. </strong>
      {t('You can view promotions. Changes require admin permission.')}
    </aside>
  )
}
export function PromoHeading({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  const t = usePromoText()
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <Link
          className="text-sm text-brand-primary-teal hover:underline"
          to="/promotions"
        >
          {t('Back to promotions')}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#172B36]">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
export function PromoSkeleton() {
  return (
    <div aria-label="Loading" role="status" className="space-y-3">
      <Skeleton className="h-10 w-1/2" />
      {[1, 2, 3].map((key) => (
        <Skeleton key={key} className="h-20 w-full" />
      ))}
    </div>
  )
}
export function Empty({ message = 'No records yet' }: { message?: string }) {
  const t = usePromoText()
  return (
    <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      {t(message)}
    </p>
  )
}
export function StatusBadge({ status }: { status: string }) {
  const t = usePromoText()
  const colors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-800',
    approved: 'bg-emerald-50 text-emerald-800',
    applied: 'bg-emerald-50 text-emerald-800',
    scheduled: 'bg-blue-50 text-blue-800',
    expired: 'bg-rose-50 text-rose-800',
    rejected: 'bg-rose-50 text-rose-800',
    paused: 'bg-amber-50 text-amber-900',
  }
  return (
    <Badge variant="outline" className={colors[status] || 'bg-slate-50 text-slate-700'}>
      {t(status.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase()))}
    </Badge>
  )
}
export function CodeCopy({ code }: { code: string }) {
  const t = usePromoText()
  return (
    <span className="inline-flex items-center gap-1">
      <code className="font-semibold">{code}</code>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('Copy code')}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
            toast.success(t('Code copied'))
          } catch {
            toast.error(t('Unable to copy code'))
          }
        }}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </span>
  )
}
export function DateLabel({
  value,
  relative = false,
}: {
  value: string
  relative?: boolean
}) {
  const locale = useUiStore((s) => s.locale)
  return (
    <time dateTime={value} title={promoDate(value)} className="whitespace-normal">
      {promoDate(value)}
      {relative && (
        <span className="block text-xs text-muted-foreground">
          {relativeDate(value, locale)}
        </span>
      )}
    </time>
  )
}
export function Pagination({
  total,
  offset,
  limit = 20,
  onChange,
}: {
  total: number
  offset: number
  limit?: number
  onChange: (offset: number) => void
}) {
  const t = usePromoText()
  return (
    <nav
      aria-label={t('Pagination')}
      className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm"
    >
      <span>
        {total === 0 ? '0' : `${offset + 1}–${Math.min(offset + limit, total)}`} /{' '}
        {total.toLocaleString()}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          {t('Previous')}
        </Button>
        <Button
          variant="outline"
          disabled={offset + limit >= total}
          onClick={() => onChange(offset + limit)}
        >
          {t('Next')}
        </Button>
      </div>
    </nav>
  )
}
export function ConfirmDialog({
  title,
  description,
  onClose,
  onConfirm,
  pending,
  error,
}: {
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
  pending?: boolean
  error?: unknown
}) {
  const t = usePromoText()
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (pending) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (pending) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {!!error && <QueryError error={error} />}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={pending} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button disabled={pending} onClick={onConfirm}>
            {t(pending ? 'Saving…' : 'Confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export function UnsavedChanges({ dirty }: { dirty: boolean }) {
  const t = usePromoText()
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname
  )
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
  return blocker.state === 'blocked' ? (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) blocker.reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Leave without saving?')}</DialogTitle>
          <DialogDescription>{t('Your unsaved changes will be lost.')}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => blocker.reset()}>
            {t('Keep editing')}
          </Button>
          <Button onClick={() => blocker.proceed()}>{t('Discard changes')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null
}
export function UserLabel({ id }: { id: string }) {
  const t = usePromoText()
  const user = useQuery({
    queryKey: ['promo-user', id],
    queryFn: () => promoService.user(id),
    staleTime: 60_000,
  })
  if (user.isPending) return <Skeleton className="h-4 w-24" />
  if (user.isError)
    return (
      <span title={id}>
        {id}
        <Button variant="ghost" size="sm" onClick={() => void user.refetch()}>
          {t('Retry')}
        </Button>
      </span>
    )
  return (
    <span title={id}>
      {user.data.name}
      <span className="block text-xs text-muted-foreground">
        {user.data.phone || user.data.email}
      </span>
    </span>
  )
}
export function ResponsiveTable({
  columns,
  rows,
  label,
}: {
  columns: string[]
  rows: { id: string; cells: ReactNode[] }[]
  label: string
}) {
  return (
    <table aria-label={label} className="promo-table w-full text-left text-sm">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col" className="p-3 font-medium text-muted-foreground">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-t">
            {row.cells.map((cell, i) => (
              <td key={i} data-label={columns[i]} className="p-3 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
