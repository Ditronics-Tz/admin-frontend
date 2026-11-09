import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { isChunkLoadError, markChunkReload } from './chunk-error'

export function lazyRetry<T extends ComponentType<Record<string, unknown>>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((error: unknown) => {
      if (isChunkLoadError(error) && markChunkReload()) {
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    })
  )
}
