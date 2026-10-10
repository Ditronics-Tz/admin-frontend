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
  DRIVERS: '/drivers',
  CUSTOMERS: '/customers',
  RIDES: '/rides',
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
} as const
