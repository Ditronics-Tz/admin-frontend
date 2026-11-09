import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { errorText, isChunkLoadError } from '@/lib/chunk-error'
import { ErrorScreen } from './ErrorScreen'

export function RouteErrorPage() {
  const error = useRouteError()
  const technical = routeMessage(error)
  const chunk = isChunkLoadError(error)
  return (
    <ErrorScreen
      title={chunk ? 'This screen failed to load' : 'Something went wrong'}
      detail={
        chunk
          ? 'The admin app was updated, or a page file is missing. A reload picks up the current version.'
          : 'This screen hit an unexpected error.'
      }
      technical={technical}
      onRetry={() => window.location.reload()}
    />
  )
}

function routeMessage(error: unknown) {
  if (isRouteErrorResponse(error)) return error.statusText || `${error.status}`
  return errorText(error)
}
