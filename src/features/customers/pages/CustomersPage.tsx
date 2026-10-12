import React, { useState } from 'react'
import { UserDetailsDialog } from '../components/UserDetailsDialog'
import { useQuery } from '@tanstack/react-query'
import { customerService } from '../services/customer.service'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const CustomersPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const {
    data: customers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.listCustomers(),
  })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
            Passenger Directory
          </h1>
          <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
            View registered passengers and their account details.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="h-9 gap-1.5 text-xs font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      <Card className="shadow-xs rounded-xl border border-slate-200/80 bg-white">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-[#172B36]">
              Registered Passengers ({customers?.length ?? 0})
            </CardTitle>
            <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold text-brand-primary-teal">
              Connected API
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading passenger records from backend...
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-6 w-6 text-rose-500" />
              <p className="mt-2 text-xs text-rose-600">
                {(error as Error)?.message ||
                  'Failed to load passengers from backend service.'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="mt-3 text-xs"
              >
                Retry
              </Button>
            </div>
          ) : customers && customers.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 font-semibold text-[#64748B]">
                  <tr>
                    <th className="px-3.5 py-3">Passenger Name</th>
                    <th className="px-3.5 py-3">Work / Contact Email</th>
                    <th className="px-3.5 py-3">System Role</th>
                    <th className="px-3.5 py-3 text-center">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customers.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-3.5 py-3 font-semibold text-[#172B36]">
                        <button
                          className="text-primary underline"
                          onClick={() => setSelectedId(c.id)}
                        >
                          {c.fullName}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-3 text-slate-600">
                        {c.email}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-3 font-mono text-[11px] capitalize text-slate-500">
                        {c.role}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            c.isActive
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border border-rose-200 bg-rose-50 text-rose-700'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-400" />
              <h4 className="mt-2 text-xs font-semibold text-slate-700">
                No Passengers Registered Yet
              </h4>
              <p className="mt-1 text-[11px] text-slate-500">
                When passengers register via the Rida mobile app, their profiles appear
                here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedId && (
        <UserDetailsDialog id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}

export default CustomersPage
