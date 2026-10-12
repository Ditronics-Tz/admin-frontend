import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/lib/constants'
import { API_CONFIG } from '@/lib/api/config'
import { LoadingFallback } from '@/components/feedback/LoadingFallback'
import type { AdminRole } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: AdminRole
  allowDevPreview?: boolean
}

/**
 * ProtectedRoute Guard
 *
 * Secures administrative views:
 * - When checking token: renders loading fallback.
 * - Production: unauthenticated requests are strictly redirected to /login.
 * - Demo mode: if VITE_ENABLE_DEMO_MODE=true, allows demonstration preview.
 * - Role enforcement: checks requiredRole (e.g. 'admin').
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowDevPreview = API_CONFIG.demoMode,
}) => {
  const { isAuthenticated, status, user } = useAuthStore()
  const location = useLocation()

  // Wait for session verification on initial load
  if (status === 'loading') {
    return <LoadingFallback message="Verifying administrative session..." />
  }

  // Enforce authentication
  if (!isAuthenticated && !allowDevPreview) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (user?.mustChangePassword && location.pathname !== ROUTES.CHANGE_PASSWORD) {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />
  }

  // Enforce required role if specified
  if (requiredRole && user && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600">
          This section requires <span className="font-semibold">{requiredRole}</span>{' '}
          privileges. Your current role is{' '}
          <span className="font-semibold">{user.role}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {!isAuthenticated && allowDevPreview && (
        <aside
          role="note"
          aria-label="Development Route Warning"
          className="z-50 shrink-0 border-b border-brand-primary-teal/30 bg-brand-deep-teal px-4 py-1.5 text-center text-xs font-medium text-brand-soft-mint"
        >
          <span className="mr-1.5 font-bold text-white">[RIDA ADMIN PREVIEW]</span>
          Live backend authentication inactive. Displaying layout in demonstration preview
          mode.
        </aside>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
