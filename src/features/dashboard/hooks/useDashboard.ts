import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30000,
    refetchInterval: 60000, // Safe periodic background refresh
  })
}

export function useRecentRides() {
  return useQuery({
    queryKey: ['admin', 'rides'],
    queryFn: () => dashboardService.getRecentRides(),
    staleTime: 30000,
  })
}

export function useComplaints() {
  return useQuery({
    queryKey: ['admin', 'complaints'],
    queryFn: () => dashboardService.getComplaints(),
    staleTime: 60000,
  })
}

export function useTickets() {
  return useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: () => dashboardService.getTickets(),
    staleTime: 60000,
  })
}
