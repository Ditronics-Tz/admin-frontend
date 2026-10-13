import React from 'react'
import { NavLink } from 'react-router-dom'
import type { NavItem } from '@/config/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { SOSNavBadge } from '@/features/operations/safety.live'

interface SidebarNavItemProps {
  item: NavItem
  isCollapsed: boolean
  onClick?: () => void
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isCollapsed,
  onClick,
}) => {
  const Icon = item.icon

  const content = (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-primary-teal',
          isActive
            ? 'bg-brand-primary-teal text-white shadow-sm'
            : 'text-brand-soft-mint/70 hover:bg-white/[0.08] hover:text-white',
          isCollapsed && 'justify-center px-2 py-2.5'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0 transition-colors',
              isActive
                ? 'text-white'
                : 'text-brand-soft-mint/70 group-hover:text-brand-soft-mint'
            )}
            aria-hidden="true"
          />

          {!isCollapsed && (
            <span className="flex-1 truncate text-[13px] tracking-tight">
              {item.title}
            </span>
          )}

          {!isCollapsed && item.badge && (
            <span className="rounded-full bg-brand-soft-mint/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-mint">
              {item.badge}
            </span>
          )}
          {item.path === '/safety' && <SOSNavBadge />}
        </>
      )}
    </NavLink>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {item.title}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
