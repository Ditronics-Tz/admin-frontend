import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QueryError } from '@/components/feedback/QueryError'
import { promoService } from '../promo.service'
import { usePromoText } from '../i18n'
import { usePromoWriteAccess } from '../access'
import type { AudienceInput, AudienceResult } from '../types'
import { AudiencePicker, AudienceReport } from './AudiencePicker'
import { DateLabel, Empty, Pagination, PromoSkeleton, ResponsiveTable } from './shared'
import { useDebounced } from '../hooks'

export function AudiencePanel({ id }: { id: string }) {
  const t = usePromoText(),
    write = usePromoWriteAccess(),
    cache = useQueryClient()
  const [q, setQ] = useState(''),
    [offset, setOffset] = useState(0),
    [picker, setPicker] = useState(false),
    [report, setReport] = useState<AudienceResult | null>(null)
  const search = useDebounced(q)
  const list = useQuery({
    queryKey: ['promotions', 'audience', id, search, offset],
    queryFn: () => promoService.audience(id, search, 20, offset),
  })
  const mutation = useMutation({
    mutationFn: (input: AudienceInput) => promoService.addAudience(id, input),
    onSuccess: async (result) => {
      setReport(result)
      setPicker(false)
      await cache.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('Audience updated'))
    },
  })
  const remove = useMutation({
    mutationFn: (user: string) => promoService.removeAudience(id, user),
    onSuccess: async () => {
      setOffset(0)
      await cache.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('Audience updated'))
    },
  })
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <Label htmlFor={`audience-${id}`}>{t('Search audience')}</Label>
          <Input
            id={`audience-${id}`}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setOffset(0)
            }}
          />
        </div>
        {write && (
          <Button
            onClick={() => {
              mutation.reset()
              setPicker(true)
            }}
          >
            {t('Add audience')}
          </Button>
        )}
      </div>
      {report && <AudienceReport result={report} />}
      {remove.isError && <QueryError error={remove.error} />}
      {!write && mutation.isError && <QueryError error={mutation.error} />}
      {list.isPending ? (
        <PromoSkeleton />
      ) : list.isError ? (
        <QueryError error={list.error} retry={() => void list.refetch()} />
      ) : (
        <>
          <p className="text-sm font-medium">
            {t('Selected ({count})', { count: list.data.total })}
          </p>
          {list.data.audience.length === 0 ? (
            <Empty message="No passengers found" />
          ) : (
            <ResponsiveTable
              label={t('Audience')}
              columns={['Passenger', 'Phone / email', 'Added', 'Notified', 'Actions'].map(
                (s) => t(s)
              )}
              rows={list.data.audience.map((a) => ({
                id: a.user_id,
                cells: [
                  a.user.name,
                  a.user.phone || a.user.email,
                  <DateLabel value={a.granted_at} />,
                  a.notified_at ? <DateLabel value={a.notified_at} /> : t('Not notified'),
                  write ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={remove.isPending}
                      aria-label={t('Remove {name}', { name: a.user.name })}
                      onClick={() => {
                        if (write) remove.mutate(a.user_id)
                      }}
                    >
                      {t('Remove')}
                    </Button>
                  ) : (
                    '—'
                  ),
                ],
              }))}
            />
          )}
          <Pagination offset={offset} total={list.data.total} onChange={setOffset} />
        </>
      )}
      {picker && write && (
        <AudiencePicker
          onClose={() => setPicker(false)}
          pending={mutation.isPending}
          error={mutation.error}
          onApply={(input) => {
            if (write) mutation.mutate(input)
          }}
        />
      )}
    </section>
  )
}
