import { useAuthStore } from '@/stores/useAuthStore'
import { useApiAccess } from '@/lib/api/access'

/**
 * Hook for checking administrative permissions aligned with Go backend RBAC:
 * - 'admin': Full access (staff management, user role updates, audit logs, driver verification)
 * - 'support': Operational access (user lookup, driver verification, complaints, tickets)
 */
export function usePermission() {
  const { user, isAuthenticated } = useAuthStore()
  const readOnly = useApiAccess((state) => state.readOnly)

  const role = user?.role

  const isAdmin = Boolean(isAuthenticated && role === 'admin')

  const isSupport = Boolean(isAuthenticated && (role === 'support' || isAdmin))

  return {
    user,
    role,
    isAuthenticated,
    isAdmin,
    isSupport,
    readOnly,
    canWrite: isSupport && !readOnly,
    canManageStaff: isAdmin && !readOnly,
    canViewAuditLogs: isAdmin,
    canChangeUserRoles: isAdmin && !readOnly,
    canVerifyDrivers: isSupport && !readOnly,
    canManageComplaints: isSupport && !readOnly,
    canManageTickets: isSupport && !readOnly,
  }
}
