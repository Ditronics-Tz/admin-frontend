import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/feedback/QueryError'
import {
  PromoSkeleton,
  Empty,
  ResponsiveTable,
  Pagination,
} from '@/features/promotions/components/shared'
import { useShipText } from './ship-text'

export function FilterBar({
  q,
  onSearch,
  children,
}: {
  q: string
  onSearch: (q: string) => void
  children?: ReactNode
}) {
  const t = useShipText()
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm">
        {t('Search')}
        <Input value={q} onChange={(event) => onSearch(event.target.value)} />
      </label>
      {children}
    </div>
  )
}

export function DataTable({
  label,
  columns,
  rows,
  total,
  limit = 20,
  offset,
  onPage,
  loading,
  error,
  retry,
}: {
  label: string
  columns: string[]
  rows: { id: string; cells: ReactNode[] }[]
  total: number
  limit?: number
  offset: number
  onPage: (offset: number) => void
  loading?: boolean
  error?: unknown
  retry?: () => void
}) {
  const t = useShipText()
  if (loading) return <PromoSkeleton />
  if (error) return <QueryError error={error} retry={retry} />
  return (
    <>
      <div className="overflow-x-auto">
        {rows.length ? (
          <ResponsiveTable label={label} columns={columns} rows={rows} />
        ) : (
          <Empty message={t('No records found')} />
        )}
      </div>
      <Pagination total={total} limit={limit} offset={offset} onChange={onPage} />
    </>
  )
}
