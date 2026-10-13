# Admin UI ship implementation

## F1 — Baseline and CI

Branch: `ship/fe-ci`. Preserved pre-existing task fixes in `ship/fe-baseline` (`d632298`) before beginning the ship work.

The current checkout had 12 source formatting failures, rather than the eight in the audit snapshot. Applied the existing Prettier configuration. Added clean-checkout CI with Node 24 (required by the existing test loader), npm ci, format, lint, typecheck, tests, build, and report-only dependency audit.

### Advisory dispositions (npm audit, 13 October 2026)

| Package | Severity | Disposition | Reason |
| --- | --- | --- | --- |
| braces | High | Defer | GHSA-vfj7-8cjw-p6xm; installed build dependency, npm offers only a Tailwind major upgrade. |
| chokidar | High | Defer | Inherits braces exposure through Tailwind's build watcher. |
| micromatch | High | Defer | Inherits braces exposure through build glob matching. |
| fast-glob | High | Defer | Inherits micromatch exposure in the Tailwind build chain. |
| tailwindcss | High | Defer | npm recommends 4.3.3, a major migration explicitly excluded from this run. |
| postcss-selector-parser | Moderate | Defer | GHSA-rj75-hqrm-r3gf; npm offers a Tailwind major migration, not a compatible patch. |
| postcss-nested | Moderate | Defer | Inherits selector parser exposure through Tailwind's build chain. |

No safe patch upgrade was offered by the installed lockfile audit. These are deferred advisories, not resolved security findings. CI publishes the current result without forcing a major upgrade. Build inputs should remain repository controlled pending the migration.

Validation: format check, typecheck, tests (29/29), and production build passed. Lint passed with five existing Fast Refresh warnings. npm audit reported the seven deferred advisories above. The CI uses npm ci to exercise a clean checkout; a hosted CI run is pending push/PR by the owner.

## F2 — API foundation

Branch: `ship/fe-api`. Kept the existing Axios client, concurrent token refresh and typed services. Existing 429 numeric handling and field mapping were extended with HTTP-date Retry-After support, request IDs in error messages/toasts, a global rate-limit toast, generic 422 field mapping and an adapter for form field errors. A server 403 makes shared write permissions read-only with an explanatory banner. Existing operational and promotion request wrappers retain their narrower permission gates.

Added shared DataTable/server pagination, FilterBar, ReasonDialog and MaskedValue components; reused the existing ConfirmDialog/StatusBadge/table/empty/skeleton primitives. Phone reveal calls POST `/admin/users/:id/reveal-phone`; missing routes leave the value masked and explicitly unavailable. No local reveal bypass exists.

`VITE_API_MODE=mock` opts into the fixture adapter only during development. It provides empty typed list fixtures, explicitly labels the workspace, and rejects unimplemented operations with 501. Production always uses the live transport. Existing integration tests continue to use the repository's HTTP fixture server.

Validation: format check, typecheck, 30/30 integration tests, production build passed; lint passed with the same five existing warnings. Added focused checks for request references, HTTP-date Retry-After and generic field mapping.

## F3 — Tokens, CSP and document rendering

Branch: `ship/fe-token-csp`. Access tokens now live in memory, legacy persisted access is removed, and only `refresh-storage.ts` can persist refresh tokens. Backend owner confirmed there will be no HttpOnly staff refresh cookie in this run: the isolated refresh localStorage exception remains, as F3 permits, until the deployment/domain decision and cookie contract are supplied. Disabled storage has a memory fallback. Cross-tab replacement invalidates the old tab without deleting the replacement session or triggering refresh/reload loops.

Production builds prepend a restrictive CSP with same-origin scripts and no inline script/eval permission; allowed public API/storage/map origins are normalized at build time. Radix/Recharts inline style declarations are the documented style exception. Upload previews now reject all non-raster formats, including PDF; no document iframe remains. Hosting header requirements are in csp.md.

Validation: format check, typecheck, 31/31 integration tests, lint (same five warnings) and production build passed. Built index.html contains the CSP before resources, only external module scripts, and no inline scripts. Browser/hosting acceptance remains pending: direct Edge headless returned no DOM, and automatic approval review rejected the hidden Start-Process browser/output-capture smoke check as "blocked by policy" without a detailed reason. No production-cookie or deployment-header claim is made.

## F4 — Server pagination and system status

Branch: `ship/fe-pagination`. Audit logs already had offset pagination; added q/action/actor/date filters. Users and staff now request server pages and filters. Driver pages hydrate profiles only within the returned page, with the existing concurrency bound; the full-directory loader was removed. Driver count cards use limit-one total queries rather than loading the entire directory and show unavailable when counts fail. Vehicle type filtering is explicitly disabled because the current backend profile has no authoritative vehicle type.

Added admin-only `/system-status` route/navigation reading `/ready` every 30 seconds with `{status,database,version,uptime_seconds}`, loading and error states. The route and both desktop/mobile navigation enforce the admin display restriction.

Validation: format check, typecheck, 32/32 integration tests, lint (same five warnings), production build passed. New contract test verifies page offsets/filters and exactly one returned driver's hydration even when total is 105. B4 filter/readiness contracts are confirmed by the backend owner and being implemented; live acceptance pending B4.

## F5 — User security and sessions

Branch: `ship/fe-user-security`. Added Security and sessions tabs to the existing user dialog and driver profile. Lists device/IP/created/last-used session data and paginated security events with a type filter. Individual revoke, revoke-all and admin unlock use confirmation dialogs, shared 403 write guards, query invalidation and result toasts. Failed login count is unavailable unless supplied by the server; no fabricated count is shown. Session state refreshes every 30 seconds.

Contracts are isolated in security.service.ts and tested with the existing HTTP fixture layer. Missing endpoints show the real normalized server error rather than success or placeholder rows.

Validation: format check, typecheck, lint (same five warnings), production build and 34/34 integration tests passed. New tests cover individual/all revocation payloads, event pagination, admin-only unlock and read-only security actions. B5 live contract pending.
