# Frontend–Backend Integration Progress Tracker

> Historical snapshot. See [Admin API integration](ADMIN_API_INTEGRATION.md) for current verification, suspension, notes, history and OTP support.

The current implementation and remaining backend limitations are documented in [Admin API integration](ADMIN_API_INTEGRATION.md). This earlier tracker is retained for background; use that document for setup and validation.

**Project**: Rida Admin Dashboard  
**Phase**: Task 05 — Complete Frontend-Backend Integration  
**Last Updated**: October 2026  

---

## 1. Summary Dashboard

- **Total Assessed Capabilities**: 22 functional areas
- **Fully Integrated with Real APIs**: 8 areas (Staff Auth, Session Restore, Token Rotation, Driver Verification, Driver Lookup, Customer Lookup, Audit Logs, Staff RBAC)
- **Partially Integrated (Adapters & Stubs)**: 5 areas (Driver Directory, Dashboard Stats, Recent Rides, Tickets, Complaints)
- **Documented Backend Blockers**: 9 areas (Admin driver creation, Admin driver edit, Admin driver suspension, Gross revenue/financials, Live dispatch WebSockets, Payments, Notifications)

---

## 2. Priority 1 — Shared API Infrastructure & Authentication

| Feature | Target API | Implementation Status | Notes |
|---|---|---|---|
| Centralized API Client | `lib/api/client.ts` | **Completed** | Configurable base URL, Bearer auth injector, response error transformer. |
| Automatic Token Refresh | `/api/v1/staff/auth/refresh` | **Completed** | Handles HTTP 401 with rotation queue & retry. |
| Staff Login Form | `/api/v1/staff/auth/login` | **Completed** | React Hook Form + Zod, supports TOTP & error feedback. |
| Current Staff Session | `/api/v1/staff/auth/me` | **Completed** | Restores session on initial app boot. |
| Staff Logout | `/api/v1/staff/auth/logout` | **Completed** | Sends refresh token to revoke session in backend. |
| Protected Route Guard | `ProtectedRoute.tsx` | **Completed** | Enforces staff authentication; supports gated dev preview mode. |
| RBAC Permission Hook | `usePermission.ts` | **Completed** | Distinguishes `admin` and `support` staff roles. |

---

## 3. Priority 2 — Driver Management Module

| Feature | Target API | Implementation Status | Notes |
|---|---|---|---|
| Driver Directory Listing | `/api/v1/admin/users?role=driver` | **Integrated (Adapter)** | Real backend data with client-side filter/sort/pagination adapter. |
| Driver Profile Details | `/api/v1/admin/users/:id` | **Integrated (Adapter)** | Fetches real user + `driver_profile` + rating summary. |
| Driver Verification Review | `/api/v1/admin/drivers/:id/verify` | **Completed** | Real PATCH endpoint toggles verified status. |
| Driver Licence Document | `/api/v1/files/licences/:id` | **Completed** | Real authenticated file download endpoint. |
| Driver Account Suspend | None (`store.DisableAppUser` internal) | **Blocked** | Disabled in UI; clear blocker notification shown. |
| Driver Direct Create | None (Self-registration only) | **Blocked** | Disabled in UI; clear blocker notification shown. |
| Driver Direct Edit | None (`/driver/profile/me` is self-service) | **Blocked** | Disabled in UI; clear blocker notification shown. |

---

## 4. Priority 3 — Dashboard Module

| Feature | Target API | Implementation Status | Notes |
|---|---|---|---|
| Overview Driver Count | `/api/v1/admin/stats` | **Completed** | Real count from `total_drivers`. |
| Overview Customer Count | `/api/v1/admin/stats` | **Completed** | Real count from `total_passengers`. |
| Overview Gross Revenue | None (No payment model) | **Blocked** | Replaced hardcoded value with "Unavailable". |
| Recent Rides Table | `/api/v1/admin/rides` | **Integrated (Stub)** | Fetches real endpoint (returns empty list), shows honest empty state. |
| Ride Activity Chart | None (No analytics model) | **Clarified** | Marked clearly as sample/unavailable. |

---

## 5. Priority 4 — Other Modules

| Feature | Target API | Implementation Status | Notes |
|---|---|---|---|
| Customer Directory | `/api/v1/admin/users?role=passenger` | **Completed** | Real passenger listing. |
| Staff User Management | `/api/v1/admin/staff` | **Completed** | List, create, update, role toggle, reset password. |
| Security Audit Logs | `/api/v1/admin/audit-logs` | **Completed** | Displays paginated system audit trail. |
| Customer Support Tickets | `/api/v1/admin/tickets` | **Integrated (Stub)** | Fetches stubbed list; shows empty state. |
| Customer Complaints | `/api/v1/admin/complaints` | **Integrated (Stub)** | Fetches stubbed list; shows empty state. |
| Payments & Mobile Money | None | **Blocked** | Honest placeholder retained. |
| Realtime Dispatch | None (No WebSocket) | **Blocked** | Honest placeholder retained. |
