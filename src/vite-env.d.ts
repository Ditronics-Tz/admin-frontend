/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_DEFAULT_LOCALE?: string
  readonly VITE_ENABLE_DEMO_MODE?: string
  readonly VITE_API_MODE?: 'mock' | 'live'
  readonly VITE_DOCUMENT_ORIGIN?: string
  readonly VITE_MAP_TILE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
