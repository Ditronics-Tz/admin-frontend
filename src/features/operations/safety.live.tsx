import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { tokenStorage, refreshStaffSession } from '@/lib/api/client'
import { API_CONFIG } from '@/lib/api/config'
import { useAuthStore } from '@/stores/useAuthStore'
import { safetyApi } from './safety.api'
export const useSafetyLive = create<{
  connection: 'live' | 'reconnecting' | 'polling'
  muted: boolean
  setMuted: (v: boolean) => void
}>((set) => ({ connection: 'polling', muted: true, setMuted: (muted) => set({ muted }) }))
export function SafetyMonitor() {
  const cache = useQueryClient(),
    user = useAuthStore((s) => s.user)
  useEffect(() => {
    if (!user) return
    const abort = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const connect = async () => {
      try {
        useSafetyLive.setState({ connection: 'reconnecting' })
        let response = await fetch(`${API_CONFIG.baseURL}/admin/sos/stream`, {
          headers: { Authorization: `Bearer ${tokenStorage.getAccessToken()}` },
          signal: abort.signal,
        })
        if (response.status === 401) {
          await refreshStaffSession()
          response = await fetch(`${API_CONFIG.baseURL}/admin/sos/stream`, {
            headers: { Authorization: `Bearer ${tokenStorage.getAccessToken()}` },
            signal: abort.signal,
          })
        }
        if (!response.ok || !response.body) throw new Error('stream unavailable')
        useSafetyLive.setState({ connection: 'live' })
        const reader = response.body.getReader(),
          decoder = new TextDecoder()
        let buffer = ''
        for (;;) {
          const { value, done } = await reader.read()
          if (done) throw new Error('stream ended')
          buffer += decoder.decode(value, { stream: true })
          let boundary: number
          while ((boundary = buffer.indexOf('\n\n')) >= 0) {
            const event = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            if (event.includes('event: sos.')) {
              void cache.invalidateQueries({ queryKey: ['operations', 'sos'] })
              if (event.includes('event: sos.created')) {
                if (
                  typeof Notification !== 'undefined' &&
                  Notification.permission === 'granted'
                )
                  new Notification('Rida SOS', {
                    body: 'An emergency alert needs attention.',
                  })
                if (!useSafetyLive.getState().muted) {
                  const audio = new AudioContext(),
                    oscillator = audio.createOscillator()
                  oscillator.connect(audio.destination)
                  oscillator.frequency.value = 880
                  oscillator.start()
                  oscillator.stop(audio.currentTime + 0.3)
                  oscillator.onended = () => void audio.close()
                }
              }
            }
          }
        }
      } catch {
        if (!abort.signal.aborted) {
          useSafetyLive.setState({ connection: 'polling' })
          timer = setTimeout(() => void connect(), 5000)
        }
      }
    }
    void connect()
    return () => {
      abort.abort()
      clearTimeout(timer)
    }
  }, [user, cache])
  return null
}
export function useOpenSOS(offset = 0) {
  const connection = useSafetyLive((s) => s.connection)
  return useQuery({
    queryKey: ['operations', 'sos', 'open', offset],
    queryFn: () => safetyApi.alerts({ status: 'open', limit: 100, offset }),
    refetchInterval: connection === 'live' ? 30000 : 5000,
  })
}
export function SOSNavBadge() {
  const q = useOpenSOS()
  return q.data?.total ? (
    <span
      aria-label={`${q.data.total} open SOS alerts`}
      className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white"
    >
      {q.data.total}
    </span>
  ) : null
}
export function AgeTimer({ created, sla = 60 }: { created: string; sla?: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const age = Math.max(0, Math.floor((now - Date.parse(created)) / 1000))
  return (
    <span className={age >= sla ? 'font-semibold text-red-700' : ''}>
      {age}s · {Math.max(0, sla - age)}s SLA
    </span>
  )
}
