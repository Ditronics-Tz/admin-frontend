# Frontend–Backend Integration Compatibility Matrix

> Historical snapshot. Verification and account support have since been implemented; use [Admin API integration](ADMIN_API_INTEGRATION.md) for the current contract. Boolean verification is retired.

**Project**: Rida Ride-Hailing Platform — Admin Integration  
**Date**: October 2026  
**Auditor**: Senior Systems Architect & Integration Specialist  

---

## Compatibility Classification

- **SUPPORTED**: The backend provides the functionality and the frontend can integrate it directly.
- **PARTIALLY SUPPORTED**: The backend supports some but not all required functionality (e.g., listing without server-side pagination, or profile view without admin edit).
- **NOT AVAILABLE**: No corresponding backend API or database model exists.
- **UNKNOWN**: The relevant implementation cannot be confirmed.

---

## Feature-by-Feature Integration Matrix

| Frontend Module & Feature | Current Frontend Assumption | Discovered Backend Capability | Integration Status | Required Action / Architecture Resolution |
|---|---|---|---|---|
| **Admin Login** | Calls `/auth/login` expecting cookie session or generic user | Dedicated `/api/v1/staff/auth/login` returning `{access_token, refresh_token, user: StaffUserResponse}` | **SUPPORTED** | Point to `/staff/auth/login`, store bearer tokens, authenticate staff accounts (`admin`/`support`). |
| **Admin Session Restore (`/me`)** | Checks `/auth/me` with cookie | Dedicated `GET /api/v1/staff/auth/me` with Bearer token | **SUPPORTED** | Implement token-based session restore on app mount. |
| **Admin Token Refresh** | Calls generic `/auth/refresh` | Dedicated `POST /api/v1/staff/auth/refresh` rotating single-use refresh token | **SUPPORTED** | Wire automatic token refresh interceptor in Axios on HTTP 401. |
| **Admin Logout** | Calls generic `/auth/logout` | Dedicated `POST /api/v1/staff/auth/logout` (revokes session hash) and `/logout-all` | **SUPPORTED** | Send refresh token to revoke session in backend and clear client state. |
| **Admin 2FA / TOTP** | Not implemented on frontend | Supported via `/staff/auth/2fa/setup`, `/verify`, `/disable` | **SUPPORTED** | Expose optional 2FA verification in login flow and settings. |
| **Admin First Login Password Change** | Not implemented on frontend | Enforced by `must_change_password` flag; blocked until `/change-password` called | **SUPPORTED** | Handle `must_change_password` gate in authentication flow. |
| **Driver Listing** | Paginated server query `GET /drivers?page=1&status=...` | `GET /api/v1/admin/users?role=driver` returns all driver user records | **PARTIALLY SUPPORTED** | Fetch drivers from real API, implement client-side adapter for search, filtering, and pagination. |
| **Driver Details Profile** | `GET /drivers/:id` returning vehicle, LATRA, NIDA, trips | `GET /api/v1/admin/users/:id` returns user, `driver_profile` (licence, plate, vehicle card, verified, ratings) | **PARTIALLY SUPPORTED** | Adapter maps real backend `driver_profile` into view model. Display honest fields; mark missing documents as uncollected. |
| **Driver Verification Status** | `approved` / `pending` / `rejected` | `verified: boolean` on `driver_profile` | **PARTIALLY SUPPORTED** | Map `verified: true` -> Approved, `verified: false` -> Pending/Unverified. |
| **Driver Verification Approval** | Calls `POST /drivers/:id/approve` | `PATCH /api/v1/admin/drivers/:id/verify` with `{"verified": true}` | **SUPPORTED** | Connect to real PATCH endpoint; update TanStack query cache. |
| **Driver Verification Rejection** | Calls `POST /drivers/:id/reject` with reason | `PATCH /api/v1/admin/drivers/:id/verify` with `{"verified": false}` | **PARTIALLY SUPPORTED** | Backend updates verification to false; rejection reason is logged via audit log in backend. |
| **Driver Licence Document View** | Loads static mock image URL | `GET /api/v1/files/licences/:id` served via private download with staff token | **SUPPORTED** | Connect image/document viewer to backend private files endpoint. |
| **Driver Account Suspension** | Calls `POST /drivers/:id/suspend` | No HTTP admin suspend endpoint (`store.DisableAppUser` exists internally only) | **NOT AVAILABLE** | Disable action in UI or clearly report backend blocker; prevent fake success simulation. |
| **Driver Direct Creation (Admin)**| `POST /drivers` | No admin create driver endpoint (only self-registration `/auth/register`) | **NOT AVAILABLE** | Mark admin driver creation as unsupported by backend; provide clear message. |
| **Driver Direct Edit (Admin)** | `PUT /drivers/:id` | No admin edit endpoint (only driver self-service `/driver/profile/me`) | **NOT AVAILABLE** | Disable admin editing of driver vehicle info; show read-only details. |
| **Driver Role Toggle** | Not implemented | `PATCH /api/v1/admin/users/:id/role` (`role: driver | passenger`) | **SUPPORTED** | Expose role management to admin users. |
| **Dashboard Driver Count** | Hardcoded `842` | `GET /api/v1/admin/stats` -> `total_drivers` | **SUPPORTED** | Connect real metric from `/admin/stats`. |
| **Dashboard Customer Count** | Hardcoded `118,920` | `GET /api/v1/admin/stats` -> `total_passengers` | **SUPPORTED** | Connect real metric from `/admin/stats`. |
| **Dashboard Total Rides** | Hardcoded `24,580` | `GET /api/v1/admin/stats` -> `active_rides: 0` (rides table not implemented) | **NOT AVAILABLE** | Display 0 or honest empty/unavailable state. |
| **Dashboard Gross Revenue** | Hardcoded `TSh 148,250,000` | No financial or payment tables exist in backend | **NOT AVAILABLE** | Display "Unavailable" with honest note that revenue engine is not deployed. |
| **Dashboard Recent Rides Table**| Hardcoded `SAMPLE_RIDES` list | `GET /api/v1/admin/rides` returns `{count: 0, rides: []}` | **PARTIALLY SUPPORTED** | Fetch from `/admin/rides`, render real empty state ("No ride activity recorded"). |
| **Dashboard Ride Activity Chart**| Hardcoded 7-day / 30-day mock numbers | No historical ride aggregation API exists | **NOT AVAILABLE** | Mark chart as demo visualization or provide empty historical state. |
| **Customer Accounts (Riders)** | Placeholder Phase 5 | `GET /api/v1/admin/users?role=passenger` & `/admin/users/:id` | **SUPPORTED** | Connect real passenger directory and profiles. |
| **Staff & Administrator Accounts**| Not exposed in UI | `GET /api/v1/admin/staff`, `POST`, `PATCH`, password reset, revoke | **SUPPORTED** | Connect to Settings page for comprehensive RBAC management. |
| **Security Audit Logs** | Not exposed in UI | `GET /api/v1/admin/audit-logs` | **SUPPORTED** | Connect to Settings / Audit page for tracking staff activity. |
| **Customer Support / Tickets** | Placeholder Phase 9 | `GET /api/v1/admin/tickets` & `PATCH /api/v1/admin/tickets/:id` | **PARTIALLY SUPPORTED** | Backend returns empty list; connect stubbed endpoints. |
| **Customer Complaints** | Placeholder Phase 9 | `GET /api/v1/admin/complaints` & `PATCH /api/v1/admin/complaints/:id` | **PARTIALLY SUPPORTED** | Backend returns empty list; connect stubbed endpoints. |
| **Payments & Mobile Money** | Placeholder Phase 7 | No payment routes or models in Go backend | **NOT AVAILABLE** | Maintain honest placeholder with blocker notice. |
| **Live Operations / Map Dispatch** | Placeholder Phase 8 | No WebSocket or live GPS tracking endpoints in Go backend | **NOT AVAILABLE** | Maintain honest placeholder with blocker notice. |
| **System Notifications** | Placeholder Phase 10 | No notification models or routes in Go backend | **NOT AVAILABLE** | Maintain honest placeholder with blocker notice. |
