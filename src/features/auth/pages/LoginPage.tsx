import React from 'react'
import { Navigate } from 'react-router-dom'
import { BrandingPanel } from '../components/BrandingPanel'
import { BrandLogo } from '../components/BrandLogo'
import { LoginForm } from '../components/LoginForm'
import { useUiStore } from '@/stores/useUiStore'
import { LOGIN_TRANSLATIONS } from '@/lib/constants/translations'
import { useAuthStore } from '@/stores/useAuthStore'
import { staffLandingPath } from '../landing'
import { LoadingFallback } from '@/components/feedback/LoadingFallback'

/**
 * Rida Admin Login Page
 *
 * Implements a pixel-accurate, minimalistic two-column split-screen layout:
 * - Desktop: Left 52.5% dark-teal branding panel, Right 47.5% off-white authentication panel
 * - Mobile: Unified single-column with compact branding header and full-width authentication section
 * - 100dvh full viewport height without floating cards or outer borders
 */
export const LoginPage: React.FC = () => {
  const { locale } = useUiStore()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const t = LOGIN_TRANSLATIONS[locale] || LOGIN_TRANSLATIONS.en

  if (status === 'loading') return <LoadingFallback message="Restoring your session..." />
  if (user) return <Navigate to={staffLandingPath(user)} replace />

  return (
    <main className="flex min-h-[100dvh] w-full flex-col lg:flex-row">
      {/* 11.4 Mobile Top Header: Compact Dark-Teal Brand Banner */}
      <header className="flex items-center justify-between border-b border-brand-primary-teal/20 bg-brand-deep-teal px-6 py-4 lg:hidden">
        <BrandLogo subtitle={t.brandSubtitle} isDarkTheme={true} />
        <span className="rounded-full bg-brand-soft-mint/20 px-2.5 py-0.5 text-[10px] font-semibold text-brand-soft-mint">
          Tanzania
        </span>
      </header>

      {/* 5. Left Panel: Desktop Branding Section (~52.5% width on lg screens) */}
      <div className="hidden lg:flex lg:min-h-[100dvh] lg:w-[52.5%]">
        <BrandingPanel t={t} />
      </div>

      {/* 6. Right Panel: Authentication Section (~47.5% width on lg screens) */}
      <section
        aria-label="Admin Sign In"
        className="flex flex-1 flex-col items-center justify-center bg-[#F5F7F8] px-6 py-10 sm:px-10 lg:min-h-[100dvh] lg:w-[47.5%] lg:px-12"
      >
        <LoginForm t={t} />
      </section>
    </main>
  )
}

export default LoginPage
