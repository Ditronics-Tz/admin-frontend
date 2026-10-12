import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Hook for checking administrative permissions aligned with Go backend RBAC:
 * - 'admin': Full access (staff management, user role updates, audit logs, driver verification)
 * - 'support': Operational access (user lookup, driver verification, complaints, tickets)
 */
export function usePermission() {
  const { user, isAuthenticated } = useAuthStore()

  const role = user?.role

  const isAdmin = Boolean(isAuthenticated && role === 'admin')

  const isSupport = Boolean(isAuthenticated && (role === 'support' || isAdmin))

  return {
    user,
    role,
    isAuthenticated,
    isAdmin,
    isSupport,
    canManageStaff: isAdmin,
    canViewAuditLogs: isAdmin,
    canChangeUserRoles: isAdmin,
    canVerifyDrivers: isSupport,
    canManageComplaints: isSupport,
    canManageTickets: isSupport,
  }
}
