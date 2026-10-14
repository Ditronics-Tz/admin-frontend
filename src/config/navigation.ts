import {
  LayoutDashboard,
  CarFront,
  Users,
  UserRound,
  MapPinned,
  Wallet,
  ChartNoAxesCombined,
  Headset,
  Bell,
  Settings,
  TicketPercent,
  Flag,
  ShieldAlert,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export interface NavItem {
  title: string
  path: string
  icon: LucideIcon
  badge?: string
  adminOnly?: boolean
}

export interface NavGroup {
  group: string
  items: NavItem[]
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: 'Operations',
    items: [
      { title: 'Ratings', path: '/ratings', icon: Star, adminOnly: true },
      { title: 'Fraud', path: '/fraud', icon: ShieldAlert },
      { title: 'Reports', path: '/reports', icon: Flag },
      { title: 'Safety', path: '/safety', icon: ShieldAlert },
      {
        title: 'Rides',
        path: ROUTES.RIDES,
        icon: CarFront,
      },
      {
        title: 'Drivers',
        path: ROUTES.DRIVERS,
        icon: Users,
      },
      {
        title: 'Users',
        path: ROUTES.PASSENGERS,
        icon: UserRound,
      },
      {
        title: 'Live Operations',
        path: ROUTES.LIVE_OPERATIONS,
        icon: MapPinned,
        badge: 'Live',
      },
    ],
  },
  {
    group: 'Finance',
    items: [
      { title: 'Finance dashboard', path: '/finance', icon: Wallet, adminOnly: true },
      { title: 'Promotions', path: ROUTES.PROMOTIONS, icon: TicketPercent },
      {
        title: 'Payments',
        path: ROUTES.PAYMENTS,
        icon: Wallet,
      },
      {
        title: 'Analytics',
        path: ROUTES.ANALYTICS,
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    group: 'Administration',
    items: [
      {
        title: 'Support',
        path: ROUTES.SUPPORT,
        icon: Headset,
      },
      {
        title: 'Notifications',
        path: ROUTES.NOTIFICATIONS,
        icon: Bell,
      },
      {
        title: 'Settings',
        path: ROUTES.SETTINGS,
        icon: Settings,
      },
      { title: 'System status', path: '/system-status', icon: Settings, adminOnly: true },
    ],
  },
]

/**
 * Returns breadcrumb segments for a given pathname
 */
export function getBreadcrumbsForPath(
  pathname: string
): { label: string; path?: string }[] {
  // Check exact matches in main config
  for (const group of NAVIGATION_CONFIG) {
    for (const item of group.items) {
      if (item.path === pathname) {
        if (group.group === 'Overview') {
          return [{ label: item.title }]
        }
        return [{ label: group.group }, { label: item.title, path: item.path }]
      }
    }
  }

  // Nested driver routes
  if (pathname.startsWith('/promotions/')) {
    return [
      { label: 'Finance' },
      { label: 'Promotions', path: ROUTES.PROMOTIONS },
      {
        label:
          pathname === ROUTES.REFERRALS
            ? 'Referrals'
            : pathname === ROUTES.PROMOTION_CREATE
              ? 'Create promo'
              : pathname.endsWith('/edit')
                ? 'Edit promo'
                : 'Promo details',
      },
    ]
  }
  if (pathname.startsWith('/drivers/verifications/')) {
    return [
      { label: 'Operations' },
      { label: 'Drivers', path: ROUTES.DRIVERS },
      { label: 'Verifications', path: ROUTES.DRIVER_VERIFICATIONS },
      { label: 'Review Submission' },
    ]
  }

  if (pathname === ROUTES.DRIVER_VERIFICATIONS) {
    return [
      { label: 'Operations' },
      { label: 'Drivers', path: ROUTES.DRIVERS },
      { label: 'Verification Queue' },
    ]
  }

  if (pathname.startsWith('/drivers/') && pathname.endsWith('/edit')) {
    const driverId = pathname.replace('/drivers/', '').replace('/edit', '')
    return [
      { label: 'Operations' },
      { label: 'Drivers', path: ROUTES.DRIVERS },
      { label: 'Profile', path: `/drivers/${driverId}` },
      { label: 'Edit Driver' },
    ]
  }

  if (pathname.startsWith('/drivers/')) {
    return [
      { label: 'Operations' },
      { label: 'Drivers', path: ROUTES.DRIVERS },
      { label: 'Driver Profile' },
    ]
  }

  return [{ label: 'Admin' }]
}
