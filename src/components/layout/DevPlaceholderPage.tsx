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
import { ArrowLeft, Clock, ShieldCheck, Layers } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface DevPlaceholderPageProps {
  moduleTitle: string
  moduleDescription: string
  plannedPhase?: string
}

export const DevPlaceholderPage: React.FC<DevPlaceholderPageProps> = ({
  moduleTitle,
  moduleDescription,
  plannedPhase = 'Phase 4+',
}) => {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172B36] sm:text-3xl">
              {moduleTitle}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              <Clock className="h-3 w-3 text-primary" />
              {plannedPhase}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#64748B] sm:text-sm">{moduleDescription}</p>
        </div>

        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to={ROUTES.DASHBOARD} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Main Section Shell */}
      <Card className="shadow-xs rounded-xl border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#172B36]">
            {moduleTitle} Administration Workspace
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Architecture shell wired into the central navigation and routing tree.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
            <div className="shadow-xs flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft-mint text-brand-deep-teal">
              <Layers className="h-6 w-6 text-primary" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[#172B36]">
              {moduleTitle} Module Ready for Workflows
            </h3>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#64748B]">
              This route is fully linked in the Rida sidebar navigation. Domain-specific
              tables, filters, and API integrations will be implemented in subsequent
              phases.
            </p>

            <div className="shadow-xs mt-5 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-brand-deep-teal">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="font-medium">RBAC Security & Layout Shell Configured</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
