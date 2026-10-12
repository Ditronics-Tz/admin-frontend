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
  const isVerified = Boolean(profile?.verified)
  const hasLicence = Boolean(profile?.licence_number || profile?.licence_image_url)

  const documents: DriverDocument[] = []
  if (profile?.licence_image_url) {
    documents.push({
      id: `doc-lic-${user.id}`,
      type: 'driving_license',
      title: 'Tanzania Driving Licence',
      documentNumber: profile?.licence_number || 'Recorded on file',
      status: isVerified ? 'approved' : 'pending',
      fileUrl: `${API_CONFIG.baseURL}/files/licences/${user.id}`,
      submissionDate: profile?.created_at || '',
    })
  }

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
    phone: 'Not collected',
    city: 'Not collected',
    accountStatus: user.is_active ? 'active' : 'deactivated',
    verificationStatus: isVerified
      ? 'approved'
      : hasLicence
        ? 'pending'
        : 'not_submitted',
    availabilityStatus: 'unknown',
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
    status: driver.verificationStatus === 'approved' ? 'approved' : 'pending',
    documentsCount: driver.documents.length,
    documents: driver.documents,
  }
}
