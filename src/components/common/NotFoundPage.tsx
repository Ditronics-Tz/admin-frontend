import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { Compass } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft-mint text-brand-deep-teal shadow-inner">
        <Compass className="h-8 w-8 animate-pulse text-primary" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        404
      </h1>
      <h2 className="mt-2 text-xl font-semibold text-foreground/90">Page Not Found</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The administration view you requested does not exist or has been relocated within
        the Rida platform.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button asChild variant="brand">
          <Link to={ROUTES.LOGIN}>Return to Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
