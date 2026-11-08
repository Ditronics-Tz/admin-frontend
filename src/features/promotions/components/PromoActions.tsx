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

type PromoAction = 'pause' | 'resume' | 'archive' | 'delete'

export function PromoActions({ promo, menu = false }: { promo: Promo; menu?: boolean }) {
  const canWrite = usePromoWriteAccess(),
    t = usePromoText(),
    navigate = useNavigate(),
    cache = useQueryClient()
  const [confirm, setConfirm] = useState<PromoAction | null>(null)
  const mutation = useMutation({
    mutationFn: async (action: PromoAction) =>
      action === 'delete'
        ? promoService.remove(promo.id)
        : promoService.action(promo.id, action),
    onSuccess: async (_data, action) => {
      if (action === 'delete') {
        if (!menu) navigate('/promotions', { replace: true })
        cache.removeQueries({ queryKey: ['promotions', 'detail', promo.id], exact: true })
      }
      await cache.invalidateQueries({ queryKey: ['promotions'] })
      setConfirm(null)
      toast.success(t(action === 'delete' ? 'Promo deleted' : 'Promo updated'))
    },
  })
  const label = (action: string) => t(action.replace(/^./, (c) => c.toUpperCase()))
  const available: PromoAction[] =
    promo.status === 'archived'
      ? []
      : [
          ...(promo.status === 'active' ? ['pause' as const] : ['resume' as const]),
          'archive',
        ]
  if (promo.source === 'admin') available.push('delete')
  const choose = (action: PromoAction) => {
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
                  <DropdownMenuItem
                    key={action}
                    onSelect={() => choose(action)}
                    className={action === 'delete' ? 'text-destructive' : undefined}
                  >
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
              <Button
                key={action}
                variant={action === 'delete' ? 'destructive' : 'outline'}
                onClick={() => choose(action)}
              >
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
            confirm === 'delete'
              ? 'Delete this promotion from admin and passenger listings? It cannot be restored. Existing reservations and redemption history are retained.'
              : confirm === 'archive'
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
