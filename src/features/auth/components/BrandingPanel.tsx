import React from 'react'
import { BrandLogo } from './BrandLogo'
import type { LoginTranslations } from '@/lib/constants/translations'

interface BrandingPanelProps {
  t: LoginTranslations
}

/**
 * Left branding panel for desktop/tablet screens
 * Follows Section 5 design specifications:
 * - Solid #173B3B background
 * - Top-left Brand Header
 * - Subtle circular geometric outlines in upper-right
 * - Vertically composed welcome headline and subtitle
 * - Three horizontal progress indicators
 */
export const BrandingPanel: React.FC<BrandingPanelProps> = ({ t }) => {
  return (
    <section
      aria-label="Rida Platform Introduction"
      className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-brand-deep-teal p-8 text-white lg:p-12"
    >
      {/* 5.3 Subtle Outlined Decorative Circles in Upper-Right Region */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-[320px] w-[320px] rounded-full border border-white/[0.08]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-6 top-12 h-[240px] w-[240px] rounded-full border border-brand-soft-mint/[0.08]"
        aria-hidden="true"
      />

      {/* 5.2 Brand Header */}
      <div className="relative z-10">
        <BrandLogo subtitle={t.brandSubtitle} isDarkTheme={true} />
      </div>

      {/* 5.4 Welcome Content (Positioned slightly below vertical center) */}
      <div className="relative z-10 my-auto max-w-lg py-12">
        {/* Eyebrow Label */}
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-brand-soft-mint">
          {t.locationEyebrow}
        </p>

        {/* Main Headline */}
        <h1 className="mt-3 text-3xl font-bold leading-[1.18] tracking-[-0.02em] text-white sm:text-4xl lg:text-[38px]">
          {t.welcomeHeadline}
        </h1>

        {/* Supporting Text */}
        <p className="mt-3.5 text-sm font-normal text-brand-soft-mint/90 sm:text-[14px]">
          {t.welcomeSubtitle}
        </p>

        {/* 5.5 Static Progress Indicators */}
        <div
          className="mt-8 flex items-center gap-1.5"
          role="presentation"
          aria-hidden="true"
        >
          <span className="h-1 w-[34px] rounded-full bg-brand-soft-mint transition-all" />
          <span className="h-1 w-[14px] rounded-full bg-brand-soft-mint/30 transition-all" />
          <span className="h-1 w-[14px] rounded-full bg-brand-soft-mint/30 transition-all" />
        </div>
      </div>

      {/* Subtle bottom note for layout balance */}
      <div className="relative z-10 text-[11px] font-normal text-brand-soft-mint/50">
        <span>
          © {new Date().getFullYear()} Rida Tanzania. Operations Administration.
        </span>
      </div>
    </section>
  )
}
