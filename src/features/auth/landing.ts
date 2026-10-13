import type { AdminUser } from '@/types/auth'
import { ROUTES } from '@/lib/constants'

export function staffLandingPath(
  user: AdminUser,
  from?: { pathname: string; search?: string; hash?: string }
) {
  if (user.mustChangePassword) return ROUTES.CHANGE_PASSWORD
  if (from && from.pathname !== ROUTES.HOME)
    return from.pathname + (from.search || '') + (from.hash || '')
  return user.role === 'support' ? '/safety' : ROUTES.DASHBOARD
}
