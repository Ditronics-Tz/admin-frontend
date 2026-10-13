import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiClientError } from '@/lib/api/errors'
import { verificationService } from './verification.service'
import type {
  Page,
  BackendUserResponse,
  BackendUserDetailResponse,
  BackendDriverProfile,
  ListParams,
} from '@/lib/api/types'
import type {
  Driver,
  DriverFilters,
  PaginatedResponse,
  VerificationRequest,
  CreateDriverInput,
  UpdateDriverInput,
} from '../types/driver.types'
import {
  mapBackendUserDetailToDriver,
  mapDriverToVerificationRequest,
} from '../adapters/driverAdapter'

export function filterDrivers(
  directory: Driver[],
  filters: DriverFilters
): PaginatedResponse<Driver> {
  const search = filters.search.trim().toLowerCase()
  const drivers = directory.filter(
    (driver) =>
      (!search ||
        [
          driver.fullName,
          driver.email,
          driver.phone,
          driver.driverCode,
          driver.vehicle.plateNumber,
        ].some((value) => value.toLowerCase().includes(search))) &&
      (!filters.accountStatus ||
        filters.accountStatus === 'all' ||
        driver.accountStatus === filters.accountStatus) &&
      (!filters.verificationStatus ||
        filters.verificationStatus === 'all' ||
        driver.verificationStatus === filters.verificationStatus) &&
      (!filters.vehicleType ||
        filters.vehicleType === 'all' ||
        driver.vehicle.type === filters.vehicleType)
  )
  if (filters.sortBy) {
    const key = filters.sortBy
    const direction = filters.sortOrder === 'desc' ? -1 : 1
    drivers.sort(
      (a, b) =>
        direction *
        String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, {
          numeric: true,
        })
    )
  }
  const pageSize = Math.max(1, filters.pageSize || 10)
  const totalPages = Math.max(1, Math.ceil(drivers.length / pageSize))
  const page = Math.min(Math.max(1, filters.page || 1), totalPages)
  return {
    items: drivers.slice((page - 1) * pageSize, page * pageSize),
    total: drivers.length,
    page,
    pageSize,
    totalPages,
  }
}

function unsupported(action: string): never {
  throw new ApiClientError(
    `${action} is not available. This action is not supported by the current server.`,
    { status: 501, code: 'NOT_IMPLEMENTED' }
  )
}

export const driverService = {
  async listDrivers(filters: DriverFilters): Promise<PaginatedResponse<Driver>> {
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 10))
    const page = Math.max(1, filters.page || 1)
    const { data } = await apiClient.get<Page<BackendUserResponse, 'users'>>(
      API_ENDPOINTS.ADMIN.USERS,
      {
        params: {
          role: 'driver',
          limit: pageSize,
          offset: (page - 1) * pageSize,
          q: filters.search.trim(),
          status: filters.accountStatus === 'all' ? '' : filters.accountStatus,
          verification_status:
            filters.verificationStatus === 'all' ? '' : filters.verificationStatus,
          sort_by: filters.sortBy || '',
          sort_order: filters.sortOrder || '',
        },
      }
    )
    const users = data.users || []
    const drivers: Driver[] = new Array(users.length)
    let next = 0
    // Hydrate only the returned page, with bounded concurrency.
    await Promise.all(
      Array.from({ length: Math.min(6, users.length) }, async () => {
        while (next < users.length) {
          const index = next++
          drivers[index] = await driverService.getDriver(users[index].id)
        }
      })
    )
    return {
      items: drivers,
      total: data.total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(data.total / pageSize)),
    }
  },
  async stats() {
    const count = async (params: Record<string, string> = {}) =>
      (
        await apiClient.get<Page<BackendUserResponse, 'users'>>(
          API_ENDPOINTS.ADMIN.USERS,
          { params: { role: 'driver', limit: 1, offset: 0, ...params } }
        )
      ).data.total
    const [totalDrivers, activeDrivers, submitted, underReview, deactivatedDrivers] =
      await Promise.all([
        count(),
        count({ status: 'active' }),
        count({ verification_status: 'submitted' }),
        count({ verification_status: 'under_review' }),
        count({ status: 'inactive' }),
      ])
    return {
      totalDrivers,
      activeDrivers,
      pendingVerification: submitted + underReview,
      deactivatedDrivers,
    }
  },
  async getDriver(driverId: string): Promise<Driver> {
    const { data } = await apiClient.get<BackendUserDetailResponse>(
      API_ENDPOINTS.ADMIN.USER_DETAILS(driverId)
    )
    if (data.user.role !== 'driver')
      throw new ApiClientError('This account is no longer a driver.', { status: 404 })
    return mapBackendUserDetailToDriver(data)
  },
  async listVerificationRequests(): Promise<VerificationRequest[]> {
    const { data } = await apiClient.get<{ verifications: BackendDriverProfile[] }>(
      '/admin/verifications'
    )
    const queue = data.verifications || []
    const results: VerificationRequest[] = new Array(queue.length)
    let next = 0
    await Promise.all(
      Array.from({ length: Math.min(6, queue.length) }, async () => {
        while (next < queue.length) {
          const index = next++
          results[index] = mapDriverToVerificationRequest(
            await driverService.getDriver(queue[index].user_id)
          )
        }
      })
    )
    return results
  },
  async listVerificationPage(params: ListParams & { expiring_soon?: boolean } = {}) {
    const { data } = await apiClient.get<Page<BackendDriverProfile, 'verifications'>>(
      '/admin/verifications',
      { params: { limit: 20, offset: 0, ...params } }
    )
    if (!Number.isFinite(data.total))
      throw new ApiClientError(
        'Paginated verification filters are unavailable on this server.',
        { status: 501 }
      )
    const queue = data.verifications || [],
      items: VerificationRequest[] = new Array(queue.length)
    let next = 0
    await Promise.all(
      Array.from({ length: Math.min(6, queue.length) }, async () => {
        while (next < queue.length) {
          const index = next++
          items[index] = mapDriverToVerificationRequest(
            await driverService.getDriver(queue[index].user_id)
          )
        }
      })
    )
    return { ...data, items }
  },
  async updateUserRole(
    userId: string,
    role: 'driver' | 'passenger'
  ): Promise<{ message: string }> {
    const { data } = await apiClient.patch<{ message: string }>(
      API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId),
      { role }
    )
    return data
  },
  async createDriver(_data: CreateDriverInput): Promise<Driver> {
    return unsupported('Staff registration of drivers')
  },
  async updateDriver(_id: string, _data: UpdateDriverInput): Promise<Driver> {
    return unsupported('Staff editing of driver profiles')
  },
  async suspendDriver(_id: string, _reason: string, _notes?: string): Promise<Driver> {
    await verificationService.suspend(
      _id,
      true,
      [_reason, _notes].filter(Boolean).join(': ')
    )
    return driverService.getDriver(_id)
  },
  async reactivateDriver(_id: string, reason: string): Promise<Driver> {
    await verificationService.suspend(_id, false, reason)
    return driverService.getDriver(_id)
  },
}
