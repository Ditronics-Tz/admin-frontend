import React from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface DevPlaceholderPageProps {
  moduleTitle: string
  moduleDescription: string
  plannedPhase?: string
}

export const DevPlaceholderPage: React.FC<DevPlaceholderPageProps> = ({
  moduleTitle,
  moduleDescription,
  plannedPhase = 'Phase 3+',
}) => {
  return (
    <div className="flex min-h-[calc(100vh-2.5rem)] items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl border-border/80 shadow-md">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Clock className="h-4 w-4" />
            <span>Planned Module • {plannedPhase}</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {moduleTitle}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {moduleDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="flex items-start gap-3 rounded-md border border-brand-soft-mint/60 bg-brand-soft-mint/20 p-4 text-xs text-foreground/80">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-brand-deep-teal">
                Architectural Foundation Ready
              </p>
              <p className="mt-0.5">
                This route is wired into the central router and route guard
                infrastructure. Component implementation and live API integration will
                occur in subsequent phases.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login Screen
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">PikiPiki Admin v1.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
