import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type {
  Driver,
  DriverStatistics,
  DriverFilters,
  PaginatedResponse,
  VerificationRequest,
  CreateDriverInput,
  UpdateDriverInput,
} from '../types/driver.types'

/**
 * Isolated Development Mock Dataset
 * Clearly marked demonstration fixtures for Tanzania ride-hailing operations
 */
let MOCK_DRIVERS: Driver[] = [
  {
    id: 'drv-001',
    driverCode: 'DRV-TZ-1082',
    fullName: 'Juma Hassan Rashidi',
    email: 'juma.rashidi@example.com',
    phone: '+255 754 882 109',
    city: 'Dar es Salaam',
    district: 'Kinondoni',
    accountStatus: 'active',
    verificationStatus: 'approved',
    availabilityStatus: 'online',
    vehicle: {
      id: 'veh-001',
      type: 'bajaji',
      make: 'Bajaj',
      model: 'RE Maxima 200',
      year: 2022,
      plateNumber: 'T 412 DKM',
      color: 'Yellow',
      inspectionStatus: 'passed',
      inspectionExpiry: '2026-11-15T00:00:00Z',
    },
    rating: 4.86,
    ratingCount: 312,
    totalTrips: 1420,
    totalEarningsTZS: 8640000,
    acceptanceRate: 94,
    cancellationRate: 2.1,
    joinedAt: '2025-02-10T09:30:00Z',
    documents: [
      {
        id: 'doc-001-dl',
        type: 'driving_license',
        title: 'Tanzania Driving License',
        documentNumber: 'DL-TZ-8849201',
        status: 'approved',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2025-02-08T11:00:00Z',
        expiryDate: '2027-02-08T00:00:00Z',
      },
      {
        id: 'doc-001-nida',
        type: 'national_id',
        title: 'NIDA National ID',
        documentNumber: '19890412-21102-00001-29',
        status: 'approved',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2025-02-08T11:05:00Z',
      },
      {
        id: 'doc-001-latra',
        type: 'latra_permit',
        title: 'LATRA Commercial Carrier Permit',
        documentNumber: 'LATRA-DSM-2025-4491',
        status: 'approved',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2025-02-09T08:30:00Z',
        expiryDate: '2026-06-30T00:00:00Z',
      },
    ],
  },
  {
    id: 'drv-002',
    driverCode: 'DRV-TZ-1083',
    fullName: 'Baraka Emmanuel Mwamba',
    email: 'baraka.mwamba@example.com',
    phone: '+255 784 319 402',
    city: 'Dar es Salaam',
    district: 'Ilala',
    accountStatus: 'active',
    verificationStatus: 'approved',
    availabilityStatus: 'on_trip',
    vehicle: {
      id: 'veh-002',
      type: 'car',
      make: 'Toyota',
      model: 'Vitz F-Edition',
      year: 2018,
      plateNumber: 'T 723 EAZ',
      color: 'Silver',
      inspectionStatus: 'passed',
      inspectionExpiry: '2026-10-20T00:00:00Z',
    },
    rating: 4.92,
    ratingCount: 540,
    totalTrips: 2180,
    totalEarningsTZS: 14950000,
    acceptanceRate: 98,
    cancellationRate: 1.2,
    joinedAt: '2024-11-14T14:15:00Z',
    documents: [
      {
        id: 'doc-002-dl',
        type: 'driving_license',
        title: 'Tanzania Driving License (Class C)',
        documentNumber: 'DL-TZ-7104822',
        status: 'approved',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2024-11-12T10:00:00Z',
        expiryDate: '2026-11-12T00:00:00Z',
      },
    ],
  },
  {
    id: 'drv-003',
    driverCode: 'DRV-TZ-1084',
    fullName: 'Athumani Salim Mrema',
    email: 'athumani.mrema@example.com',
    phone: '+255 655 902 441',
    city: 'Dar es Salaam',
    district: 'Ubungo',
    accountStatus: 'active',
    verificationStatus: 'pending',
    availabilityStatus: 'offline',
    vehicle: {
      id: 'veh-003',
      type: 'motorcycle',
      make: 'Boxer',
      model: 'BM 150',
      year: 2021,
      plateNumber: 'MC 519 CCJ',
      color: 'Red',
      inspectionStatus: 'pending',
    },
    rating: null,
    ratingCount: 0,
    totalTrips: 0,
    totalEarningsTZS: 0,
    acceptanceRate: 100,
    cancellationRate: 0,
    joinedAt: '2026-10-08T16:20:00Z',
    documents: [
      {
        id: 'doc-003-dl',
        type: 'driving_license',
        title: 'Tanzania Driving License (Class A)',
        documentNumber: 'DL-TZ-9921004',
        status: 'pending',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2026-10-08T16:25:00Z',
        expiryDate: '2027-08-01T00:00:00Z',
      },
      {
        id: 'doc-003-nida',
        type: 'national_id',
        title: 'NIDA Card',
        documentNumber: '19950821-11204-00002-14',
        status: 'pending',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2026-10-08T16:26:00Z',
      },
    ],
  },
  {
    id: 'drv-004',
    driverCode: 'DRV-TZ-1085',
    fullName: 'Neema John Kiwanga',
    email: 'neema.kiwanga@example.com',
    phone: '+255 767 114 839',
    city: 'Dar es Salaam',
    district: 'Temeke',
    accountStatus: 'suspended',
    verificationStatus: 'approved',
    availabilityStatus: 'unavailable',
    vehicle: {
      id: 'veh-004',
      type: 'car',
      make: 'Toyota',
      model: 'Passo',
      year: 2017,
      plateNumber: 'T 119 DBW',
      color: 'White',
      inspectionStatus: 'passed',
    },
    rating: 3.42,
    ratingCount: 88,
    totalTrips: 340,
    totalEarningsTZS: 2210000,
    acceptanceRate: 72,
    cancellationRate: 14.5,
    joinedAt: '2025-06-18T11:45:00Z',
    suspensionReason: 'Customer complaints regarding reckless driving',
    suspensionNotes:
      'Account suspended following multiple safety incidents reported along Nelson Mandela Expressway. Under operations review.',
    suspendedAt: '2026-10-01T08:15:00Z',
    documents: [],
  },
  {
    id: 'drv-005',
    driverCode: 'DRV-TZ-1086',
    fullName: 'Hamisi Bakari Kipande',
    email: 'hamisi.kipande@example.com',
    phone: '+255 713 550 219',
    city: 'Dar es Salaam',
    district: 'Kinondoni',
    accountStatus: 'active',
    verificationStatus: 'pending',
    availabilityStatus: 'offline',
    vehicle: {
      id: 'veh-005',
      type: 'bajaji',
      make: 'TVS',
      model: 'King Deluxe',
      year: 2023,
      plateNumber: 'T 904 EBK',
      color: 'Blue',
      inspectionStatus: 'pending',
    },
    rating: null,
    ratingCount: 0,
    totalTrips: 0,
    totalEarningsTZS: 0,
    acceptanceRate: 100,
    cancellationRate: 0,
    joinedAt: '2026-10-09T10:00:00Z',
    documents: [
      {
        id: 'doc-005-dl',
        type: 'driving_license',
        title: 'Tanzania Driving License',
        documentNumber: 'DL-TZ-4401928',
        status: 'pending',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2026-10-09T10:05:00Z',
        expiryDate: '2027-10-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'drv-006',
    driverCode: 'DRV-TZ-1087',
    fullName: 'Kelvin Josephat Mushi',
    email: 'kelvin.mushi@example.com',
    phone: '+255 759 402 118',
    city: 'Dar es Salaam',
    district: 'Kigamboni',
    accountStatus: 'active',
    verificationStatus: 'rejected',
    availabilityStatus: 'unavailable',
    vehicle: {
      id: 'veh-006',
      type: 'motorcycle',
      make: 'Honda',
      model: 'Ace 125',
      year: 2019,
      plateNumber: 'MC 208 BKT',
      color: 'Black',
      inspectionStatus: 'failed',
    },
    rating: null,
    ratingCount: 0,
    totalTrips: 0,
    totalEarningsTZS: 0,
    acceptanceRate: 100,
    cancellationRate: 0,
    joinedAt: '2026-09-22T08:00:00Z',
    documents: [
      {
        id: 'doc-006-dl',
        type: 'driving_license',
        title: 'Tanzania Driving License',
        documentNumber: 'DL-TZ-1192837',
        status: 'rejected',
        fileUrl: '/brand/rida-logo-transparent.png',
        submissionDate: '2026-09-22T08:10:00Z',
        rejectionReason: 'Expired document and blurred photo page',
      },
    ],
  },
  {
    id: 'drv-007',
    driverCode: 'DRV-TZ-1088',
    fullName: 'Saidi Omari Mwinyi',
    email: 'saidi.mwinyi@example.com',
    phone: '+255 788 642 901',
    city: 'Dar es Salaam',
    district: 'Ilala',
    accountStatus: 'active',
    verificationStatus: 'approved',
    availabilityStatus: 'online',
    vehicle: {
      id: 'veh-007',
      type: 'car',
      make: 'Toyota',
      model: 'Spacio',
      year: 2016,
      plateNumber: 'T 633 DPY',
      color: 'Gold',
      inspectionStatus: 'passed',
    },
    rating: 4.78,
    ratingCount: 210,
    totalTrips: 890,
    totalEarningsTZS: 6230000,
    acceptanceRate: 91,
    cancellationRate: 3.5,
    joinedAt: '2025-04-05T13:20:00Z',
    documents: [],
  },
]

export const driverService = {
  /**
   * Fetch paginated drivers with filtering and sorting
   */
  async listDrivers(filters: DriverFilters): Promise<PaginatedResponse<Driver>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Driver>>(
        API_ENDPOINTS.DRIVERS.LIST,
        { params: filters }
      )
      return response.data
    } catch {
      // Development mock adapter fallback
      let list = [...MOCK_DRIVERS]

      if (filters.search) {
        const q = filters.search.toLowerCase()
        list = list.filter(
          (d) =>
            d.fullName.toLowerCase().includes(q) ||
            d.email.toLowerCase().includes(q) ||
            d.phone.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
            d.driverCode.toLowerCase().includes(q) ||
            d.vehicle.plateNumber.toLowerCase().includes(q)
        )
      }

      if (filters.accountStatus && filters.accountStatus !== 'all') {
        list = list.filter((d) => d.accountStatus === filters.accountStatus)
      }

      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        list = list.filter(
          (d) => d.verificationStatus === filters.verificationStatus
        )
      }

      if (filters.vehicleType && filters.vehicleType !== 'all') {
        list = list.filter((d) => d.vehicle.type === filters.vehicleType)
      }

      const total = list.length
      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const start = (page - 1) * pageSize
      const items = list.slice(start, start + pageSize)
      const totalPages = Math.ceil(total / pageSize) || 1

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
      }
    }
  },

  /**
   * Fetch aggregated statistics for driver operations
   */
  async getDriverStatistics(): Promise<DriverStatistics> {
    try {
      const response = await apiClient.get<DriverStatistics>(
        API_ENDPOINTS.DRIVERS.STATS
      )
      return response.data
    } catch {
      // Calculate from in-memory fixture
      const totalDrivers = MOCK_DRIVERS.length
      const activeDrivers = MOCK_DRIVERS.filter(
        (d) => d.accountStatus === 'active'
      ).length
      const pendingVerification = MOCK_DRIVERS.filter(
        (d) => d.verificationStatus === 'pending'
      ).length
      const suspendedDrivers = MOCK_DRIVERS.filter(
        (d) => d.accountStatus === 'suspended'
      ).length

      return {
        totalDrivers,
        activeDrivers,
        pendingVerification,
        suspendedDrivers,
      }
    }
  },

  /**
   * Fetch single driver by ID
   */
  async getDriver(driverId: string): Promise<Driver> {
    try {
      const response = await apiClient.get<Driver>(
        API_ENDPOINTS.DRIVERS.DETAILS(driverId)
      )
      return response.data
    } catch {
      const found = MOCK_DRIVERS.find((d) => d.id === driverId)
      if (!found) {
        throw new Error(`Driver with ID "${driverId}" not found.`)
      }
      return found
    }
  },

  /**
   * Create new driver account
   */
  async createDriver(data: CreateDriverInput): Promise<Driver> {
    try {
      const response = await apiClient.post<Driver>(
        API_ENDPOINTS.DRIVERS.CREATE,
        data
      )
      return response.data
    } catch {
      const newDriver: Driver = {
        id: `drv-${Date.now()}`,
        driverCode: `DRV-TZ-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        district: data.district || 'Dar es Salaam',
        accountStatus: 'active',
        verificationStatus: 'not_submitted',
        availabilityStatus: 'offline',
        vehicle: {
          id: `veh-${Date.now()}`,
          type: data.vehicleType,
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: data.vehicleYear,
          plateNumber: data.vehiclePlateNumber,
          color: data.vehicleColor,
          inspectionStatus: 'pending',
        },
        rating: null,
        ratingCount: 0,
        totalTrips: 0,
        totalEarningsTZS: 0,
        acceptanceRate: 100,
        cancellationRate: 0,
        joinedAt: new Date().toISOString(),
        documents: [],
      }

      MOCK_DRIVERS = [newDriver, ...MOCK_DRIVERS]
      return newDriver
    }
  },

  /**
   * Update existing driver details
   */
  async updateDriver(driverId: string, data: UpdateDriverInput): Promise<Driver> {
    try {
      const response = await apiClient.put<Driver>(
        API_ENDPOINTS.DRIVERS.UPDATE(driverId),
        data
      )
      return response.data
    } catch {
      const index = MOCK_DRIVERS.findIndex((d) => d.id === driverId)
      if (index === -1) {
        throw new Error(`Driver with ID "${driverId}" not found.`)
      }

      const existing = MOCK_DRIVERS[index]
      const updated: Driver = {
        ...existing,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        district: data.district,
        vehicle: {
          ...existing.vehicle,
          type: data.vehicleType,
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: data.vehicleYear,
          plateNumber: data.vehiclePlateNumber,
          color: data.vehicleColor,
        },
      }

      MOCK_DRIVERS[index] = updated
      return updated
    }
  },

  /**
   * Suspend driver account with reason and audit notes
   */
  async suspendDriver(
    driverId: string,
    reason: string,
    notes?: string
  ): Promise<Driver> {
    try {
      const response = await apiClient.post<Driver>(
        API_ENDPOINTS.DRIVERS.SUSPEND(driverId),
        { reason, notes }
      )
      return response.data
    } catch {
      const index = MOCK_DRIVERS.findIndex((d) => d.id === driverId)
      if (index === -1) {
        throw new Error(`Driver with ID "${driverId}" not found.`)
      }

      const updated: Driver = {
        ...MOCK_DRIVERS[index],
        accountStatus: 'suspended',
        availabilityStatus: 'unavailable',
        suspensionReason: reason,
        suspensionNotes: notes,
        suspendedAt: new Date().toISOString(),
      }

      MOCK_DRIVERS[index] = updated
      return updated
    }
  },

  /**
   * Reactivate suspended driver account
   */
  async reactivateDriver(driverId: string): Promise<Driver> {
    try {
      const response = await apiClient.post<Driver>(
        API_ENDPOINTS.DRIVERS.REACTIVATE(driverId)
      )
      return response.data
    } catch {
      const index = MOCK_DRIVERS.findIndex((d) => d.id === driverId)
      if (index === -1) {
        throw new Error(`Driver with ID "${driverId}" not found.`)
      }

      const driver = MOCK_DRIVERS[index]
      const updated: Driver = {
        ...driver,
        accountStatus: 'active',
        // If verification is approved, driver can go offline/online; otherwise stays unavailable
        availabilityStatus:
          driver.verificationStatus === 'approved' ? 'offline' : 'unavailable',
        suspensionReason: undefined,
        suspensionNotes: undefined,
        suspendedAt: undefined,
      }

      MOCK_DRIVERS[index] = updated
      return updated
    }
  },

  /**
   * List pending verification requests
   */
  async listVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const response = await apiClient.get<VerificationRequest[]>(
        API_ENDPOINTS.DRIVERS.VERIFICATIONS
      )
      return response.data
    } catch {
      return MOCK_DRIVERS.filter(
        (d) => d.verificationStatus === 'pending' || d.verificationStatus === 'rejected'
      ).map((d) => ({
        id: `ver-${d.id}`,
        driverId: d.id,
        driverCode: d.driverCode,
        driverName: d.fullName,
        driverPhone: d.phone,
        vehicleType: d.vehicle.type,
        submissionDate: d.joinedAt,
        status: d.verificationStatus as 'pending' | 'approved' | 'rejected',
        assignedReviewer: 'Operations Desk (Dar)',
        documentsCount: d.documents.length,
        documents: d.documents,
      }))
    }
  },

  /**
   * Approve verification request
   */
  async approveVerification(driverId: string): Promise<Driver> {
    try {
      const response = await apiClient.post<Driver>(
        API_ENDPOINTS.DRIVERS.APPROVE_VERIFICATION(driverId)
      )
      return response.data
    } catch {
      const index = MOCK_DRIVERS.findIndex((d) => d.id === driverId)
      if (index === -1) {
        throw new Error(`Driver with ID "${driverId}" not found.`)
      }

      const updated: Driver = {
        ...MOCK_DRIVERS[index],
        verificationStatus: 'approved',
        availabilityStatus: 'offline', // eligible to go online
        documents: MOCK_DRIVERS[index].documents.map((doc) => ({
          ...doc,
          status: 'approved',
        })),
      }

      MOCK_DRIVERS[index] = updated
      return updated
    }
  },

  /**
   * Reject verification request with reason and notes
   */
  async rejectVerification(
    driverId: string,
    reason: string,
    notes: string
  ): Promise<Driver> {
    try {
      const response = await apiClient.post<Driver>(
        API_ENDPOINTS.DRIVERS.REJECT_VERIFICATION(driverId),
        { reason, notes }
      )
      return response.data
    } catch {
      const index = MOCK_DRIVERS.findIndex((d) => d.id === driverId)
      if (index === -1) {
        throw new Error(`Driver with ID "${driverId}" not found.`)
      }

      const updated: Driver = {
        ...MOCK_DRIVERS[index],
        verificationStatus: 'rejected',
        availabilityStatus: 'unavailable',
        documents: MOCK_DRIVERS[index].documents.map((doc) => ({
          ...doc,
          status: 'rejected',
          rejectionReason: notes || reason,
        })),
      }

      MOCK_DRIVERS[index] = updated
      return updated
    }
  },
}
