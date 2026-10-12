import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { promoService } from '../promo.service'
import type { Promo } from '../types'
import { usePromoWriteAccess } from '../access'
import { usePromoText } from '../i18n'
import { ConfirmDialog } from './shared'

export function PromoActions({ promo, menu = false }: { promo: Promo; menu?: boolean }) {
  const canWrite = usePromoWriteAccess(),
    t = usePromoText(),
    navigate = useNavigate(),
    cache = useQueryClient()
  const [confirm, setConfirm] = useState<'pause' | 'resume' | 'archive' | null>(null)
  const mutation = useMutation({
    mutationFn: (action: 'pause' | 'resume' | 'archive') =>
      promoService.action(promo.id, action),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ['promotions'] })
      setConfirm(null)
      toast.success(t('Promo updated'))
    },
  })
  const label = (action: string) => t(action.replace(/^./, (c) => c.toUpperCase()))
  const available: ('pause' | 'resume' | 'archive')[] =
    promo.status === 'archived'
      ? []
      : [
          ...(promo.status === 'active' ? ['pause' as const] : ['resume' as const]),
          'archive',
        ]
  const choose = (action: 'pause' | 'resume' | 'archive') => {
    mutation.reset()
    setConfirm(action)
  }
  return (
    <>
      {menu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('Actions for {code}', { code: promo.code })}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => navigate(`/promotions/${promo.id}`)}>
              {t('View')}
            </DropdownMenuItem>
            {canWrite && (
              <>
                <DropdownMenuItem
                  onSelect={() => navigate(`/promotions/${promo.id}/edit`)}
                >
                  {t('Edit')}
                </DropdownMenuItem>
                {available.map((action) => (
                  <DropdownMenuItem key={action} onSelect={() => choose(action)}>
                    {label(action)}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        canWrite && (
          <>
            <Button
              variant="outline"
              onClick={() => navigate(`/promotions/${promo.id}/edit`)}
            >
              {t('Edit')}
            </Button>
            {available.map((action) => (
              <Button key={action} variant="outline" onClick={() => choose(action)}>
                {label(action)}
              </Button>
            ))}
          </>
        )
      )}
      {!canWrite && mutation.isError && <QueryError error={mutation.error} />}
      {confirm && canWrite && (
        <ConfirmDialog
          title={t('{action} {code}?', { action: label(confirm), code: promo.code })}
          description={t(
            confirm === 'archive'
              ? 'Archived promos cannot be resumed. Existing reservations are retained.'
              : confirm === 'pause'
                ? 'Passengers will be unable to reserve this promo while it is paused.'
                : 'The promo will become available when its validity dates and limits allow.'
          )}
          onClose={() => setConfirm(null)}
          pending={mutation.isPending}
          error={mutation.error}
          onConfirm={() => {
            if (canWrite) mutation.mutate(confirm)
          }}
        />
      )}
    </>
  )
}
