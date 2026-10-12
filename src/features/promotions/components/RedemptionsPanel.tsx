import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QueryError } from '@/components/feedback/QueryError'
import { promoService } from '../promo.service'
import { usePromoText } from '../i18n'
import { money } from '../utils'
import type { Redemption } from '../types'
import {
  DateLabel,
  Empty,
  Pagination,
  PromoSkeleton,
  ResponsiveTable,
  StatusBadge,
  UserLabel,
} from './shared'

export function RedemptionTable({
  rows,
  showPassenger = true,
}: {
  rows: Redemption[]
  showPassenger?: boolean
}) {
  const t = usePromoText()
  return rows.length === 0 ? (
    <Empty />
  ) : (
    <ResponsiveTable
      label={t('Redemptions')}
      columns={[
        ...(showPassenger ? ['Passenger'] : []),
        'Ride ID',
        'Discount',
        'Status',
        'Date',
      ].map((s) => t(s))}
      rows={rows.map((r) => ({
        id: r.id,
        cells: [
          ...(showPassenger ? [<UserLabel id={r.user_id} />] : []),
          <span className="break-all text-xs">{r.ride_id || '—'}</span>,
          money(r.discount_amount),
          <StatusBadge status={r.status} />,
          <DateLabel value={r.created_at} relative />,
        ],
      }))}
    />
  )
}
export function RedemptionsPanel({ id }: { id: string }) {
  const [offset, setOffset] = useState(0)
  const list = useQuery({
    queryKey: ['promotions', 'redemptions', id, offset],
    queryFn: () => promoService.redemptions(id, 20, offset),
  })
  return list.isPending ? (
    <PromoSkeleton />
  ) : list.isError ? (
    <QueryError error={list.error} retry={() => void list.refetch()} />
  ) : (
    <>
      <RedemptionTable rows={list.data.redemptions} />
      <Pagination offset={offset} total={list.data.total} onChange={setOffset} />
    </>
  )
}
