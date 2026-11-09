import React, { useEffect } from 'react'
import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './router/AppRouter'
import { ErrorScreen } from '@/components/feedback/ErrorScreen'
import { CHUNK_RELOAD_KEY } from '@/lib/chunk-error'

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorScreen
          title="Something went wrong"
          detail="The admin app hit an unexpected error."
          technical={this.state.error.message}
          onRetry={() => window.location.reload()}
        />
      )
    }
    return this.props.children
  }
}

function ChunkReloadReset() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      } catch {
        // Session storage can be blocked. A later failed load still shows the error screen.
      }
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [])
  return null
}

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <ChunkReloadReset />
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  )
}

export default App
