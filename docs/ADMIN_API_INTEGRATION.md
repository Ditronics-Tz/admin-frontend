# Admin API integration

The frontend follows the handlers in `RideBackend-Rewrite-/routes/admin_routes.go`, `routes/staff_auth_routes.go`, and their controllers. All paths below are relative to `/api/v1`.

## Connected screens

| Screen | Backend contract |
| --- | --- |
| Login | `POST /staff/auth/login` with `email`, `password`, `totp_code` |
| Session | `GET /staff/auth/me`, rotating `POST /staff/auth/refresh`, `POST /staff/auth/logout` |
| First login / security settings | `POST /staff/auth/change-password`, `/logout-all`, `/2fa/setup`, `/2fa/verify`, `/2fa/disable` |
| Dashboard | `GET /admin/stats`, `GET /admin/rides` |
| Driver directory / profile | `GET /admin/users?role=driver`, `GET /admin/users/:id` |
| Driver verification | `GET /admin/verifications`, POST claim, `PATCH /admin/documents/:id/review`, `POST /admin/drivers/:id/approve` |
| Document preview / download | Bearer-authenticated `GET /files/documents/:documentId`, including historical versions |
| Account control | `POST /admin/users/:id/suspend` and `/reactivate`, with reason and optional suspension `until`; admin-only `/ban` |
| Internal notes / account history | `GET/POST /admin/users/:id/notes`, admin-only DELETE note; `GET /admin/users/:id/history` |
| Customers / profile | `GET /admin/users?role=passenger`, `GET /admin/users/:id` |
| Account role change | Admin-only `PATCH /admin/users/:id/role` with `{ "role": "driver"/"passenger" }` |
| Staff settings | Admin-only `GET/POST /admin/staff`, `PATCH /admin/staff/:id`, `PATCH /admin/staff/:id/role`, `POST /admin/staff/:id/reset-password`, `POST /admin/staff/:id/revoke-sessions` |
| Audit settings | Admin-only `GET /admin/audit-logs?limit=25&offset=…` |
| Support | `GET /admin/tickets`, `GET /admin/complaints`; bodyless `PATCH /admin/tickets/:id` and `PATCH /admin/complaints/:id` acknowledgements |

Support staff can access operational screens and their own security settings. Staff administration, audit logs, and app-user role changes are hidden for support. Backend authorization remains authoritative. A `require_2fa` response links to security setup. Temporary-password accounts are routed to password change before entering the dashboard.

Concurrent expired requests share one refresh rotation. Retried requests use the new bearer token, including the current rotated refresh token when logging out. Late refresh responses cannot restore a cleared session. Login, logout, account changes, and cross-tab session changes clear cached account data.

Generated staff passwords are shown in a temporary dialog and are not saved to browser storage. Administrators change their own password through security settings; password reset actions target other staff accounts. Password changes require signing in again because the backend revokes refresh sessions. Session revocation does not immediately invalidate already-issued access tokens.

## Data limitations

The backend lists all users without search or pagination and omits driver profiles from list responses. The frontend loads profile details with at most six concurrent requests, shares the directory cache, and filters/paginates locally. The verification queue has no arbitrary 100-record cutoff. This will need server pagination and profile summaries for a large fleet.

Driver verification uses persisted statuses, individual document decisions, required rejection reasons, reviewer claims and immutable review history. Final approval is explicit after all uploaded documents pass. Admins can override/revoke decisions with a reason; support cannot. Drivers replace only the bad document. Current required uploads are licence, vehicle card, national ID and vehicle photo; insurance upload is optional. Required dates, expiry and actual review/upload timestamps come from the backend. See `RideBackend-Rewrite-/docs/VERIFICATION.md` and `docs/TANZANIA_DOCUMENT_POLICY.md` for API, migration and legal distinctions.

Account status is separate from document approval. Support can suspend/reactivate with a reason and optional end date; admin-only bans and note deletion are gated by the server. Driver Account Activity and passenger details show staff notes, suspension history and OTP phone status. Phone OTP delivery requires an SMS adapter in the backend; there is no passenger signup document collection. Abuse-triggered passenger ID checks remain a later step.

Rides, tickets, and complaints currently return empty arrays. Support updates only acknowledge a fixed status and write an audit event; they do not persist a ticket or complaint. The UI describes this explicitly. Dashboard driver/passenger counts are real; operational counters are backend placeholders. Simulated charts, fleet locations, revenue, and histories are not presented as real data.

Admin driver creation/editing, payments, analytics, bulk notifications and live dispatch remain unavailable. Expiry notifications are persistent driver-facing API records. Ride acceptance/assignment is not implemented in the backend, so its future handler must use the new driver approval gate. Tickets, complaints, refunds, exports and abuse-triggered ID checks require further backend work.

## Local setup

1. Configure and start the Go backend following its README (Postgres and staff credentials are required).
2. In the frontend `.env`, set `VITE_API_BASE_URL=http://localhost:3000/api/v1` and `VITE_ENABLE_DEMO_MODE=false`. Alternatively use `/api/v1` with the Vite proxy to port 3000.
3. Run `npm install` if dependencies are absent, then `npm run dev`. The configured frontend port is 5173. Backend CORS currently permits all origins and answers OPTIONS before authentication, as requested for local integration.
4. Sign in with a provisioned staff account. Change a temporary password when prompted; configure an authenticator under Settings → My security if the server requires administrator 2FA.

Production also requires an appropriate API URL/reverse proxy and SPA fallback routing. Demo mode is restricted to Vite development builds.

## Validation

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Tests exercise the actual frontend services against a local HTTP fixture server: payloads and verbs, TOTP, permission gates, protected files, bounded profile loading, concurrent token rotation, refresh failure, logout races, and Tanzania date formatting. They also render route/permission components on the server.

These are contract and component checks. Backend HTTP lifecycle tests exercise real middleware and persistence, and an opt-in PostgreSQL test verifies claim concurrency, unique indexes and repeated migrations in an isolated schema. A live browser end-to-end check still requires the restarted backend and staff account.
