/**
 * Application Constants for Rida Admin Dashboard
 */

export const APP_CONFIG = {
  name: 'Rida Admin',
  tagline: 'Tanzania Ride-Hailing Operations Platform',
  version: '1.0.0',
  targetMarket: 'Tanzania',
  defaultTimezone: 'Africa/Dar_es_Salaam',
  defaultCurrency: 'TZS',
  currencySymbol: 'TSh',
  defaultLocale: 'en',
  supportedLocales: ['en', 'sw'] as const,
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CHANGE_PASSWORD: '/change-password',
  DASHBOARD: '/dashboard',
  RIDES: '/rides',
  DRIVERS: '/drivers',
  DRIVER_VERIFICATIONS: '/drivers/verifications',
  DRIVER_VERIFICATION_DETAILS: '/drivers/verifications/:verificationId',
  DRIVER_DETAILS: '/drivers/:driverId',
  DRIVER_EDIT: '/drivers/:driverId/edit',
  PASSENGERS: '/passengers',
  PROMOTIONS: '/promotions',
  PROMOTION_CREATE: '/promotions/new',
  PROMOTION_DETAILS: '/promotions/:id',
  PROMOTION_EDIT: '/promotions/:id/edit',
  REFERRALS: '/promotions/referrals',
  LIVE_OPERATIONS: '/live-operations',
  PAYMENTS: '/payments',
  ANALYTICS: '/analytics',
  SUPPORT: '/support',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const

/**
 * Real Backend API Routes (Go Fiber /api/v1 service)
 */
export const API_ENDPOINTS = {
  SYSTEM: {
    HEALTH: '/health',
  },
  AUTH: {
    LOGIN: '/staff/auth/login',
    REFRESH: '/staff/auth/refresh',
    LOGOUT: '/staff/auth/logout',
    LOGOUT_ALL: '/staff/auth/logout-all',
    ME: '/staff/auth/me',
    CHANGE_PASSWORD: '/staff/auth/change-password',
    SETUP_2FA: '/staff/auth/2fa/setup',
    VERIFY_2FA: '/staff/auth/2fa/verify',
    DISABLE_2FA: '/staff/auth/2fa/disable',
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAILS: (id: string) => `/admin/users/${id}`,
    UPDATE_USER_ROLE: (id: string) => `/admin/users/${id}/role`,
    VERIFY_DRIVER: (id: string) => `/admin/drivers/${id}/verify`,
    STATS: '/admin/stats',
    ANALYTICS: '/admin/analytics',
    NOTIFICATIONS: '/admin/notifications',
    RIDES: '/admin/rides',
    COMPLAINTS: '/admin/complaints',
    UPDATE_COMPLAINT: (id: string) => `/admin/complaints/${id}`,
    TICKETS: '/admin/tickets',
    UPDATE_TICKET: (id: string) => `/admin/tickets/${id}`,
    AUDIT_LOGS: '/admin/audit-logs',
    STAFF: '/admin/staff',
    UPDATE_STAFF: (id: string) => `/admin/staff/${id}`,
    UPDATE_STAFF_ROLE: (id: string) => `/admin/staff/${id}/role`,
    RESET_STAFF_PASSWORD: (id: string) => `/admin/staff/${id}/reset-password`,
    REVOKE_STAFF_SESSIONS: (id: string) => `/admin/staff/${id}/revoke-sessions`,
  },
  FILES: {
    LICENCE_DOC: (id: string) => `/files/licences/${id}`,
    UPLOADS: (path: string) => `/uploads/${path}`,
  },
  DRIVERS: {
    LIST: '/admin/users?role=driver',
    STATS: '/admin/stats',
    DETAILS: (id: string) => `/admin/users/${id}`,
    VERIFY: (id: string) => `/admin/drivers/${id}/verify`,
    LICENCE_DOC: (id: string) => `/files/licences/${id}`,
  },
} as const
