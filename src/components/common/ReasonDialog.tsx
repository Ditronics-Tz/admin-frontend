import { useId, useState } from 'react'
import { ConfirmDialog } from '@/features/promotions/components/shared'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import { useShipText } from './ship-text'

export { ConfirmDialog }
export { StatusBadge } from '@/features/promotions/components/shared'

export function ReasonDialog({
  title,
  pending,
  error,
  onClose,
  onConfirm,
  children,
  canConfirm = true,
}: {
  title: string
  pending?: boolean
  error?: unknown
  onClose: () => void
  onConfirm: (reason: string) => void
  children?: React.ReactNode
  canConfirm?: boolean
}) {
  const [reason, setReason] = useState('')
  const id = useId(),
    t = useShipText()
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (pending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t('Review and confirm this action.')}</DialogDescription>
        </DialogHeader>
        {children}
        <label htmlFor={id}>{t('Required reason')}</label>
        <Textarea
          id={id}
          required
          maxLength={2000}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        {!!error && <QueryError error={error} />}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={pending} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={pending || !canConfirm || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {t('Confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
