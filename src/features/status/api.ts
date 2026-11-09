import { useQuery } from '@tanstack/react-query'
import { API_CONFIG } from '@/lib/api/config'
import type { StatusReport } from './types'

export function apiStatusURL() {
  const base = API_CONFIG.baseURL
  if (!base.startsWith('http')) return ''
  return `${base.replace(/\/api\/v1\/?$/, '')}/status`
}

export async function loadStatus(): Promise<StatusReport> {
  const response = await fetch(`${API_CONFIG.baseURL.replace(/\/$/, '')}/status`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Status is unavailable')
  const body = (await response.json()) as StatusReport
  if (!body || !Array.isArray(body.components)) throw new Error('Status is unavailable')
  return body
}

export function useStatusReport() {
  return useQuery({
    queryKey: ['public-status'],
    queryFn: loadStatus,
    refetchInterval: 30_000,
    retry: false,
  })
}
