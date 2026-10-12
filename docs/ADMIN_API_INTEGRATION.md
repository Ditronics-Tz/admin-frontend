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
| Driver verification | `PATCH /admin/drivers/:id/verify` with `{ "verified": true/false }` |
| Licence preview / download | Bearer-authenticated `GET /files/licences/:driverId`, rendered through a temporary blob URL |
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

Driver verification is a single boolean. Revoking verification sets it to false; there is no persisted rejection reason or per-document review status. Licence dates shown are profile creation dates, since upload timestamps are unavailable. Missing phone, location, vehicle specifications, trip totals, and performance metrics are left unavailable. Ratings use the returned rating summary. Dates display in Tanzania time.

Rides, tickets, and complaints currently return empty arrays. Support updates only acknowledge a fixed status and write an audit event; they do not persist a ticket or complaint. The UI describes this explicitly. Dashboard driver/passenger counts are real; operational counters are backend placeholders. Simulated charts, fleet locations, revenue, and histories are not presented as real data.

Admin driver creation, editing, suspension/reactivation, payments, analytics, notifications, and live dispatch have no supporting admin endpoints. Their controls remain unavailable. No new backend routes or database behavior were invented for this integration.

## Local setup

1. Configure and start the Go backend following its README (Postgres and staff credentials are required).
2. In the frontend `.env`, set `VITE_API_BASE_URL=http://localhost:3000/api/v1` and `VITE_ENABLE_DEMO_MODE=false`. Alternatively use `/api/v1` with the Vite proxy to port 3000.
3. Run `npm install` if dependencies are absent, then `npm run dev`. The configured frontend port is 5173. For an absolute API URL, allow that frontend origin in backend CORS configuration.
4. Sign in with a provisioned staff account. Change a temporary password when prompted; configure an authenticator under Settings → My security if the server requires administrator 2FA.

Production also requires an appropriate API URL/reverse proxy and SPA fallback routing. Demo mode is restricted to Vite development builds.

## Validation

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Tests exercise the actual frontend services against a local HTTP fixture server: payloads and verbs, TOTP, permission gates, protected files, bounded profile loading, concurrent token rotation, refresh failure, logout races, and Tanzania date formatting. They also render route/permission components on the server.

These are contract and component checks. A running Go/Postgres service and real staff account are still required for live browser end-to-end validation. No live server was reachable on port 3000 during implementation.
