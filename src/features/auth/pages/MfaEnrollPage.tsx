import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BrandLogo } from '../components/BrandLogo'
import { AuthenticatorQr } from '../components/AuthenticatorQr'
import { OtpInput } from '../components/OtpInput'
import { RecoveryCodesPanel } from '../components/RecoveryCodesPanel'
import { authService, type MfaEnrollmentMaterial } from '../services/authService'
import { mfaFlow } from '../mfaFlow'
import { staffLandingPath } from '../landing'
import { tokenStorage } from '@/lib/api/client'
import { useAuthStore } from '@/stores/useAuthStore'
import type { AuthSession } from '@/types/auth'
import { ApiClientError, formatApiError } from '@/lib/api/errors'
import { LoadingFallback } from '@/components/feedback/LoadingFallback'

export default function MfaEnrollPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  // Keep this route's challenge stable after confirmation clears the pending
  // MFA flow. Re-reading it each render redirects the recovery-code step back
  // to login before the user can continue into the app.
  const [challenge] = useState(() => mfaFlow.read())
  const [material, setMaterial] = useState<MfaEnrollmentMaterial | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [expired, setExpired] = useState(mfaFlow.expired())
  const [ready, setReady] = useState<AuthSession & { recoveryCodes: string[] } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!challenge && status !== 'loading')
      navigate(user ? staffLandingPath(user) : '/login', { replace: true })
  }, [challenge, navigate, status, user])

  useEffect(() => {
    if (!challenge) return
    let cancelled = false
    authService
      .beginEnrollment(challenge.challengeToken)
      .then((pending) => {
        if (!cancelled) setMaterial(pending)
      })
      .catch((err) => {
        if (!cancelled) setError(formatApiError(err).message)
      })
    return () => {
      cancelled = true
    }
  }, [challenge])

  useEffect(() => {
    const timer = window.setInterval(() => setExpired(mfaFlow.expired()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function confirm(event: React.FormEvent) {
    event.preventDefault()
    const current = mfaFlow.read()
    if (!current || mfaFlow.expired()) {
      setExpired(true)
      return
    }
    setBusy(true)
    setError('')
    try {
      setReady(await authService.confirmEnrollment(current.challengeToken, code))
      mfaFlow.clear()
    } catch (err) {
      const apiErr = formatApiError(err)
      if (apiErr instanceof ApiClientError && apiErr.code === 'mfa_challenge_expired') setExpired(true)
      setError(apiErr.message || 'That code was not accepted.')
    } finally {
      setBusy(false)
    }
  }

  function continueToApp() {
    if (!ready?.accessToken || !ready.refreshToken) return
    tokenStorage.setSession(ready.accessToken, ready.refreshToken, true)
    queryClient.clear()
    setUser(ready.user)
    navigate(staffLandingPath(ready.user), { replace: true })
  }

  if (ready) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F5F7F8] px-6 py-10">
        <section className="w-full max-w-lg space-y-6">
          <BrandLogo />
          <h1 className="text-[26px] font-bold text-[#172B36]">Save your recovery codes</h1>
          <RecoveryCodesPanel codes={ready.recoveryCodes} />
          <button type="button" onClick={continueToApp} className="h-11 w-full rounded-md bg-[#1C7C70] text-sm font-semibold text-white">
            Continue
          </button>
        </section>
      </main>
    )
  }

  if (!challenge) return <LoadingFallback message="Restoring your session..." />

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#F5F7F8] px-6 py-10">
      <form onSubmit={(event) => void confirm(event)} className="w-full max-w-lg space-y-6">
        <BrandLogo />
        <div>
          <h1 className="text-[26px] font-bold text-[#172B36]">Set up two-factor authentication</h1>
          <p className="mt-2 text-sm text-[#64748B]">Protect your Rida account with an authenticator app.</p>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[#172B36]">
          <li>Open your authenticator app.</li>
          <li>Select Add Account.</li>
          <li>Choose Scan QR Code.</li>
          <li>Scan the QR code displayed here.</li>
          <li>Enter the six-digit code to complete setup.</li>
        </ol>
        {material && <AuthenticatorQr value={material.qr_code_url} />}
        {material && (
          <div className="space-y-2 rounded-xl bg-white p-4">
            <p className="text-sm">Manual setup key</p>
            <code className="block break-all text-sm">{material.secret}</code>
            <button
              type="button"
              className="text-sm text-[#1C7C70]"
              onClick={() => {
                void navigator.clipboard.writeText(material.secret).then(() => setCopied(true))
              }}
            >
              {copied ? 'Copied' : 'Copy setup key'}
            </button>
          </div>
        )}
        {expired ? (
          <p role="alert" className="text-sm text-destructive">
            This setup challenge expired. Return to sign in and start again.
          </p>
        ) : (
          <OtpInput value={code} onChange={setCode} disabled={busy || !material} invalid={Boolean(error)} />
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={busy || expired || code.length !== 6} className="h-11 flex-1 rounded-md bg-[#1C7C70] text-sm font-semibold text-white disabled:opacity-60">
            {busy ? 'Verifying...' : 'Verify and enable'}
          </button>
          <Link to="/login" onClick={() => mfaFlow.clear()} className="inline-flex h-11 items-center rounded-md border px-4 text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  )
}
