/**
 * Application Constants for Rida Admin Dashboard
 */

export const APP_CONFIG = {
  name: 'Rida Admin',
  tagline: 'Tanzania Ride-Hailing Operations Platform',
  version: '1.0.0-alpha',
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
  DASHBOARD: '/dashboard',
  RIDES: '/rides',
  DRIVERS: '/drivers',
  DRIVER_VERIFICATIONS: '/drivers/verifications',
  DRIVER_VERIFICATION_DETAILS: '/drivers/verifications/:verificationId',
  DRIVER_DETAILS: '/drivers/:driverId',
  DRIVER_EDIT: '/drivers/:driverId/edit',
  CUSTOMERS: '/customers',
  LIVE_OPERATIONS: '/live-operations',
  PAYMENTS: '/payments',
  ANALYTICS: '/analytics',
  SUPPORT: '/support',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  DRIVERS: {
    LIST: '/drivers',
    STATS: '/drivers/stats',
    DETAILS: (id: string) => `/drivers/${id}`,
    CREATE: '/drivers',
    UPDATE: (id: string) => `/drivers/${id}`,
    SUSPEND: (id: string) => `/drivers/${id}/suspend`,
    REACTIVATE: (id: string) => `/drivers/${id}/reactivate`,
    VERIFICATIONS: '/drivers/verifications',
    VERIFICATION_DETAILS: (id: string) => `/drivers/verifications/${id}`,
    APPROVE_VERIFICATION: (id: string) => `/drivers/verifications/${id}/approve`,
    REJECT_VERIFICATION: (id: string) => `/drivers/verifications/${id}/reject`,
  },
} as const

