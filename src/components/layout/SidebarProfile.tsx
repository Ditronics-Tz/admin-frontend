import React from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SidebarProfileProps {
  isCollapsed: boolean
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ isCollapsed }) => {
  const { user } = useAuthStore()

  // Display authenticated user or clear development preview indicator
  const displayName = user?.fullName || 'Dev Operations Lead'
  const displayRole = user?.role
    ? user.role.replace('_', ' ').toUpperCase()
    : 'PREVIEW MODE'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const profileContent = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 transition-colors hover:bg-white/[0.08]',
        isCollapsed && 'justify-center p-2'
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft-mint text-xs font-bold text-brand-deep-teal shadow-inner">
        {initials}
      </div>

      {!isCollapsed && (
        <div className="flex flex-1 flex-col overflow-hidden text-left">
          <span className="truncate text-xs font-semibold text-white">{displayName}</span>
          <span className="truncate text-[10px] font-medium tracking-wider text-brand-soft-mint/70">
            {displayRole}
          </span>
        </div>
      )}
    </div>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{profileContent}</TooltipTrigger>
        <TooltipContent side="right">
          <p className="text-xs font-semibold">{displayName}</p>
          <p className="text-[10px] text-brand-soft-mint/80">{displayRole}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return profileContent
}
