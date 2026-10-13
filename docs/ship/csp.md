# Admin Content Security Policy

Production builds insert a CSP meta tag before other head elements via `csp.ts`. Scripts are same-origin only; inline scripts and eval are disallowed. Default, objects and embedded frames are denied. Styles allow inline declarations because Radix UI and Recharts position interactive elements with style properties; this exception grants no inline-script permission. Fonts remain limited to the existing Google Fonts origins.

API requests use same-origin `/api/v1` by default. A full public `VITE_API_BASE_URL` adds its normalized origin to connect/img sources. Private signed-image retrieval requires `VITE_DOCUMENT_ORIGIN` set to the HTTPS origin of the configured storage endpoint, including a local development endpoint where applicable. Only these public origins are read by the build plugin. Configure the storage CORS policy to allow the admin host. `VITE_MAP_TILE_URL` adds its normalized origin to img-src; OpenStreetMap development tiles are the compatibility fallback until a licensed production provider is selected.

Previewed uploads are raster PNG/JPEG/WebP images only; PDF/HTML/SVG responses are rejected. Files remain authenticated blob requests until signed links are available, object URLs are revoked on close, React escapes text, and download links use noopener/noreferrer. No raw HTML rendering was added.

Development server CSP is intentionally omitted because Vite's refresh tooling injects development scripts. Production always gets the policy, including vite preview.

The hosting owner must also send `Content-Security-Policy: frame-ancestors 'none'` (not enforceable by meta), `X-Content-Type-Options: nosniff`, an HTTPS-only HSTS policy and an appropriate Referrer-Policy. Use a complete header policy including the meta directives if replacing the meta at the edge; multiple policies intersect. Add only known storage/map origins, never `*` or unsafe-eval.

Validation and remaining browser/hosting checks are recorded in frontend-report.md.

The rides map uses public OSM tiles only in development. Set `VITE_MAP_TILE_URL` to the licensed provider template with `{z}`, `{x}`, `{y}`, and `VITE_MAP_ATTRIBUTION` to that provider's required plain-text attribution before production use. Its HTTPS origin is added to img-src by the production CSP plugin. Without configured production tiles, the ride map retains its points and coordinate text, and labels the background unavailable.
