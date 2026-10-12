/**
 * Domain types for Rida Driver Management Module
 * Tanzania Ride-Hailing Platform
 */

export type DriverAccountStatus = 'active' | 'suspended' | 'deactivated'

export type DriverVerificationStatus =
  'not_submitted' | 'pending' | 'approved' | 'rejected' | 'expired'

export type DriverAvailabilityStatus =
  'online' | 'offline' | 'on_trip' | 'unavailable' | 'unknown'

export type VehicleType = 'motorcycle' | 'bajaji' | 'car' | 'unknown'

export interface DriverVehicle {
  id: string
  type: VehicleType
  make: string
  model: string
  year: number | null
  plateNumber: string
  color: string
  inspectionStatus: 'passed' | 'pending' | 'failed' | 'expired' | 'unknown'
  inspectionExpiry?: string
}

export type DriverDocumentType =
  | 'driving_license'
  | 'national_id'
  | 'vehicle_registration'
  | 'latra_permit'
  | 'insurance_certificate'

export interface DriverDocument {
  id: string
  type: DriverDocumentType
  title: string
  documentNumber: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  fileUrl: string
  submissionDate: string
  expiryDate?: string
  rejectionReason?: string
}

export interface DriverTripSummary {
  id: string
  tripCode: string
  customerName: string
  pickupLocation: string
  dropoffLocation: string
  fareTZS: number
  status: 'completed' | 'cancelled' | 'ongoing'
  completedAt: string
}

export interface DriverAuditLog {
  id: string
  action: string
  performedBy: string
  timestamp: string
  details: string
}

export interface Driver {
  id: string
  driverCode: string
  fullName: string
  email: string
  phone: string
  city: string
  district?: string
  accountStatus: DriverAccountStatus
  verificationStatus: DriverVerificationStatus
  availabilityStatus: DriverAvailabilityStatus
  vehicle: DriverVehicle
  rating: number | null
  ratingCount: number
  totalTrips: number | null
  totalEarningsTZS: number | null
  acceptanceRate: number | null
  cancellationRate: number | null
  joinedAt: string
  avatarUrl?: string
  documents: DriverDocument[]
  suspensionReason?: string
  suspensionNotes?: string
  suspendedAt?: string
}

export interface DriverStatistics {
  totalDrivers: number
  activeDrivers: number
  pendingVerification: number
  deactivatedDrivers: number
}

export interface DriverFilters {
  search: string
  accountStatus: string
  verificationStatus: string
  vehicleType: string
  page: number
  pageSize: number
  sortBy?: 'fullName' | 'joinedAt' | 'rating' | 'totalTrips'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface VerificationRequest {
  id: string
  driverId: string
  driverCode: string
  driverName: string
  driverPhone: string
  vehicleType: VehicleType
  submissionDate: string
  status: 'pending' | 'approved' | 'rejected'
  assignedReviewer?: string
  documentsCount: number
  rejectionReason?: string
  rejectionNotes?: string
  reviewedAt?: string
  reviewedBy?: string
  documents?: DriverDocument[]
}

export interface CreateDriverInput {
  fullName: string
  email: string
  phone: string
  city: string
  district?: string
  vehicleType: VehicleType
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehiclePlateNumber: string
  vehicleColor: string
}

export interface UpdateDriverInput {
  fullName: string
  email: string
  phone: string
  city: string
  district?: string
  vehicleType: VehicleType
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehiclePlateNumber: string
  vehicleColor: string
}
