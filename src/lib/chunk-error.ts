export const CHUNK_RELOAD_KEY = 'rida:chunk-reload'

export function isChunkLoadError(error: unknown): boolean {
  return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk|ChunkLoadError/i.test(
    errorText(error)
  )
}

export function errorText(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  return 'Unexpected application error'
}

export function markChunkReload(): boolean {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return false
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
    return true
  } catch {
    return false
  }
}
