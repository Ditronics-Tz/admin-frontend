import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ROUTES, APP_CONFIG } from '@/lib/constants'
import { formatTZS, formatDateTime } from '@/lib/utils/formatters'
import {
  Bike,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
  Globe2,
  Coins,
  Clock,
} from 'lucide-react'

export const LoginPage: React.FC = () => {
  const currentTime = new Date()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decorative Gradient Subtle Effect */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(28,124,112,0.15),rgba(255,255,255,0))]"
        aria-hidden="true"
      />

      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-deep-teal text-white shadow-lg shadow-brand-deep-teal/20 transition-transform duration-200 hover:scale-105"
            aria-label="PikiPiki Brand Icon"
          >
            <Bike className="h-9 w-9 text-brand-soft-mint" />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-deep-teal sm:text-4xl">
            {APP_CONFIG.name}
          </h1>
          <p className="mt-1 text-base font-medium text-primary">{APP_CONFIG.tagline}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-brand-soft-mint/60 px-3 py-1 text-xs font-semibold text-brand-deep-teal">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>Frontend foundation ready.</span>
          </div>
        </div>

        {/* Phase 1 Overview Card */}
        <Card className="border-border/80 shadow-md">
          <CardHeader className="pb-3 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Phase 1 Initialization
              </span>
              <span className="rounded bg-brand-soft-mint px-2 py-0.5 text-[11px] font-semibold text-brand-deep-teal">
                v{APP_CONFIG.version}
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Architecture & System Verification
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Core frontend dependencies, design tokens, routing, state management, and
              tooling initialized.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <Separator />

            {/* Environmental & Localization Parameters */}
            <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
              <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <Globe2 className="h-3.5 w-3.5 text-primary" />
                  <span>Market</span>
                </div>
                <p className="mt-1 font-semibold text-foreground">Tanzania (TZ)</p>
              </div>

              <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <Coins className="h-3.5 w-3.5 text-primary" />
                  <span>Currency</span>
                </div>
                <p className="mt-1 font-semibold text-foreground">{formatTZS(10000)}</p>
              </div>

              <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Timezone</span>
                </div>
                <p className="mt-1 font-semibold text-foreground">
                  {formatDateTime(currentTime, 'HH:mm (zzz)')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Architectural Highlights */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Foundation Checklist
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-foreground/90">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>React 19 + TypeScript Strict</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Tailwind CSS + Design Tokens</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Zustand Client Store</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>TanStack Server Query Cache</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Axios API + Interceptors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>shadcn/ui Primitives</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Test Navigation to Registered Modular Routes */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Registered Routes Preview
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Dev Preview Active
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.DRIVERS}>Drivers</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.RIDES}>Rides</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.PAYMENTS}>Payments</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.CUSTOMERS}>Customers</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-center text-xs text-muted-foreground">
              <span>Next Phase: </span>
              <strong className="text-foreground">
                Phase 2 — Pixel-Accurate PikiPiki Login Page Implementation
              </strong>
            </div>

            <Button asChild variant="brand" className="w-full">
              <Link
                to={ROUTES.DASHBOARD}
                className="inline-flex items-center justify-center gap-2"
              >
                Explore Dashboard Route Preview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
export default LoginPage
