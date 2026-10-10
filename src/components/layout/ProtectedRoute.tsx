import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/lib/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
  /**
   * Optional role required to view the page in future RBAC
   */
  requiredRole?: string
  /**
   * During Phase 1, dashboard routes are development placeholders.
   * Setting allowDevPreview allows developers to inspect route components
   * while clearly noting that live authentication is not active.
   */
  allowDevPreview?: boolean
}

/**
 * ProtectedRoute Guard
 *
 * Secures administrative views. In Phase 1:
 * - Real authentication backend is not yet attached.
 * - Placeholder security is NEVER masqueraded as production security.
 * - When allowDevPreview is true in development, views display an informative banner.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowDevPreview = true,
}) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  // In production, unauthenticated users are immediately redirected to login
  const isDev = import.meta.env.DEV

  if (!isAuthenticated && (!isDev || !allowDevPreview)) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <div className="relative min-h-screen">
      {!isAuthenticated && isDev && (
        <aside
          role="note"
          aria-label="Development Route Warning"
          className="border-b border-brand-primary-teal/30 bg-brand-deep-teal/95 px-4 py-2 text-center text-xs font-medium text-brand-soft-mint"
        >
          <span className="mr-1.5 font-semibold text-white">[PHASE 1 DEV PREVIEW]</span>
          Live authentication backend inactive. Showing route placeholder for structural
          validation.
        </aside>
      )}
      {children}
    </div>
  )
}
