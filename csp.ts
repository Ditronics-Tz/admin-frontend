import type { Plugin } from 'vite'

function origin(value?: string) {
  if (!value) return ''
  try {
    const url = new URL(value)
    if (
      url.protocol === 'https:' ||
      (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
    )
      return url.origin
  } catch {
    /* A relative API URL uses self. */
  }
  return ''
}

export function productionCsp(): Plugin {
  let api = '',
    documents = '',
    tiles = 'https://tile.openstreetmap.org'
  return {
    name: 'rida-production-csp',
    apply: 'build',
    configResolved(config) {
      api = origin(config.env.VITE_API_BASE_URL)
      documents = origin(config.env.VITE_DOCUMENT_ORIGIN)
      tiles = origin(config.env.VITE_MAP_TILE_URL) || tiles
    },
    transformIndexHtml() {
      const connect = Array.from(
        new Set(["'self'", api, documents].filter(Boolean))
      ).join(' ')
      const images = Array.from(
        new Set(["'self'", 'blob:', api, documents, tiles].filter(Boolean))
      ).join(' ')
      return [
        {
          tag: 'meta',
          injectTo: 'head-prepend',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src ${images}; connect-src ${connect}; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'`,
          },
        },
      ]
    },
  }
}
