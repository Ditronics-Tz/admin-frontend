import { API_CONFIG } from './config'

// Temporary exception: the backend currently rotates refresh tokens in JSON.
// This is the only module that persists one; replace it when HttpOnly refresh
// cookies are available. Access tokens are never persisted.
let fallback: string | null = null
export const refreshStorage = {
  get() {
    try {
      return localStorage.getItem(API_CONFIG.refreshTokenKey)
    } catch {
      return fallback
    }
  },
  set(value: string) {
    fallback = value
    try {
      localStorage.setItem(API_CONFIG.refreshTokenKey, value)
    } catch {
      /* Browser storage disabled. */
    }
  },
  clear() {
    fallback = null
    try {
      localStorage.removeItem(API_CONFIG.refreshTokenKey)
    } catch {
      /* Browser storage disabled. */
    }
  },
  removeLegacyAccess() {
    try {
      localStorage.removeItem(API_CONFIG.tokenKey)
    } catch {
      /* Browser storage disabled. */
    }
  },
}
