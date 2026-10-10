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
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export interface NavItem {
  title: string
  path: string
  icon: LucideIcon
  badge?: string
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
        title: 'Customers',
        path: ROUTES.CUSTOMERS,
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
    ],
  },
]

/**
 * Returns breadcrumb segments for a given pathname
 */
export function getBreadcrumbsForPath(
  pathname: string
): { label: string; path?: string }[] {
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
  return [{ label: 'Admin' }]
}
