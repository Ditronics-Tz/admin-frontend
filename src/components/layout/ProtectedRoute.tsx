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
   * Allows developers to inspect route layouts and components in DEV mode
   * while clearly displaying that live backend authentication is disconnected.
   */
  allowDevPreview?: boolean
}

/**
 * ProtectedRoute Guard
 *
 * Secures administrative views:
 * - Production: unauthenticated requests are strictly redirected to /login.
 * - Development: if allowDevPreview is true, renders an informative banner
 *   without creating a fake authenticated session.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowDevPreview = true,
}) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const isDev = import.meta.env.DEV

  // Enforce redirection if unauthenticated in production or if dev preview disabled
  if (!isAuthenticated && (!isDev || !allowDevPreview)) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {!isAuthenticated && isDev && (
        <aside
          role="note"
          aria-label="Development Route Warning"
          className="z-50 shrink-0 border-b border-brand-primary-teal/30 bg-brand-deep-teal px-4 py-1.5 text-center text-xs font-medium text-brand-soft-mint"
        >
          <span className="mr-1.5 font-bold text-white">[RIDA ADMIN DEV PREVIEW]</span>
          Live backend authentication inactive. Displaying layout in demonstration preview
          mode.
        </aside>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
