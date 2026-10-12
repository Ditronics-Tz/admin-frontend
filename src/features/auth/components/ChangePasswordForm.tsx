import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '../services/authService'
import { PasswordInput } from './PasswordInput'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'

export function ChangePasswordForm() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password !== confirm) {
      setError(new Error('The new passwords must match.'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await authService.changePassword(current, password)
      toast.success('Password changed. Sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <p className="text-sm text-muted-foreground">
        Use at least 12 characters. Changing your password ends your refresh sessions; you
        will sign in again.
      </p>
      {error != null && <QueryError error={error} />}
      <label className="block space-y-2 text-sm">
        Current password
        <PasswordInput
          required
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          disabled={busy}
        />
      </label>
      <label className="block space-y-2 text-sm">
        New password
        <PasswordInput
          required
          minLength={12}
          maxLength={72}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />
      </label>
      <label className="block space-y-2 text-sm">
        Confirm new password
        <PasswordInput
          required
          minLength={12}
          maxLength={72}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={busy}
        />
      </label>
      <Button disabled={busy} type="submit">
        {busy ? 'Changing password…' : 'Change password'}
      </Button>
    </form>
  )
}
