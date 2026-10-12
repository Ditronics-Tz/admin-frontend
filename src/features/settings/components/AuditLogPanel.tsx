import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { staffService } from '../services/staff.service'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import { formatDateTime } from '@/lib/utils/formatters'

export function AuditLogPanel() {
  const [offset, setOffset] = useState(0)
  const limit = 25
  const query = useQuery({
    queryKey: ['admin', 'audit-logs', offset],
    queryFn: () => staffService.listAuditLogs(limit, offset),
  })
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Security audit trail</h2>
        <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
          Refresh
        </Button>
      </div>
      {query.isPending ? (
        <p>Loading audit records…</p>
      ) : query.isError ? (
        <QueryError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Time (EAT)</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action / target</th>
                  <th className="p-3">IP</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {query.data.logs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="whitespace-nowrap p-3">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="p-3 font-mono">{log.actor_id}</td>
                    <td className="p-3">
                      <p className="font-semibold">{log.action}</p>
                      <p>
                        {log.target_type}: {log.target_id}
                      </p>
                    </td>
                    <td className="p-3">{log.ip}</td>
                    <td className="max-w-sm break-all p-3">
                      <code>{log.meta}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {query.data.logs.length === 0 && <p>No audit records on this page.</p>}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <span className="text-sm">
              {query.data.total === 0 ? 0 : offset + 1}–
              {Math.min(offset + query.data.logs.length, query.data.total)} of{' '}
              {query.data.total}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= query.data.total}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
