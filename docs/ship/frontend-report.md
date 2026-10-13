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

No safe patch upgrade was offered by the installed lockfile audit. Registry metadata also reports braces latest as 3.0.3 and selector-parser fixed/latest as 7.1.6 (a major change to the affected Tailwind dependency chain). These are deferred advisories, not resolved security findings. CI publishes the current result without forcing a major upgrade. Build inputs should remain repository controlled pending the migration.

Validation: format check, typecheck, tests (29/29), and production build passed. Lint passed with five existing Fast Refresh warnings. npm audit reported the seven deferred advisories above. The CI uses npm ci to exercise a clean checkout; a hosted CI run is pending push/PR by the owner.

Final clean Windows checkout exposed Git autocrlf converting 169 source files to CRLF and failing Prettier, despite the formatted working tree. Added `.gitattributes` with automatic text detection and LF checkout so both Windows and Linux clones share the expected formatting. Clean-checkout rerun is pending below.

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

## F6 — Verification workspace gaps

Branch: `ship/fe-verification`. Existing claim/release, document decisions, final approval, expiry dates and permanent review timeline were retained. Added status/search/expiring-within-30-days queue filters, server pagination and page-specific count labels. Per-document previews request presigned metadata on open, fetch raster content without staff Authorization or browser cookies, never persist the signed URL, and revoke local blob URLs on close or expiry (maximum five minutes). Reload obtains a fresh link; unsupported local presign falls back to the existing authenticated binary route. Added zoom/rotate and image load failure states.

Reject/re-upload and override decisions now require confirmation; the existing reason code and note remain required. Rejection persists the replacement-upload requirement without claiming a notification was delivered. Server denials also guard admin overrides. Kept claim rather than introducing a second assignment workflow.

Users and drivers have account suspension/reactivation controls with required reasons, optional suspension end dates and confirmation dialogs; driver Account Activity now includes the existing support panel. Added confirmations for internal note deletion and result toasts. Account/driver phones are masked with audited reveal. Replaced the unsupported LATRA standards claim with the actual configured Rida verification-policy description.

Validation: final format check, typecheck, lint (same five warnings), production build and 35/35 integration tests passed, including signed image bearer isolation, expiry rejection and queue filters. Live queue filters/storage acceptance awaits B3/B4, and storage CORS/origin configuration is an owner deployment step.

## F7 — Support queues

Branch: `ship/fe-support`. Replaced the stub-only ticket/complaint display with shared server-paginated queues for tickets, complaints and reports. Each has status tabs, q/priority/category/assignee/assigned-to-me filters and a real detail route with notes, assignment, status/priority changes and required resolution notes. Confirmation/reason dialogs, role/403 guards, loading/empty/error states and en/sw-ready strings reuse existing primitives. The existing dedicated reports workflow is retained; added its missing priority and assignee filters.

Old count-only support stubs are explicitly rejected as unavailable, and malformed detail acknowledgements cannot expose write controls. No sample rows or successful server mutations are invented. Development fixtures remain visibly labelled and reject all unimplemented mutations. B8 live field/route reconciliation pending.

Validation: final format check, typecheck, lint (same five warnings), production build and 36/36 integration tests passed. Added stub rejection and support filter/detail/note/resolution contract checks.

## F8 — Rides and real dashboard counts

Branch: `ship/fe-rides`. Added server-paginated rides with status/date/party/search filters and a canonical ride detail route showing parties, pickup/dropoff, whole-TZS fares and server events. Cancel/reassign require reason dialogs; reassign also requires a driver ID. Support/admin permissions and 403 read-only state guard writes. Old count-only ride stubs are explicitly unavailable.

Reused the repository's Web Mercator/SVG raster map approach, with fitting for both points, configurable `VITE_MAP_TILE_URL` and attribution. Public OSM tiles are a development fallback only; production renders the coordinates/markers with an honest missing-background state until a licensed tile provider is configured. No new UI/map library was added.

Dashboard counts continue to use `/admin/stats`; operational cards show ride/ticket/complaint counts only when the server explicitly returns `operational_counts_available=true`. Missing/false capability keeps these cards unavailable, including the current B8-pending backend. Account totals remain real server counts. Recent rides request only five real rows and link to supported details. Historical analytics remains unavailable unless the server provides it.

Validation: format check, typecheck, lint (same five warnings), production build and 37/37 integration tests passed. Contract checks cover parties/locations/events, paging/party filters, cancellation/reassignment reason payloads and stub rejection. B7/B8 live nested ride DTO, actions and count acceptance pending.

## F9 — Ratings moderation

Branch: `ship/fe-ratings`. Added a paginated ratings moderation screen, low-score shortcut, visibility/search filters, required-reason hide/restore dialogs and Ratings tabs on user/driver details. Support/admin actions use shared write permissions and 403 read-only guards; backend enforcement remains authoritative. A missing endpoint or unimplemented page contract shows the unavailable state. The backend owner approved the proposed B8 paths/fields; B8 implementation is still pending.

Validation: final format check, typecheck, lint (same five warnings), production build and 38/38 integration tests passed. New tests cover user/low-score filters and reason-bearing hide/restore calls. Added placeholder-only build flags to .env.example. B8 live acceptance remains pending.

## Owner and live acceptance dependencies

Final auth review also closes a session-isolation race on `ship/fe-session-isolation`: a delayed success/401/403 from an earlier login is rejected instead of being displayed, refreshed/replayed or changing permissions under a replacement staff account. Access rotation within the same session still shares the existing refresh promise. Final local validation: format check, typecheck, lint (five pre-existing warnings), production build and 39/39 integration tests passed, including controlled late-200/401 scenarios. Verification errors preserve their backend references and ratings visibility filters show clear labels.

- No production launch/readiness claim is made. B3/B4 contracts are implemented in source; deployment/provider smoke acceptance is pending. B5/B7/B8 implementations and final OpenAPI reconciliation remain backend tasks; frontend requests list the contracts explicitly. Wrong collection keys, stubs and missing endpoints show errors/unavailable states. Hosted CI and staged browser/end-to-end acceptance remain pending owner execution.
- Refresh persistence is the F3 documented localStorage exception until a deployment/domain decision enables an HttpOnly cookie contract.
- Configure storage CORS/VITE_DOCUMENT_ORIGIN and licensed production map tiles/attribution. Production hosting must supply CSP frame-ancestors/HSTS/nosniff/Referrer-Policy headers. Browser CSP smoke was blocked by automatic approval review as described in F3.
- Seven Tailwind build-chain advisories remain deferred, with individual dispositions in F1. No forced major upgrade, external messages, pushes, live environment-file edits or backend edits were performed.
