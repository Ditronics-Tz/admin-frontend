import { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios'

// Explicit development-only fixture transport. Mutations are never acknowledged
// unless a fixture implements the operation; unknown routes remain unavailable.
const lists: Record<string, string> = {
  '/admin/users': 'users',
  '/admin/staff': 'staff',
  '/admin/audit-logs': 'logs',
  '/admin/rides': 'rides',
  '/admin/tickets': 'tickets',
  '/admin/complaints': 'complaints',
  '/admin/reports': 'reports',
  '/admin/ratings': 'ratings',
}

export const mockAdapter: AxiosAdapter = async (config) => {
  const path = (config.url || '').split('?')[0]
  const key = lists[path]
  const response = {
    config,
    headers: new AxiosHeaders({ 'X-Request-ID': 'development-fixture' }),
    status: key && config.method === 'get' ? 200 : 501,
    statusText: key ? 'Development fixture' : 'Unavailable fixture',
    data:
      key && config.method === 'get'
        ? {
            [key]: [],
            total: 0,
            limit: Number(config.params?.limit || 20),
            offset: Number(config.params?.offset || 0),
          }
        : {
            error: 'No development fixture is available for this operation.',
            request_id: 'development-fixture',
          },
  }
  if (response.status !== 200)
    throw new AxiosError(
      response.data.error,
      'ERR_BAD_RESPONSE',
      config,
      undefined,
      response
    )
  return response
}
