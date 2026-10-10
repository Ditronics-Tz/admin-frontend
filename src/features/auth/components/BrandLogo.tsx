import React from 'react'
import { Bike } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  subtitle?: string
  className?: string
  isDarkTheme?: boolean
}

/**
 * BrandLogo component rendering the Rida square mint emblem and operations subtitle
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  subtitle = 'Operations console',
  className,
  isDarkTheme = true,
}) => {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      {/* 36px x 36px Mint Container with 9px radius */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-brand-soft-mint shadow-sm"
        aria-hidden="true"
      >
        <Bike className="h-5 w-5 text-brand-deep-teal" strokeWidth={2.2} />
      </div>

      <div className="flex flex-col text-left">
        <span
          className={cn(
            'text-[14px] font-bold leading-tight tracking-tight',
            isDarkTheme ? 'text-white' : 'text-brand-deep-teal'
          )}
        >
          Rida
        </span>
        <span
          className={cn(
            'text-[11px] font-normal leading-tight',
            isDarkTheme ? 'text-brand-soft-mint/80' : 'text-muted-foreground'
          )}
        >
          {subtitle}
        </span>
      </div>
    </div>
  )
}
