import type {
  DriverAccountStatus,
  DriverVerificationStatus,
  DriverAvailabilityStatus,
  VehicleType,
  DriverDocumentType,
} from '../types/driver.types'

/**
 * Format Tanzanian phone numbers into readable +255 7XX XXX XXX
 */
export function formatTzPhone(raw: string): string {
  if (!raw) return '—'
  const clean = raw.replace(/\s+/g, '').replace(/-/g, '')
  if (clean.startsWith('+255') && clean.length === 13) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 10)} ${clean.slice(10)}`
  }
  if (clean.startsWith('0') && clean.length === 10) {
    return `+255 ${clean.slice(1, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`
  }
  return raw
}

/**
 * Extract 2-letter uppercase initials from full name
 */
export function getDriverInitials(name: string): string {
  if (!name) return 'DR'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Human-readable label for Account Status
 */
export function getAccountStatusLabel(status: DriverAccountStatus): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'suspended':
      return 'Suspended'
    case 'deactivated':
      return 'Deactivated'
    default:
      return status
  }
}

/**
 * Human-readable label for Verification Status
 */
export function getVerificationStatusLabel(status: DriverVerificationStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'pending':
      return 'Pending'
    case 'rejected':
      return 'Rejected'
    case 'expired':
      return 'Expired'
    case 'not_submitted':
      return 'Not Submitted'
    default:
      return status
  }
}

/**
 * Human-readable label for Availability Status
 */
export function getAvailabilityStatusLabel(status: DriverAvailabilityStatus): string {
  switch (status) {
    case 'online':
      return 'Online'
    case 'offline':
      return 'Offline'
    case 'on_trip':
      return 'On Trip'
    case 'unavailable':
      return 'Unavailable'
    default:
      return status
  }
}

/**
 * Human-readable label for Vehicle Type
 */
export function getVehicleTypeLabel(type: VehicleType): string {
  switch (type) {
    case 'motorcycle':
      return 'Motorcycle (Boda)'
    case 'bajaji':
      return 'Bajaji (Three-wheeler)'
    case 'car':
      return 'Car (Standard)'
    default:
      return type
  }
}

/**
 * Human-readable label for Document Type
 */
export function getDocumentTypeLabel(type: DriverDocumentType): string {
  switch (type) {
    case 'driving_license':
      return 'Tanzania Driving License'
    case 'national_id':
      return 'National ID (NIDA)'
    case 'vehicle_registration':
      return 'Vehicle Registration Card'
    case 'latra_permit':
      return 'LATRA Road Service Permit'
    case 'insurance_certificate':
      return 'Motor Vehicle Insurance'
    default:
      return type
  }
}
