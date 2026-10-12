import type {
  BackendUserResponse,
  BackendDriverProfile,
  BackendUserDetailResponse,
} from '@/lib/api/types'
import type { Driver, DriverDocument, VerificationRequest } from '../types/driver.types'
import { API_CONFIG } from '@/lib/api/config'

/**
 * Maps a single backend UserResponse (and optional DriverProfile) into the frontend Driver view model.
 */
export function mapBackendUserToDriver(
  user: BackendUserResponse,
  profile?: BackendDriverProfile | null
): Driver {
  const documents: DriverDocument[] = []

  // Build resolved avatar URL
  let avatarUrl: string | undefined
  if (profile?.profile_picture_url) {
    avatarUrl = profile.profile_picture_url.startsWith('http')
      ? profile.profile_picture_url
      : `${API_CONFIG.baseURL.replace(/\/api\/v1\/?$/, '')}${profile.profile_picture_url}`
  }

  return {
    id: user.id,
    driverCode: `DRV-${user.id.slice(0, 8).toUpperCase()}`,
    fullName: user.name,
    email: user.email,
    phone: user.phone || 'Not collected',
    city: 'Not collected',
    accountStatus:
      user.status === 'suspended'
        ? 'suspended'
        : user.status === 'banned'
          ? 'banned'
          : !user.is_active
            ? 'deactivated'
            : profile?.verification_status === 'suspended'
              ? 'suspended'
              : 'active',
    verificationStatus: profile?.verification_status || 'pending_documents',
    availabilityStatus: profile?.is_online ? 'online' : 'offline',
    vehicle: {
      id: profile?.vehicle_card_number || `veh-${user.id.slice(0, 6)}`,
      type: 'unknown',
      make: 'Not collected',
      model: profile?.vehicle_card_number
        ? `Card ${profile.vehicle_card_number}`
        : 'Not collected',
      year: null,
      plateNumber: profile?.plate_number || 'Not collected',
      color: 'Not collected',
      inspectionStatus: 'unknown',
    },
    rating: profile?.average_rating ? Number(profile.average_rating.toFixed(2)) : null,
    ratingCount: profile?.total_ratings || 0,
    totalTrips: null,
    totalEarningsTZS: null,
    acceptanceRate: null,
    cancellationRate: null,
    joinedAt: profile?.created_at || '',
    avatarUrl,
    documents,
  }
}

/**
 * Maps detailed user response (GET /api/v1/admin/users/:id) to complete Driver model.
 */
export function mapBackendUserDetailToDriver(detail: BackendUserDetailResponse): Driver {
  const driver = mapBackendUserToDriver(detail.user, detail.driver_profile)
  driver.documents = (detail.driver_documents || []).map((document) => ({
    id: document.id,
    type: document.type,
    title: document.type.replaceAll('_', ' '),
    documentNumber:
      document.type === 'driving_licence'
        ? detail.driver_profile?.licence_number || ''
        : document.type === 'vehicle_card'
          ? detail.driver_profile?.vehicle_card_number || ''
          : '',
    status: document.status,
    fileUrl: document.file_url,
    submissionDate: document.created_at,
    expiryDate: document.expires_at || undefined,
    rejectionReason: document.rejection_note || undefined,
    rejectionCode: document.rejection_code || undefined,
    reviewedBy: document.reviewed_by || undefined,
    reviewedAt: document.reviewed_at || undefined,
  }))
  if (detail.average_rating) {
    driver.rating = Number(detail.average_rating.toFixed(2))
  }
  if (detail.total_ratings) {
    driver.ratingCount = detail.total_ratings
  }
  return driver
}

/**
 * Converts a Driver view model into a VerificationRequest model for the verifications view.
 */
export function mapDriverToVerificationRequest(driver: Driver): VerificationRequest {
  return {
    id: `ver-${driver.id}`,
    driverId: driver.id,
    driverCode: driver.driverCode,
    driverName: driver.fullName,
    driverPhone: driver.phone,
    vehicleType: driver.vehicle.type,
    submissionDate: driver.joinedAt,
    status: driver.verificationStatus,
    documentsCount: driver.documents.length,
    documents: driver.documents,
  }
}
