import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { RidaLogo } from '@/components/brand/RidaLogo'
import { NAVIGATION_CONFIG } from '@/config/navigation'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarProfile } from './SidebarProfile'
import { useUiStore } from '@/stores/useUiStore'
import { ROUTES } from '@/lib/constants'

export const MobileNavDrawer: React.FC = () => {
  const { mobileNavOpen, setMobileNavOpen } = useUiStore()
  const location = useLocation()

  // Close drawer on route change
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname, setMobileNavOpen])

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileNavOpen) {
        setMobileNavOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen, setMobileNavOpen])

  if (!mobileNavOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-50 flex lg:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-brand-deep-teal shadow-2xl">
        {/* Header with Close Button */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5">
          <Link
            to={ROUTES.DASHBOARD}
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-2.5"
          >
            <RidaLogo subtitle="Admin Console" isDarkTheme={true} markSize="sm" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-brand-soft-mint/80 hover:bg-white/[0.1] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          {NAVIGATION_CONFIG.map((group) => (
            <div key={group.group} className="space-y-1">
              <h3 className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-brand-soft-mint/50">
                {group.group}
              </h3>
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  item={item}
                  isCollapsed={false}
                  onClick={() => setMobileNavOpen(false)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Profile */}
        <div className="border-t border-white/[0.08] p-4">
          <SidebarProfile isCollapsed={false} />
        </div>
      </div>
    </div>
  )
}
