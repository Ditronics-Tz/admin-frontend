# Backend Integration Blockers & Missing Capabilities

**Project**: Rida Admin Dashboard  
**Status**: Read-Only Backend Inspection Findings  
**Target Backend Service**: `RideBackend-Rewrite-/`  

---

## Blocker 1: Absence of Administrative Driver Suspension Endpoint

- **Affected Frontend Feature**: Driver Management — Account Suspension & Reactivation (`useSuspendDriver`, `useReactivateDriver`).
- **Existing Backend Behavior**: The `store.Store` contains a helper method `DisableAppUser(id string)` in `store/store.go:257-259`. However, this is only invoked by the CLI tool `cmd/migrate-staff` to deactivate legacy accounts. No HTTP route in `routes/admin_routes.go` or handler in `controllers/admin_controller.go` exposes user suspension or reactivation to administrators.
- **Missing Capability**: An endpoint such as `PATCH /api/v1/admin/users/:id/status` accepting `{"is_active": false, "reason": string}`.
- **Relevant Backend Files**: `routes/admin_routes.go`, `controllers/admin_controller.go`, `store/store.go`.
- **Suggested Backend Team Action**: Add a route `admin.Patch("/users/:id/status", supportAndAdmin, ac.UpdateUserStatus)` that toggles `models.User.IsActive` and logs to `staff_audit_logs`.
- **Frontend Mitigation**: Frontend disables the suspension action button in production, displaying an informational banner explaining that account suspension requires backend endpoint enablement.

---

## Blocker 2: Absence of Administrative Driver Creation & Editing Endpoints

- **Affected Frontend Feature**: Driver Management — "Register New Driver" dialog and "Edit Driver Profile" page (`DriverEditPage.tsx`).
- **Existing Backend Behavior**: Drivers are created exclusively through public self-registration via `POST /api/v1/auth/register` (realm "app") in `controllers/auth_controller.go:42-83`. Driver profile fields (`licence_number`, `vehicle_card_number`, `plate_number`) are editable solely by the driver themselves via `PUT /api/v1/driver/profile/me` (`controllers/profile_controller.go:39-60`).
- **Missing Capability**: Admin-authorized endpoints for creating or updating driver accounts: e.g. `POST /api/v1/admin/drivers` and `PATCH /api/v1/admin/drivers/:id`.
- **Relevant Backend Files**: `routes/admin_routes.go`, `controllers/admin_controller.go`.
- **Suggested Backend Team Action**: Implement administrative driver provisioning and profile amendment endpoints in `admin_controller.go`.
- **Frontend Mitigation**: Frontend marks the driver creation and edit actions as unavailable in live production mode with clear explanatory notices.

---

## Blocker 3: Lack of Server-Side Pagination, Filtering, and Search on `/admin/users`

- **Affected Frontend Feature**: Driver Listing & Customer Listing (`DriversPage.tsx`, `CustomersPage.tsx`).
- **Existing Backend Behavior**: `GET /api/v1/admin/users?role=driver` executes `s.db.Order("created_at ASC").Where("role = ?", roleFilter).Find(&users)` (`store/store.go:80-88`). It returns ALL matching users in memory without `limit`, `offset`, search term, or status filtering.
- **Missing Capability**: Query parameters `?page=1&limit=20&search=keyword&status=active`.
- **Relevant Backend Files**: `controllers/admin_controller.go:30-38`, `store/store.go:80-88`.
- **Suggested Backend Team Action**: Update `ListUsers` in `admin_controller.go` to accept `page`, `limit`, and `search` query parameters and return total pagination metadata.
- **Frontend Mitigation**: Frontend loads the driver list and applies a robust client-side adapter for pagination, keyword search, and status filtering.

---

## Blocker 4: Absence of Financial, Payment, and Revenue Models

- **Affected Frontend Feature**: Dashboard Overview Metric "Gross Revenue" and Payments Module (`PaymentsPage.tsx`).
- **Existing Backend Behavior**: No database tables, models, routes, or services exist for financial transactions, payment gateways (M-Pesa, Tigo Pesa, Airtel Money), driver payouts, or commissions.
- **Missing Capability**: Transaction database schemas and analytics aggregation endpoints (e.g., `GET /api/v1/admin/financials/overview`).
- **Relevant Backend Files**: Entire backend repository.
- **Suggested Backend Team Action**: Model `transactions`, `wallets`, and payment webhooks in a dedicated payment service.
- **Frontend Mitigation**: Dashboard Gross Revenue metric displays "Unavailable (Financial module not deployed)", eliminating misleading fabricated TZS metrics.

---

## Blocker 5: Rides, Tickets, and Complaints Return Stubbed Empty Arrays

- **Affected Frontend Feature**: Dashboard Recent Rides (`RecentRidesTable.tsx`), Support Module (`SupportPage.tsx`), and Rides Module (`RidesPage.tsx`).
- **Existing Backend Behavior**:
  - `GET /api/v1/admin/rides` returns `{"count": 0, "rides": []}` (`admin_controller.go:122-124`).
  - `GET /api/v1/admin/complaints` returns `{"count": 0, "complaints": []}` (`admin_controller.go:127-129`).
  - `GET /api/v1/admin/tickets` returns `{"count": 0, "tickets": []}` (`admin_controller.go:142-144`).
- **Missing Capability**: Underlying database tables (`rides`, `tickets`, `complaints`) and real business logic.
- **Relevant Backend Files**: `controllers/admin_controller.go:121-154`.
- **Suggested Backend Team Action**: Implement the core dispatch engine and connect the database tables to these endpoints.
- **Frontend Mitigation**: Frontend integrates with the live endpoints and presents clean, honest empty states ("No active ride records found", etc.) instead of fake mock lists.

---

## Blocker 6: Absence of Realtime Transport (WebSocket / SSE)

- **Affected Frontend Feature**: Live Operations Dashboard (`LiveOperationsPage.tsx`) and Realtime Fleet Dispatch Monitoring.
- **Existing Backend Behavior**: Fiber application mounts only standard HTTP JSON REST endpoints (`routes/app.go`). No WebSocket upgrade handlers or message brokers exist.
- **Missing Capability**: Realtime bidirectional event bus for driver GPS updates, ride dispatch broadcasting, and live status streaming.
- **Relevant Backend Files**: `routes/app.go`, `main.go`.
- **Suggested Backend Team Action**: Implement a WebSocket gateway or integrate an event broker (e.g., Redis Pub/Sub, Centrifugo, or Fiber WebSocket).
- **Frontend Mitigation**: Frontend relies on configurable HTTP polling where needed and displays an honest notice on the Live Operations page.
