import React from 'react'
import { cn } from '@/lib/utils'

export type LogoMarkSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

interface RidaLogoMarkProps {
  size?: LogoMarkSize
  className?: string
  alt?: string
}

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', { px: number; classStr: string }> = {
  xs: { px: 24, classStr: 'h-6 w-6' },
  sm: { px: 32, classStr: 'h-8 w-8' },
  md: { px: 36, classStr: 'h-9 w-9' },
  lg: { px: 44, classStr: 'h-11 w-11' },
  xl: { px: 56, classStr: 'h-14 w-14' },
}

/**
 * Official Rida Brand Emblem Mark
 * Displays the authentic soft-mint rounded squircle with the dark-teal stylized 'R' mobility ribbon
 */
export const RidaLogoMark: React.FC<RidaLogoMarkProps> = ({
  size = 'md',
  className,
  alt = 'Rida',
}) => {
  const isPreset = typeof size === 'string' && size in SIZE_MAP
  const sizeConfig = isPreset ? SIZE_MAP[size as keyof typeof SIZE_MAP] : null
  const numericSize = typeof size === 'number' ? size : sizeConfig?.px || 36

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%]',
        sizeConfig?.classStr,
        className
      )}
      style={!sizeConfig ? { width: `${numericSize}px`, height: `${numericSize}px` } : undefined}
      aria-label={alt}
    >
      <img
        src="/brand/rida-icon-transparent.png"
        alt={alt}
        width={numericSize}
        height={numericSize}
        className="h-full w-full object-contain select-none"
        loading="eager"
        decoding="sync"
      />
    </div>
  )
}
