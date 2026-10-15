import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BrandLogo } from '../components/BrandLogo'
import { OtpInput } from '../components/OtpInput'
import { authService } from '../services/authService'
import { mfaFlow } from '../mfaFlow'
import { staffLandingPath } from '../landing'
import { useAuthStore } from '@/stores/useAuthStore'
import { ApiClientError, formatApiError } from '@/lib/api/errors'
import { LoadingFallback } from '@/components/feedback/LoadingFallback'

export default function MfaVerifyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  // Snapshot the challenge for this route visit. It is cleared after a
  // successful verification; reading it on every render would then make the
  // guard below mistake the completed flow for a page opened without a login.
  const [challenge] = useState(() => mfaFlow.read())
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState('')
  const [expired, setExpired] = useState(mfaFlow.expired())
  const [secondsLeft, setSecondsLeft] = useState(30)

  useEffect(() => {
    if (!challenge && status !== 'loading')
      navigate(user ? staffLandingPath(user) : '/login', { replace: true })
  }, [challenge, navigate, status, user])
  useEffect(() => {
    if (!challenge) return
    // The destination is lazy-loaded. Fetch it while the user enters the code
    // so a successful verification does not leave the OTP page on screen.
    void Promise.all([
      import('@/components/layout/AdminLayout'),
      import('@/features/dashboard/pages/DashboardPage'),
      import('@/features/support/pages/SupportPage'),
      import('@/features/auth/pages/ChangePasswordPage'),
    ]).catch(() => {
      // Navigation handles a failed destination load.
    })
  }, [challenge])
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft(30 - (Math.floor(Date.now() / 1000) % 30))
      setExpired(mfaFlow.expired())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const current = mfaFlow.read()
    if (!current || mfaFlow.expired()) {
      setExpired(true)
      return
    }
    setBusy(true)
    setError('')
    try {
      const session = recovery
        ? await authService.verifyRecoveryCode(current.challengeToken, recoveryCode)
        : await authService.verifyMfa(current.challengeToken, code)
      setFinishing(true)
      mfaFlow.clear()
      queryClient.clear()
      setUser(session.user)
      navigate(staffLandingPath(session.user), { replace: true })
    } catch (err) {
      setFinishing(false)
      const apiErr = formatApiError(err)
      if (apiErr instanceof ApiClientError && apiErr.code === 'mfa_challenge_expired') setExpired(true)
      setError(apiErr.message || 'That code was not accepted.')
    } finally {
      setBusy(false)
    }
  }

  if (!challenge) return <LoadingFallback message="Restoring your session..." />
  if (finishing) return <LoadingFallback message="Opening your workspace..." />
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#F5F7F8] px-6">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-md space-y-6">
        <BrandLogo />
        <div>
          <h1 className="text-[26px] font-bold text-[#172B36]">Two-step verification</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Enter the 6-digit code from your authenticator app. The code refreshes every 30 seconds.
          </p>
        </div>
        {expired ? (
          <p role="alert" className="text-sm text-destructive">
            This sign-in challenge expired. Return to sign in and try again.
          </p>
        ) : recovery ? (
          <label className="block space-y-2 text-sm">
            Recovery code
            <input
              autoFocus
              value={recoveryCode}
              onChange={(event) => setRecoveryCode(event.target.value)}
              autoComplete="off"
              className="h-11 w-full rounded-md border px-3"
              disabled={busy}
            />
          </label>
        ) : (
          <div className="space-y-3">
            <OtpInput value={code} onChange={setCode} disabled={busy} invalid={Boolean(error)} />
            <p className="text-center text-xs text-[#64748B]">Code refreshes in {secondsLeft}s</p>
          </div>
        )}
        {error && !expired && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || expired || (recovery ? recoveryCode.trim().length < 8 : code.length !== 6)}
          className="h-11 w-full rounded-md bg-[#1C7C70] text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Verifying...' : 'Verify'}
        </button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" className="text-[#1C7C70]" onClick={() => setRecovery((value) => !value)}>
            {recovery ? 'Use authenticator code' : 'Use a recovery code'}
          </button>
          <Link to="/login" onClick={() => mfaFlow.clear()} className="text-[#64748B]">
            Back to login
          </Link>
        </div>
      </form>
    </main>
  )
}
