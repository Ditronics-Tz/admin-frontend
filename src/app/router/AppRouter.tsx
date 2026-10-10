import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { LoadingFallback } from '@/components/feedback/LoadingFallback'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { NotFoundPage } from '@/components/common/NotFoundPage'

// Lazy-loaded feature modules
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const DriversPage = lazy(() => import('@/features/drivers/pages/DriversPage'))
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'))
const RidesPage = lazy(() => import('@/features/rides/pages/RidesPage'))
const PaymentsPage = lazy(() => import('@/features/payments/pages/PaymentsPage'))
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'))
const SupportPage = lazy(() => import('@/features/support/pages/SupportPage'))
const NotificationsPage = lazy(
  () => import('@/features/notifications/pages/NotificationsPage')
)
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))

/**
 * Root suspense layout boundary
 */
const SuspenseLayout: React.FC = () => (
  <Suspense fallback={<LoadingFallback message="Loading administrative view..." />}>
    <Outlet />
  </Suspense>
)

/**
 * Centralized Route Definition
 */
const router = createBrowserRouter([
  {
    element: <SuspenseLayout />,
    children: [
      // Phase 1: Default root redirects to /login
      {
        path: ROUTES.HOME,
        element: <Navigate to={ROUTES.LOGIN} replace />,
      },
      // Authentication route
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      // Protected administrative routes (Preview allowed in Phase 1)
      {
        path: ROUTES.DASHBOARD,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DRIVERS,
        element: (
          <ProtectedRoute>
            <DriversPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CUSTOMERS,
        element: (
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.RIDES,
        element: (
          <ProtectedRoute>
            <RidesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PAYMENTS,
        element: (
          <ProtectedRoute>
            <PaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ANALYTICS,
        element: (
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.SUPPORT,
        element: (
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.NOTIFICATIONS,
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      // Catch-all 404 Route
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}
