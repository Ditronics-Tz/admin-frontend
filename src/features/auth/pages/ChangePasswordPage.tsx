import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto w-full max-w-xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">Change your temporary password</h1>
      <p>Update your password before continuing to the admin console.</p>
      <ChangePasswordForm />
      <Button variant="ghost" onClick={() => useAuthStore.getState().logout()}>
        Return to sign in
      </Button>
    </main>
  )
}
