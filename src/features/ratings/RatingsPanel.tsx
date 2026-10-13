import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ratingService, type RatingRecord } from './rating.service'
import { DataTable, FilterBar } from '@/components/common/DataTable'
import { ReasonDialog, StatusBadge } from '@/components/common/ReasonDialog'
import { Button } from '@/components/ui/button'
import { Select } from '@/features/operations/shared'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'
import { formatApiError } from '@/lib/api/errors'

export function RatingsPanel({ userId }: { userId?: string }) {
  const t = useShipText(),
    cache = useQueryClient(),
    { canWrite } = usePermission()
  const [offset, setOffset] = useState(0),
    [q, setQ] = useState(''),
    [low, setLow] = useState(false),
    [hidden, setHidden] = useState('')
  const [target, setTarget] = useState<RatingRecord | null>(null)
  const params = {
    q,
    hidden,
    offset,
    limit: 20,
    ...(userId ? { user: userId } : {}),
    ...(low ? { max_score: 2 } : {}),
  }
  const query = useQuery({
    queryKey: ['ratings', params],
    queryFn: () => ratingService.list(params),
    retry: false,
  })
  const mutation = useMutation({
    mutationFn: (reason: string) =>
      ratingService.moderate(target!.id, !target!.hidden, reason),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ['ratings'] })
      setTarget(null)
      toast.success(t('Rating moderation recorded'))
    },
    onError: (error) => toast.error(error.message),
  })
  const unavailable =
    query.isError && [404, 501].includes(formatApiError(query.error).status || 0)
  return (
    <section className="space-y-4 rounded-xl border bg-white p-4">
      <FilterBar
        q={q}
        onSearch={(value) => {
          setQ(value)
          setOffset(0)
        }}
      >
        <Button
          variant={low ? 'default' : 'outline'}
          aria-pressed={low}
          onClick={() => {
            setLow((value) => !value)
            setOffset(0)
          }}
        >
          {t('Low scores (1–2)')}
        </Button>
        <Select
          label={t('Visibility')}
          value={hidden}
          options={['', 'false', 'true']}
          onChange={(value) => {
            setHidden(value)
            setOffset(0)
          }}
        />
      </FilterBar>
      {unavailable && (
        <aside role="status" className="rounded-lg border bg-amber-50 p-3 text-sm">
          {t('Ratings moderation is unavailable on this server.')}
        </aside>
      )}
      <DataTable
        label={t('Ratings')}
        columns={[
          'Score',
          'Comment',
          'Ride',
          'From user',
          'To user',
          'Visibility',
          'Created',
          'Actions',
        ].map(t)}
        loading={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
        rows={(query.data?.ratings || []).map((rating) => ({
          id: rating.id,
          cells: [
            rating.score,
            <span className="whitespace-pre-wrap">{rating.comment}</span>,
            <Link
              className="text-primary underline"
              to={`/rides/${encodeURIComponent(rating.ride_id)}`}
            >
              {rating.ride_id}
            </Link>,
            rating.from_user_id,
            rating.to_user_id,
            <StatusBadge status={rating.hidden ? 'hidden' : 'visible'} />,
            formatDateTime(rating.created_at),
            <Button
              size="sm"
              variant="outline"
              disabled={!canWrite || mutation.isPending}
              onClick={() => {
                mutation.reset()
                setTarget(rating)
              }}
            >
              {t(rating.hidden ? 'Restore rating' : 'Hide rating')}
            </Button>,
          ],
        }))}
        total={query.data?.total || 0}
        offset={offset}
        onPage={setOffset}
      />
      {target && (
        <ReasonDialog
          title={t(target.hidden ? 'Restore rating' : 'Hide rating')}
          pending={mutation.isPending}
          error={mutation.error}
          canConfirm={canWrite}
          onClose={() => setTarget(null)}
          onConfirm={(reason) => {
            if (canWrite) mutation.mutate(reason)
          }}
        >
          <p className="whitespace-pre-wrap text-sm">
            {target.score} / 5 · {target.comment}
          </p>
        </ReasonDialog>
      )}
    </section>
  )
}
