import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/lib/constants'
import { User, Settings, LogOut } from 'lucide-react'

import { authService } from '@/features/auth/services/authService'

export const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const displayName = user?.fullName || 'Administrator'
  const displayRole = user?.role ? user.role.replace('_', ' ').toUpperCase() : 'STAFF'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSignOut = async () => {
    try {
      await authService.logout()
    } finally {
      logout()
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-deep-teal text-xs font-bold text-brand-soft-mint shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-border bg-white p-1 shadow-lg"
      >
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold leading-none text-foreground">
              {displayName}
            </p>
            <p className="mt-1 text-xs leading-none text-muted-foreground">
              {user?.email || 'admin@rida.tz'}
            </p>
            <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider text-primary">
              {displayRole}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="flex cursor-pointer items-center gap-2 py-2 text-xs"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span>My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="flex cursor-pointer items-center gap-2 py-2 text-xs"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex cursor-pointer items-center gap-2 py-2 text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
