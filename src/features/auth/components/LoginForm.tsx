import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { PasswordInput } from './PasswordInput'
import { DemoAccessNotice } from './DemoAccessNotice'
import { LanguageSelector } from './LanguageSelector'
import { AccessHelpDialog } from './AccessHelpDialog'
import { createLoginSchema, type LoginFormValues } from '../schemas/authSchema'
import { useLogin } from '../hooks/useLogin'
import type { LoginTranslations } from '@/lib/constants/translations'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  t: LoginTranslations
}

export const LoginForm: React.FC<LoginFormProps> = ({ t }) => {
  const { isLoading, authError, clearAuthError, handleLogin } = useLogin(t)

  // Memoize schema with current localized validation messages
  const schema = useMemo(
    () =>
      createLoginSchema({
        emailRequired: t.emailRequired,
        emailInvalid: t.emailInvalid,
        passwordRequired: t.passwordRequired,
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      totpCode: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (values: LoginFormValues) => {
    await handleLogin(values)
  }

  return (
    <div className="w-full max-w-[340px] px-2 sm:px-0">
      {/* 6.3 Authorization Eyebrow */}
      <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-primary">
        {t.authEyebrow}
      </p>

      {/* 6.4 Login Heading */}
      <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.015em] text-[#172B36]">
        {t.authTitle}
      </h2>

      {/* 6.5 Supporting Description */}
      <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">{t.authSubtitle}</p>

      {/* Backend / Network Alert Banner */}
      {authError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-[6px] border border-destructive/20 bg-destructive/10 p-3 text-[12px] text-destructive animate-in fade-in-50"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium leading-snug">{authError}</p>
          </div>
        </div>
      )}

      {/* 7. Semantic Authentication Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-7 space-y-[18px]"
        aria-label="Admin Sign In Form"
      >
        {/* 7.1 Email Field */}
        <div className="space-y-[7px]">
          <label htmlFor="email" className="block text-[12px] font-medium text-slate-700">
            {t.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isLoading}
            className={cn(
              'flex h-[44px] w-full rounded-[6px] border bg-white px-3.5 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
              errors.email
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-[#CBD5E1] focus-visible:border-primary'
            )}
            {...register('email', {
              onChange: () => {
                if (authError) clearAuthError()
              },
            })}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="text-[11px] font-medium text-destructive animate-in fade-in-50"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* 7.2 Password Field */}
        <div className="space-y-[7px]">
          <label
            htmlFor="password"
            className="block text-[12px] font-medium text-slate-700"
          >
            {t.passwordLabel}
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={t.passwordPlaceholder}
            showPasswordLabel={t.passwordShow}
            hidePasswordLabel={t.passwordHide}
            hasError={Boolean(errors.password)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isLoading}
            {...register('password', {
              onChange: () => {
                if (authError) clearAuthError()
              },
            })}
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-[11px] font-medium text-destructive animate-in fade-in-50"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="totpCode" className="block text-xs font-medium text-slate-700">
            Authenticator code (if enabled)
          </label>
          <input
            id="totpCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={isLoading}
            {...register('totpCode')}
            className="h-11 w-full rounded-md border border-input px-3 text-sm"
            aria-describedby="totp-help"
          />
          <p id="totp-help" className="text-xs text-muted-foreground">
            Use the six-digit code from your authenticator app.
          </p>
          {errors.totpCode && (
            <p role="alert" className="text-xs text-destructive">
              {errors.totpCode.message}
            </p>
          )}
        </div>
        {/* 8. Sign-In Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[6px] bg-[#1C7C70] px-4 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#17695F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{t.submittingButton}</span>
              </>
            ) : (
              <>
                <span>{t.submitButton}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* 9. Demo Access Status Notice */}
      <DemoAccessNotice message={t.demoNotice} />

      {/* 10. Footer Controls (Language Selector + Access Denied Help) */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <LanguageSelector />
        <AccessHelpDialog t={t} />
      </div>
    </div>
  )
}
