/**
 * API Client Configuration
 */

export const API_CONFIG = {
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, ''),
  timeout: 15000,
  tokenKey: 'rida_staff_access_token',
  refreshTokenKey: 'rida_staff_refresh_token',
  demoMode: import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true',
} as const
