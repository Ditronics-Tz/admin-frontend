import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  authService,
  type PendingAuthenticator,
} from '@/features/auth/services/authService'
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/feedback/QueryError'
import { ConfirmDialog } from '@/components/common/ReasonDialog'
import { useShipText } from '@/components/common/ship-text'
import { formatDateTime } from '@/lib/utils/formatters'

export function SecuritySettings() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const t = useShipText()
  const [setup, setSetup] = useState<PendingAuthenticator | null>(null)
  const [operation, setOperation] = useState<'setup' | 'disable' | null>(null)
  const [confirm, setConfirm] = useState<'activate' | 'disable' | 'logout' | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!setup) return
    const expiresAt = Date.parse(setup.pending_expires_at)
    const check = () => setExpired(!Number.isFinite(expiresAt) || Date.now() >= expiresAt)
    check()
    const timer = window.setInterval(check, 1000)
    return () => window.clearInterval(timer)
  }, [setup])

  function reset() {
    setSetup(null)
    setOperation(null)
    setConfirm(null)
    setCode('')
    setPassword('')
    setError(null)
    setExpired(false)
  }
  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }
  async function proveIdentity(event: FormEvent) {
    event.preventDefault()
    if (operation === 'disable') {
      setConfirm('disable')
      return
    }
    await run(async () => {
      const pending = await authService.setup2FA(password, code)
      setSetup(pending)
      setOperation(null)
      setPassword('')
      setCode('')
      setExpired(Date.now() >= Date.parse(pending.pending_expires_at))
    })
  }
  async function completeAction() {
    if (confirm === 'activate' && expired) {
      setError(new Error(t('Authenticator setup expired. Start setup again.')))
      return
    }
    await run(async () => {
      if (confirm === 'logout') {
        await authService.logoutAll()
        navigate('/login', { replace: true })
        return
      }
      const updated =
        confirm === 'disable'
          ? await authService.disable2FA(password, code)
          : await authService.verify2FA(code)
      setUser(updated)
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      reset()
      toast.success(t('Two-factor authentication updated. Other sessions ended.'))
    })
  }
  const setupLabel = user?.totpEnabled ? 'Replace authenticator' : 'Set up authenticator'
  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">{t('Your account')}</h2>
        <p className="text-sm">
          {user?.fullName} · {user?.email} · {user?.role}
        </p>
        <h3 className="font-semibold">
          {t('Two-factor authentication')}:{' '}
          {t(user?.totpEnabled ? 'Enabled' : 'Disabled')}
        </h3>
        <p className="max-w-xl text-sm text-muted-foreground">
          {t('An authenticator code is required at sign in when enabled.')}
        </p>
        {error != null && !confirm && <QueryError error={error} />}
        {!setup && !operation && (
          <div className="flex flex-wrap gap-3">
            <Button disabled={busy} onClick={() => setOperation('setup')}>
              {t(setupLabel)}
            </Button>
            {user?.totpEnabled && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setOperation('disable')}
              >
                {t('Disable two-factor authentication')}
              </Button>
            )}
          </div>
        )}
        {operation && (
          <form onSubmit={proveIdentity} className="max-w-md space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('Confirm your current credentials to change account security.')}
            </p>
            <label className="block space-y-2 text-sm">
              {t('Current password')}
              <PasswordInput
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
            </label>
            {user?.totpEnabled && (
              <label className="block space-y-2 text-sm">
                {t('Current authenticator code')}
                <Input
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={busy}
                />
              </label>
            )}
            <div className="flex gap-3">
              <Button disabled={busy} type="submit">
                {t(
                  operation === 'disable'
                    ? 'Disable two-factor authentication'
                    : setupLabel
                )}
              </Button>
              <Button disabled={busy} type="button" variant="outline" onClick={reset}>
                {t('Cancel')}
              </Button>
            </div>
          </form>
        )}
        {setup && (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (!expired) setConfirm('activate')
            }}
            className="max-w-xl space-y-4"
          >
            <div className="space-y-3 rounded-lg bg-muted p-4">
              <p className="text-sm">
                {t('Add this setup key to your authenticator app. Keep the key private.')}
              </p>
              {user?.totpEnabled && (
                <p className="text-sm">
                  {t(
                    'Your current authenticator stays active until you activate the replacement.'
                  )}
                </p>
              )}
              <p className="text-sm">
                {t('Setup expires (EAT)')}: {formatDateTime(setup.pending_expires_at)}
              </p>
              {!expired && (
                <>
                  <code className="block select-all break-all">{setup.secret}</code>
                  <details>
                    <summary className="cursor-pointer text-sm">
                      {t('Authenticator setup URI')}
                    </summary>
                    <code className="mt-2 block break-all text-xs">
                      {setup.qr_code_url}
                    </code>
                  </details>
                </>
              )}
            </div>
            {expired ? (
              <p role="status" className="text-sm">
                {t('Authenticator setup expired. Start setup again.')}
              </p>
            ) : (
              <label className="block max-w-md space-y-2 text-sm">
                {t('New authenticator code')}
                <Input
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={busy}
                />
              </label>
            )}
            <div className="flex gap-3">
              <Button disabled={busy || expired} type="submit">
                {t('Verify and enable')}
              </Button>
              <Button disabled={busy} type="button" variant="outline" onClick={reset}>
                {t(expired ? 'Start again' : 'Cancel')}
              </Button>
            </div>
          </form>
        )}
      </section>
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">{t('Change password')}</h2>
        <ChangePasswordForm />
      </section>
      <section className="space-y-3 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">{t('Sessions')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('Sign out on every device, including this one.')}
        </p>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            setError(null)
            setConfirm('logout')
          }}
        >
          {t('Sign out on all devices')}
        </Button>
      </section>
      {confirm && (
        <ConfirmDialog
          title={t(
            confirm === 'logout'
              ? 'Sign out on all devices'
              : confirm === 'disable'
                ? 'Disable two-factor authentication'
                : 'Verify and enable'
          )}
          description={t(
            confirm === 'logout'
              ? 'Sign out on every device, including this one.'
              : 'This change ends other sessions. Your current session stays signed in.'
          )}
          pending={busy}
          error={error}
          onClose={() => {
            setConfirm(null)
            setError(null)
          }}
          onConfirm={() => void completeAction()}
        />
      )}
    </div>
  )
}
