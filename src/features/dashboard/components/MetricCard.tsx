import React from 'react'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  change?: {
    value: string
    isPositive: boolean
    period: string
  }
  subtext?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  change,
  subtext,
}) => {
  return (
    <Card className="shadow-xs rounded-xl border border-slate-200/80 bg-white p-5 transition-shadow hover:shadow-sm">
      <CardContent className="space-y-3 p-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tracking-tight text-[#64748B]">
            {label}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-brand-primary-teal">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div>
          <h4 className="text-2xl font-bold tracking-tight text-[#172B36]">{value}</h4>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                change.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              )}
            >
              {change.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change.value}</span>
            </span>
          )}

          <span className="truncate text-[11px] text-muted-foreground">
            {change ? change.period : subtext}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
