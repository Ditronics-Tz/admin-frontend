import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { driverService, filterDrivers } from '../services/driver.service'
import { mapDriverToVerificationRequest } from '../adapters/driverAdapter'
import type {
  DriverFilters,
  CreateDriverInput,
  UpdateDriverInput,
} from '../types/driver.types'
import { toast } from 'sonner'

export function useDrivers(filters: DriverFilters) {
  return useQuery({
    queryKey: ['drivers', 'directory'],
    queryFn: () => driverService.getDirectory(),
    select: (drivers) => filterDrivers(drivers, filters),
    staleTime: 30000,
  })
}

export function useDriverStats() {
  return useQuery({
    queryKey: ['drivers', 'directory'],
    queryFn: () => driverService.getDirectory(),
    staleTime: 30000,
    select: (drivers) => ({
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter((driver) => driver.accountStatus === 'active').length,
      pendingVerification: drivers.filter(
        (driver) => driver.verificationStatus === 'pending'
      ).length,
      deactivatedDrivers: drivers.filter(
        (driver) => driver.accountStatus === 'deactivated'
      ).length,
    }),
  })
}

export function useDriver(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver', driverId],
    queryFn: () => {
      if (!driverId) throw new Error('Driver ID is required')
      return driverService.getDriver(driverId)
    },
    enabled: Boolean(driverId),
  })
}

export function useVerificationRequests() {
  return useQuery({
    queryKey: ['drivers', 'directory'],
    queryFn: () => driverService.getDirectory(),
    select: (drivers) =>
      drivers
        .filter((driver) => driver.verificationStatus === 'pending')
        .map(mapDriverToVerificationRequest),
    staleTime: 30000,
  })
}

export function useSuspendDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      driverId,
      reason,
      notes,
    }: {
      driverId: string
      reason: string
      notes?: string
    }) => driverService.suspendDriver(driverId, reason, notes),
    onSuccess: (driver) => {
      toast.success(`Driver account ${driver.driverCode} suspended successfully`)
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to suspend driver account')
    },
  })
}

export function useReactivateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (driverId: string) => driverService.reactivateDriver(driverId),
    onSuccess: (driver) => {
      toast.success(`Driver account ${driver.driverCode} reactivated successfully`)
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to reactivate driver account')
    },
  })
}

export function useApproveVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (driverId: string) => driverService.approveVerification(driverId),
    onSuccess: (driver) => {
      toast.success(
        `Verification approved for driver ${driver.fullName} (${driver.driverCode})`
      )
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] })
      queryClient.invalidateQueries({ queryKey: ['drivers', 'verifications'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to approve driver verification')
    },
  })
}

export function useRejectVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      driverId,
      reason,
      notes,
    }: {
      driverId: string
      reason: string
      notes: string
    }) => driverService.rejectVerification(driverId, reason, notes),
    onSuccess: (driver) => {
      toast.warning(
        `Verification rejected for driver ${driver.fullName} (${driver.driverCode})`
      )
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] })
      queryClient.invalidateQueries({ queryKey: ['drivers', 'verifications'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to reject driver verification')
    },
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDriverInput) => driverService.createDriver(data),
    onSuccess: (driver) => {
      toast.success(`Driver ${driver.fullName} registered successfully`)
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to register driver')
    },
  })
}

export function useUpdateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ driverId, data }: { driverId: string; data: UpdateDriverInput }) =>
      driverService.updateDriver(driverId, data),
    onSuccess: (driver) => {
      toast.success(`Driver ${driver.fullName} updated successfully`)
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['driver', driver.id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update driver details')
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'driver' | 'passenger' }) =>
      driverService.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated successfully')
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update user role')
    },
  })
}
