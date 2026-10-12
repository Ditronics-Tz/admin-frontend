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
