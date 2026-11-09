export type StatusState = 'operational' | 'degraded' | 'outage' | 'maintenance' | 'none'

export interface StatusDay {
  date: string
  state: StatusState
}

export interface StatusLatency {
  at: string
  ms: number
}

export interface StatusComponent {
  id: string
  name: string
  description: string
  group: string
  state: StatusState
  summary: string
  uptime_percent: number | null
  latency_ms: number
  latency_label: string
  days: StatusDay[]
  latency: StatusLatency[]
}

export interface StatusLog {
  at: string
  component_id: string
  component: string
  state: string
  summary: string
  latency_ms: number
}

export interface StatusReport {
  generated_at: string
  overall: 'operational' | 'degraded' | 'outage'
  summary: string
  version: string
  uptime_seconds: number
  range_days: number
  components: StatusComponent[]
  logs: StatusLog[]
}
