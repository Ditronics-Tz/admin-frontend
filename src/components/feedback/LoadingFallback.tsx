import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingFallbackProps {
  message?: string
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading module...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center"
    >
      <Loader2
        className="h-9 w-9 animate-spin text-primary transition-all duration-300"
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}
