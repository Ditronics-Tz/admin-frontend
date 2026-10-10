import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RidaLogo } from '@/components/brand/RidaLogo'
import { NAVIGATION_CONFIG } from '@/config/navigation'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarProfile } from './SidebarProfile'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useUiStore } from '@/stores/useUiStore'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const isCollapsed = !sidebarOpen

  return (
    <TooltipProvider>
      <aside
        aria-label="Admin Navigation Sidebar"
        className={cn(
          'relative hidden h-screen shrink-0 flex-col border-r border-white/[0.08] bg-brand-deep-teal transition-[width] duration-300 ease-in-out lg:flex',
          isCollapsed ? 'w-[76px]' : 'w-[260px]'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-2.5 overflow-hidden rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-teal"
            title="Rida Admin Console"
          >
            <RidaLogo
              subtitle="Admin Console"
              isDarkTheme={true}
              markSize="sm"
              collapsed={isCollapsed}
            />
          </Link>

          {/* Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-7 w-7 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05] text-brand-soft-mint transition-colors hover:bg-white/[0.1] hover:text-white lg:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Groups (Scrollable) */}
        <div className="scrollbar-thin scrollbar-thumb-white/10 flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAVIGATION_CONFIG.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-brand-soft-mint/50">
                  {group.group}
                </h3>
              )}
              {group.items.map((item) => (
                <SidebarNavItem key={item.path} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Administrator Profile Card */}
        <div className="border-t border-white/[0.08] p-3">
          <SidebarProfile isCollapsed={isCollapsed} />
        </div>
      </aside>
    </TooltipProvider>
  )
}
