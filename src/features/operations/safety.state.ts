import { create } from 'zustand'
import { useQuery } from '@tanstack/react-query'
import { safetyApi } from './safety.api'

export const useSafetyLive = create<{
  connection: 'live' | 'reconnecting' | 'polling'
  muted: boolean
  setMuted: (v: boolean) => void
}>((set) => ({ connection: 'polling', muted: true, setMuted: (muted) => set({ muted }) }))

export function useOpenSOS(offset = 0) {
  const connection = useSafetyLive((s) => s.connection)
  return useQuery({
    queryKey: ['operations', 'sos', 'open', offset],
    queryFn: () => safetyApi.alerts({ status: 'open', limit: 100, offset }),
    refetchInterval: connection === 'live' ? 30000 : 5000,
  })
}
