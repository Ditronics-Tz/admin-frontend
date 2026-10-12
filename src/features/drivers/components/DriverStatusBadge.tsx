import React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  getAccountStatusLabel,
  getVerificationStatusLabel,
  getAvailabilityStatusLabel,
} from '../utils/driver-formatters'
import type {
  DriverAccountStatus,
  DriverVerificationStatus,
  DriverAvailabilityStatus,
} from '../types/driver.types'
import { cn } from '@/lib/utils'

interface DriverAccountStatusBadgeProps {
  status: DriverAccountStatus
  className?: string
}

export const DriverAccountStatusBadge: React.FC<DriverAccountStatusBadgeProps> = ({
  status,
  className,
}) => {
  switch (status) {
    case 'active':
      return (
        <Badge
          variant="success"
          className={cn('border-emerald-200 bg-emerald-50 text-emerald-700', className)}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {getAccountStatusLabel(status)}
        </Badge>
      )
    case 'suspended':
      return (
        <Badge
          variant="destructive"
          className={cn('border-rose-200 bg-rose-50 text-rose-700', className)}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          {getAccountStatusLabel(status)}
        </Badge>
      )
    case 'deactivated':
      return (
        <Badge variant="muted" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
          {getAccountStatusLabel(status)}
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

interface DriverVerificationBadgeProps {
  status: DriverVerificationStatus
  className?: string
}

export const DriverVerificationBadge: React.FC<DriverVerificationBadgeProps> = ({
  status,
  className,
}) => {
  switch (status) {
    case 'approved':
      return (
        <Badge
          variant="success"
          className={cn('border-emerald-200 bg-emerald-50 text-emerald-700', className)}
        >
          {getVerificationStatusLabel(status)}
        </Badge>
      )
    case 'submitted':
    case 'under_review':
      return (
        <Badge
          variant="warning"
          className={cn('border-amber-200 bg-amber-50 text-amber-700', className)}
        >
          {getVerificationStatusLabel(status)}
        </Badge>
      )
    case 'rejected':
    case 'suspended':
      return (
        <Badge
          variant="destructive"
          className={cn('border-red-200 bg-red-50 text-red-700', className)}
        >
          {getVerificationStatusLabel(status)}
        </Badge>
      )
    case 'expired':
      return (
        <Badge
          variant="warning"
          className={cn('border-orange-200 bg-orange-50 text-orange-700', className)}
        >
          {getVerificationStatusLabel(status)}
        </Badge>
      )
    case 'pending_documents':
      return (
        <Badge variant="muted" className={className}>
          {getVerificationStatusLabel(status)}
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

interface DriverAvailabilityBadgeProps {
  status: DriverAvailabilityStatus
  className?: string
}

export const DriverAvailabilityBadge: React.FC<DriverAvailabilityBadgeProps> = ({
  status,
  className,
}) => {
  switch (status) {
    case 'online':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700',
            className
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {getAvailabilityStatusLabel(status)}
        </span>
      )
    case 'on_trip':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium text-sky-700',
            className
          )}
        >
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          {getAvailabilityStatusLabel(status)}
        </span>
      )
    case 'offline':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium text-slate-500',
            className
          )}
        >
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          {getAvailabilityStatusLabel(status)}
        </span>
      )
    case 'unavailable':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium text-amber-700',
            className
          )}
        >
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          {getAvailabilityStatusLabel(status)}
        </span>
      )
    default:
      return <span className="text-xs text-slate-500">{status}</span>
  }
}
