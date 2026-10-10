import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { LoadingFallback } from '@/components/feedback/LoadingFallback'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { NotFoundPage } from '@/components/common/NotFoundPage'

// Lazy-loaded layouts & feature modules
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const RidesPage = lazy(() => import('@/features/rides/pages/RidesPage'))
const DriversPage = lazy(() => import('@/features/drivers/pages/DriversPage'))
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage'))
const LiveOperationsPage = lazy(
  () => import('@/features/live-operations/pages/LiveOperationsPage')
)
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
      // Default root redirects to /login
      {
        path: ROUTES.HOME,
        element: <Navigate to={ROUTES.LOGIN} replace />,
      },
      // Public authentication route
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      // Protected Administrative Workspace Layout Shell
      {
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.RIDES,
            element: <RidesPage />,
          },
          {
            path: ROUTES.DRIVERS,
            element: <DriversPage />,
          },
          {
            path: ROUTES.CUSTOMERS,
            element: <CustomersPage />,
          },
          {
            path: ROUTES.LIVE_OPERATIONS,
            element: <LiveOperationsPage />,
          },
          {
            path: ROUTES.PAYMENTS,
            element: <PaymentsPage />,
          },
          {
            path: ROUTES.ANALYTICS,
            element: <AnalyticsPage />,
          },
          {
            path: ROUTES.SUPPORT,
            element: <SupportPage />,
          },
          {
            path: ROUTES.NOTIFICATIONS,
            element: <NotificationsPage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
        ],
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
