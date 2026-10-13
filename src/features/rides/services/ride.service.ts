import { apiClient } from '@/lib/api/client'
import type { Page } from '@/lib/api/types'
import { ApiClientError } from '@/lib/api/errors'

export interface RideParty {
  id: string
  name: string
}
export interface RidePlace {
  lat: number
  lng: number
  address: string
}
export interface RideRecord {
  id: string
  status: string
  passenger: RideParty
  driver: RideParty | null
  pickup: RidePlace
  dropoff: RidePlace
  vehicle_type: string
  estimated_fare: number
  final_fare: number | null
  created_at: string
  events: { type: string; actor_type: string; at: string; meta?: unknown }[]
}

export function rideDateBoundary(date: string, exclusiveEnd = false): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return ''
  const [year, month, day] = date.split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, day))
  if (start.toISOString().slice(0, 10) !== date) return ''
  const boundary = new Date(Date.UTC(year, month - 1, day + (exclusiveEnd ? 1 : 0)))
  return `${boundary.toISOString().slice(0, 10)}T00:00:00+03:00`
}

export const rideService = {
  async list(params: Record<string, string | number> = {}) {
    const { data } = await apiClient.get<Page<RideRecord, 'rides'>>('/admin/rides', {
      params: { limit: 20, offset: 0, ...params },
    })
    if (!Number.isFinite(data.total))
      throw new ApiClientError('Ride tracking is unavailable on this server.', {
        status: 501,
      })
    return data
  },
  async get(id: string) {
    const { data } = await apiClient.get<{ ride: RideRecord } | RideRecord>(
      `/admin/rides/${encodeURIComponent(id)}`
    )
    const ride = 'ride' in data ? data.ride : data
    if (
      !ride.passenger ||
      !ride.pickup ||
      typeof ride.pickup !== 'object' ||
      !Array.isArray(ride.events)
    )
      throw new ApiClientError('The server does not provide ride details yet.', {
        status: 501,
      })
    return ride
  },
  async cancel(id: string, reason: string) {
    await apiClient.post(`/admin/rides/${encodeURIComponent(id)}/cancel`, { reason })
  },
  async reassign(id: string, driver_id: string, reason: string) {
    await apiClient.post(`/admin/rides/${encodeURIComponent(id)}/reassign`, {
      driver_id,
      reason,
    })
  },
}
