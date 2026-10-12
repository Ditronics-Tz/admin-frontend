import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/features/auth/services/authService'
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/feedback/QueryError'

export function SecuritySettings() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [setup, setSetup] = useState<{ secret: string; qr_code_url: string } | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)
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
  async function update2FA(event: FormEvent) {
    event.preventDefault()
    await run(async () => {
      if (user?.totpEnabled) await authService.disable2FA(password, code)
      else await authService.verify2FA(code)
      setUser(await authService.getCurrentUser())
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      setSetup(null)
      setCode('')
      setPassword('')
      toast.success('Two-factor authentication updated.')
    })
  }
  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Your account</h2>
        <p className="text-sm">
          {user?.fullName} · {user?.email} · {user?.role}
        </p>
        <h3 className="font-semibold">
          Two-factor authentication: {user?.totpEnabled ? 'Enabled' : 'Disabled'}
        </h3>
        <p className="max-w-xl text-sm text-muted-foreground">
          An authenticator code is required at sign in when enabled. Your server may
          require this before staff management and audit access.
        </p>
        {error != null && <QueryError error={error} />}
        {!user?.totpEnabled && !setup && (
          <Button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                setSetup(await authService.setup2FA())
              })
            }
          >
            Set up authenticator
          </Button>
        )}
        {setup && (
          <div className="max-w-xl space-y-3 rounded-lg bg-muted p-4">
            <p className="text-sm">
              Add this setup key to your authenticator app, then enter its code below.
              Keep the key private.
            </p>
            <code className="block select-all break-all">{setup.secret}</code>
            <details>
              <summary className="cursor-pointer text-sm">
                Authenticator setup URI
              </summary>
              <code className="mt-2 block break-all text-xs">{setup.qr_code_url}</code>
            </details>
          </div>
        )}
        {(setup || user?.totpEnabled) && (
          <form onSubmit={update2FA} className="max-w-md space-y-4">
            {user?.totpEnabled && (
              <label className="block space-y-2 text-sm">
                Current password
                <PasswordInput
                  required
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
              </label>
            )}
            <label className="block space-y-2 text-sm">
              Authenticator code
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
            <Button
              disabled={busy}
              variant={user?.totpEnabled ? 'destructive' : 'default'}
              type="submit"
            >
              {user?.totpEnabled
                ? 'Disable two-factor authentication'
                : 'Verify and enable'}
            </Button>
          </form>
        )}
      </section>
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <ChangePasswordForm />
      </section>
      <section className="space-y-3 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Sessions</h2>
        <p className="text-sm text-muted-foreground">
          End all refresh sessions on your account. Issued access tokens expire within
          their configured lifetime.
        </p>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await authService.logoutAll()
              navigate('/login', { replace: true })
            })
          }
        >
          Sign out on all devices
        </Button>
      </section>
    </div>
  )
}
