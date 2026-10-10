import React from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DemoAccessNoticeProps {
  message: string
  className?: string
}

/**
 * DemoAccessNotice component per Section 9
 * Provides a clean, subtle informational preview status without insecure credential bypasses.
 */
export const DemoAccessNotice: React.FC<DemoAccessNoticeProps> = ({
  message,
  className,
}) => {
  return (
    <div
      role="note"
      aria-label="System status notice"
      className={cn(
        'mt-3.5 flex items-center justify-center gap-1.5 rounded-[6px] border border-slate-200/80 bg-slate-100/70 px-3 py-2 text-center text-[11px] text-muted-foreground',
        className
      )}
    >
      <Info className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
