/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_DEFAULT_LOCALE?: string
  readonly VITE_ENABLE_DEMO_MODE?: string
  readonly VITE_API_MODE?: 'mock' | 'live'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
