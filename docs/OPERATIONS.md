# Reports, safety, finance and fraud

The new views reuse React Router, Radix dialogs, TanStack Query, the shared Axios
staff-token refresh flow, Sonner toasts, and the existing responsive table styles.
Dates are displayed in Africa/Dar_es_Salaam; money uses whole TZS.

## Phase 6

Routes: `/reports`, `/reports/:id`, `/reports/flags`. Reports also appear on the
passenger dialog and driver detail. Support can claim, note, dismiss, warn,
escalate and suspend up to seven days. The backend enforces the cap and ownership.
403 responses disable operational write controls for the current staff identity.
429 messages use the response's Retry-After value. The old complaints API is a
deprecated alias; use the Reports screens for decisions and required notes.

Skipped: existing account status, verification, token refresh, dialogs, responsive
tables, toasts and en/sw locale state are reused. No new component library.

MOBILE APP CHANGES: block/report actions on trips and history; blocked users in
settings; report submissions require a real ride ID and are limited to 10/day.

## Phase 7

Existing routes: `/safety`, `/safety/sos/:id`, `/safety/history`,
`/safety/incidents` and `/safety/incidents/:id`. The SOS console includes SSE with
polling fallback, audio and browser notifications, contact reveal with backend
auditing, an OSM map/trail, acknowledgement ownership, required resolution notes,
history filters and admin CSV export. Incident queues and detail actions reuse
the report patterns.

The task review added pagination to the open SOS console so alerts beyond the
first 100 remain reachable. Support staff now land on `/safety`; admins retain
their dashboard default. Login preserves the requested path, search parameters
and fragment, with the required password-change gate taking precedence.

Skipped: existing console/detail/history/incident screens, SSE refresh/polling,
nav count, maps, dialogs, toasts and sensitive-data reveal were retained.
Assumptions: SMS/push delivery and authoritative ride dispatch remain backend
integration seams documented in the backend operations runbook.

MOBILE APP CHANGES: hold-to-confirm and silent SOS, authenticated location pings,
emergency contacts, trip sharing and private incident attachments.

## Phase 8

Existing routes: `/payments`, `/payments/:id`, `/finance`, `/finance/refunds`,
`/finance/payouts`, `/finance/wallets`, `/finance/settings` and
`/finance/reconciliation`. Existing permission gates, whole-TZS displays,
confirmation dialogs, idempotency headers, Recharts summary and CSV actions were
retained. The backend review corrected partial-refund rounding for discounted
fares; no UI money contract changed.

Assumptions: the gateway adapter contract is documented in the backend runbook
and production provider integration remains external to this checkout.

MOBILE APP CHANGES: payment selection/status polling, wallet/top-ups, driver
earnings/payouts and `CASH_LIMIT_REACHED` handling.

## Phase 9

Existing routes: `/fraud`, `/fraud/:id` and `/fraud/rules`, plus user Fraud tabs
and the dashboard count. Existing evidence tables/maps, linked accounts, rule
settings/dry-run and permission/confirmation controls were retained. Backend
device capture now accepts the documented `X-Device-Platform` header, and the
shared-device rule measures distinct accounts on each individual device.

MOBILE APP CHANGES: stable `X-Device-ID`, `X-Device-Platform`, and authenticated
driver ride-location points. `X-Platform` remains a backend compatibility alias.

## Task review changes and checks

Phase 6 changed `ReportsPage.tsx` to forward the flagged-account `user` query
parameter. Phase 7 changed `SafetyPage.tsx`, `safety.live.tsx`, the auth landing
helper/home redirect, `useLogin.ts` and `AppRouter.tsx`. Regression coverage was
added to `tests/integration.test.mjs`; phase 8 and 9 UI implementations were reused.
Run `npm run typecheck`, `npm run lint` and `npm test` from this folder.
Lint currently reports five existing Fast Refresh warnings and no errors.
