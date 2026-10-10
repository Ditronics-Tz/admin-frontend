import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

interface AppProvidersProps {
  children: React.ReactNode
}

/**
 * Global App Providers:
 * - TanStack QueryClientProvider for server state cache
 * - Sonner Toaster for accessible notification alerts
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // Use state to guarantee single QueryClient instance per React application lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (garbage collection)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'font-sans text-sm',
        }}
      />
    </QueryClientProvider>
  )
}
