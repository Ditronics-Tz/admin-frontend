import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { LoadingFallback } from '@/components/feedback/LoadingFallback'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { NotFoundPage } from '@/components/common/NotFoundPage'
import { HomeRedirect } from '@/features/auth/components/HomeRedirect'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const SystemStatusPage = lazy(() => import('@/features/settings/pages/SystemStatusPage'))
const SupportDetailPage = lazy(() => import('@/features/support/pages/SupportDetailPage'))
const RideDetailPage = lazy(() => import('@/features/rides/pages/RideDetailPage'))
const ChangePasswordPage = lazy(() => import('@/features/auth/pages/ChangePasswordPage'))

// Lazy-loaded layouts & feature modules
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const RidesPage = lazy(() => import('@/features/rides/pages/RidesPage'))
const DriversPage = lazy(() => import('@/features/drivers/pages/DriversPage'))
const DriverDetailsPage = lazy(() => import('@/features/drivers/pages/DriverDetailsPage'))
const DriverEditPage = lazy(() => import('@/features/drivers/pages/DriverEditPage'))
const DriverVerificationsPage = lazy(
  () => import('@/features/drivers/pages/DriverVerificationsPage')
)
const VerificationDetailsPage = lazy(
  () => import('@/features/drivers/pages/VerificationDetailsPage')
)
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
const PromotionsPage = lazy(() => import('@/features/promotions/pages/PromotionsPage'))
const PromoDetailPage = lazy(() => import('@/features/promotions/pages/PromoDetailPage'))
const PromoEditorPage = lazy(() => import('@/features/promotions/pages/PromoEditorPage'))
const ReferralsPage = lazy(() => import('@/features/promotions/pages/ReferralsPage'))
const ReportsPage = lazy(() =>
  import('@/features/operations/ReportsPage').then((m) => ({ default: m.ReportsPage }))
)
const ReportDetailPage = lazy(() =>
  import('@/features/operations/ReportsPage').then((m) => ({
    default: m.ReportDetailPage,
  }))
)
const FlagsPage = lazy(() =>
  import('@/features/operations/ReportsPage').then((m) => ({ default: m.FlagsPage }))
)
const SafetyPage = lazy(() =>
  import('@/features/operations/SafetyPage').then((m) => ({ default: m.SafetyPage }))
)
const SOSDetailPage = lazy(() =>
  import('@/features/operations/SafetyPage').then((m) => ({ default: m.SOSDetailPage }))
)
const SOSHistoryPage = lazy(() =>
  import('@/features/operations/SafetyPage').then((m) => ({ default: m.SOSHistoryPage }))
)
const IncidentsPage = lazy(() =>
  import('@/features/operations/SafetyPage').then((m) => ({ default: m.IncidentsPage }))
)
const IncidentDetailPage = lazy(() =>
  import('@/features/operations/SafetyPage').then((m) => ({
    default: m.IncidentDetailPage,
  }))
)
const FinanceDashboard = lazy(() =>
  import('@/features/operations/FinancePage').then((m) => ({
    default: m.FinanceDashboard,
  }))
)
const PaymentDetailPage = lazy(() =>
  import('@/features/operations/FinancePage').then((m) => ({
    default: m.PaymentDetailPage,
  }))
)
const RefundsPage = lazy(() =>
  import('@/features/operations/FinancePage').then((m) => ({ default: m.RefundsPage }))
)
const PayoutsPage = lazy(() =>
  import('@/features/operations/FinancePage').then((m) => ({ default: m.PayoutsPage }))
)
const WalletsPage = lazy(() =>
  import('@/features/operations/FinancePage').then((m) => ({ default: m.WalletsPage }))
)
const PaymentSettingsPage = lazy(() =>
  import('@/features/operations/FinancePage').then((m) => ({
    default: m.PaymentSettingsPage,
  }))
)
const ReconciliationPage = lazy(() =>
  import('@/features/operations/FinancePage').then((m) => ({
    default: m.ReconciliationPage,
  }))
)

const FraudPage = lazy(() =>
  import('@/features/operations/FraudPage').then((m) => ({ default: m.FraudPage }))
)
const FraudDetailPage = lazy(() =>
  import('@/features/operations/FraudPage').then((m) => ({ default: m.FraudDetailPage }))
)
const FraudRulesPage = lazy(() =>
  import('@/features/operations/FraudPage').then((m) => ({ default: m.FraudRulesPage }))
)

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
      // Support staff start with the SOS console.
      {
        path: ROUTES.HOME,
        element: (
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        ),
      },
      // Public administrative authentication route
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      // Protected Administrative Workspace Layout Shell
      {
        path: ROUTES.CHANGE_PASSWORD,
        element: (
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        ),
      },
      {
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/system-status',
            element: (
              <ProtectedRoute requiredRole="admin">
                <SystemStatusPage />
              </ProtectedRoute>
            ),
          },
          { path: '/fraud', element: <FraudPage /> },
          { path: '/support/:kind/:id', element: <SupportDetailPage /> },
          { path: '/rides/:id', element: <RideDetailPage /> },
          { path: '/fraud/rules', element: <FraudRulesPage /> },
          { path: '/fraud/:id', element: <FraudDetailPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/reports/flags', element: <FlagsPage /> },
          { path: '/reports/:id', element: <ReportDetailPage /> },
          { path: '/safety', element: <SafetyPage /> },
          { path: '/safety/history', element: <SOSHistoryPage /> },
          { path: '/safety/sos/:id', element: <SOSDetailPage /> },
          { path: '/safety/incidents', element: <IncidentsPage /> },
          { path: '/safety/incidents/:id', element: <IncidentDetailPage /> },
          { path: '/finance', element: <FinanceDashboard /> },
          { path: '/payments/:id', element: <PaymentDetailPage /> },
          { path: '/finance/refunds', element: <RefundsPage /> },
          { path: '/finance/payouts', element: <PayoutsPage /> },
          { path: '/finance/wallets', element: <WalletsPage /> },
          { path: '/finance/settings', element: <PaymentSettingsPage /> },
          { path: '/finance/reconciliation', element: <ReconciliationPage /> },
          { path: ROUTES.PROMOTIONS, element: <PromotionsPage /> },
          { path: ROUTES.PROMOTION_CREATE, element: <PromoEditorPage /> },
          { path: ROUTES.REFERRALS, element: <ReferralsPage /> },
          { path: ROUTES.PROMOTION_DETAILS, element: <PromoDetailPage /> },
          { path: ROUTES.PROMOTION_EDIT, element: <PromoEditorPage /> },
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
            path: ROUTES.DRIVER_VERIFICATIONS,
            element: <DriverVerificationsPage />,
          },
          {
            path: ROUTES.DRIVER_VERIFICATION_DETAILS,
            element: <VerificationDetailsPage />,
          },
          {
            path: ROUTES.DRIVER_EDIT,
            element: <DriverEditPage />,
          },
          {
            path: ROUTES.DRIVER_DETAILS,
            element: <DriverDetailsPage />,
          },
          {
            path: ROUTES.PASSENGERS,
            element: <CustomersPage />,
          },
          {
            path: '/customers',
            element: <Navigate to={ROUTES.PASSENGERS} replace />,
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
