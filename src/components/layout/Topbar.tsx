import React, { useState } from 'react'
import { Menu, Search, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { ProfileDropdown } from './ProfileDropdown'
import { useUiStore } from '@/stores/useUiStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Topbar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, toggleMobileNav } = useUiStore()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
      {/* Left section: Sidebar Toggles & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu drawer trigger */}
        <button
          type="button"
          onClick={toggleMobileNav}
          aria-label="Open mobile navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop sidebar expand/collapse button */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground lg:flex"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right section: Search, Notifications, Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drivers, rides, passengers..."
            className="h-9 w-64 rounded-lg border border-input bg-slate-50 pl-8 pr-3 text-xs text-foreground transition-all placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary lg:w-72"
          />
        </div>

        {/* Notifications Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Notifications, no unread notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Bell className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 border-border bg-white p-4 shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              <span className="text-[10px] text-muted-foreground">0 unread</span>
            </div>
            <div className="py-6 text-center text-xs text-muted-foreground">
              <Bell className="mx-auto mb-2 h-6 w-6 text-slate-300" />
              <p>No operational alerts at this time.</p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                All fleet services normal
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Administrator Profile Menu */}
        <ProfileDropdown />
      </div>
    </header>
  )
}
