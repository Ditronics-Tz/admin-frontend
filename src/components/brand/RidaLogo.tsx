import React from 'react'
import { RidaLogoMark, type LogoMarkSize } from './RidaLogoMark'
import { cn } from '@/lib/utils'

export interface RidaLogoProps {
  subtitle?: string
  className?: string
  isDarkTheme?: boolean
  markSize?: LogoMarkSize
  collapsed?: boolean
  showSubtitle?: boolean
  useImageFull?: boolean
}

/**
 * Official Rida Brand Logo
 * Combines the authentic Rida squircle mark and brand wordmark.
 * Supports light/dark themes, collapsed states, and customizable subtitles.
 */
export const RidaLogo: React.FC<RidaLogoProps> = ({
  subtitle = 'Operations console',
  className,
  isDarkTheme = true,
  markSize = 'md',
  collapsed = false,
  showSubtitle = true,
  useImageFull = false,
}) => {
  if (collapsed) {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>
        <RidaLogoMark size={markSize} alt="Rida Admin" />
        <span className="sr-only">Rida</span>
      </div>
    )
  }

  if (useImageFull && isDarkTheme) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        <img
          src="/brand/rida-logo-transparent.png"
          alt="Rida Operations console"
          className="h-10 w-auto object-contain select-none"
          loading="eager"
        />
      </div>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <RidaLogoMark size={markSize} alt="Rida" />

      <div className="flex flex-col text-left justify-center">
        <span
          className={cn(
            'text-[17px] font-bold leading-tight tracking-[-0.02em]',
            isDarkTheme ? 'text-white' : 'text-brand-deep-teal'
          )}
        >
          Rida
        </span>
        {showSubtitle && subtitle && (
          <span
            className={cn(
              'text-[11px] font-medium leading-tight tracking-normal mt-0.5',
              isDarkTheme ? 'text-brand-soft-mint/80' : 'text-slate-500'
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
