import { useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/feedback/QueryError'
import { useOpsText } from './text'
import {
  PromoSkeleton,
  Empty,
  ResponsiveTable,
  Pagination,
  DateLabel,
  StatusBadge,
} from '@/features/promotions/components/shared'
import '@/features/promotions/promotions.css'

export {
  PromoSkeleton as Loading,
  Empty,
  ResponsiveTable,
  Pagination,
  DateLabel,
  StatusBadge,
}
export function Heading({ title, children }: { title: string; children?: ReactNode }) {
  const t = useOpsText()
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-[#172B36]">{t(title)}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </header>
  )
}
export function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  disabled?: boolean
}) {
  const t = useOpsText()
  return (
    <label className="grid gap-1 text-sm">
      {t(label)}
      <select
        className="promo-select"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((v) => (
          <option value={v} key={v}>
            {v ? t(v.replaceAll('_', ' ')) : t('All')}
          </option>
        ))}
      </select>
    </label>
  )
}
export function ActionDialog({
  title,
  onClose,
  run,
  children,
  requireNote = true,
  until = false,
  validate,
}: {
  title: string
  onClose: () => void
  run: (note: string, until: string) => Promise<unknown>
  children?: ReactNode
  requireNote?: boolean
  until?: boolean
  validate?: (note: string) => string | null
}) {
  const t = useOpsText(),
    cache = useQueryClient(),
    [note, setNote] = useState(''),
    [end, setEnd] = useState('')
  const invalid = validate?.(note)
  const action = useMutation({
    mutationFn: () => run(note, end),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ['operations'] })
      toast.success(t('Action completed'))
      onClose()
    },
    onError: (e) => toast.error(e.message),
  })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !action.isPending) onClose()
      }}
    >
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (action.isPending) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (action.isPending) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t(title)}</DialogTitle>
          <DialogDescription>
            {t('Review the details and confirm this action.')}
          </DialogDescription>
        </DialogHeader>
        {children}
        {requireNote && (
          <div>
            <Label htmlFor="operation-note">{t('Required note')}</Label>
            <Textarea
              id="operation-note"
              value={note}
              maxLength={2000}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}
        {until && (
          <div>
            <Label htmlFor="operation-until">{t('End date')}</Label>
            <Input
              id="operation-until"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        )}
        {invalid && <p role="alert">{invalid}</p>}
        {action.isError && <QueryError error={action.error} />}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={action.isPending} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={
              action.isPending ||
              (requireNote && !note.trim()) ||
              (until && !end) ||
              !!invalid
            }
            onClick={() => action.mutate()}
          >
            {t('Confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
