# Administrator Authentication & Session Architecture

**Project**: Rida Admin Dashboard  
**Security Realm**: Staff Realm (`aud="staff"`)  
**Backend Reference**: `RideBackend-Rewrite-/controllers/staff_auth_controller.go`, `RideBackend-Rewrite-/middleware/auth_middleware.go`  

---

## 1. Overview of the Staff Authentication Architecture

Unlike customer and driver accounts which reside in the "App" realm (`aud="app"`), all administrator and support personnel accounts are strictly managed within the **Staff Realm** (`aud="staff"`).

### Key Architectural Characteristics:
- **No Self-Registration**: Staff accounts can never self-register. They are provisioned by an existing Administrator via `cmd/create-admin` or `POST /api/v1/admin/staff`.
- **JWT Cryptographic Isolation**: Staff tokens are signed with a distinct 32+ byte secret (`STAFF_JWT_SECRET`) that differs from the app user secret. An app user JWT presented at any `/api/v1/staff/*` or `/api/v1/admin/*` route is immediately rejected with HTTP 401.
- **Short-Lived Access Tokens**: Staff access tokens expire in **15 minutes** by default (`STAFF_ACCESS_TTL`).
- **Rotatable Single-Use Refresh Tokens**: Refresh tokens expire in **7 days** (`STAFF_REFRESH_TTL`). Each use issues a brand-new token and marks the previous token replaced. Presenting a reused or revoked refresh token triggers immediate session family termination (theft mitigation).
- **Database Role Verification**: Middleware does not blindly trust JWT claims; `StaffProtected` re-verifies staff active status and role against the database (cached in-memory for max 30 seconds).

---

## 2. API Endpoints Contract

### A. Staff Login
- **Route**: `POST /api/v1/staff/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "totp_code": ""
  }
  ```
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "0123456789abcdef...",
    "must_change_password": false,
    "user": {
      "id": "c1f7b822-...",
      "name": "Super Admin",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": true,
      "must_change_password": false,
      "totp_enabled": false,
      "last_login_at": "2026-10-10T12:00:00Z",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-10-10T12:00:00Z"
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: `{"error": "Invalid credentials"}`
  - `429 Too Many Requests`: `{"error": "Too many requests"}` (exceeded 10 attempts/min)

### B. Token Refresh (Rotation)
- **Route**: `POST /api/v1/staff/auth/refresh`
- **Request Body**:
  ```json
  {
    "refresh_token": "0123456789abcdef..."
  }
  ```
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi... (new access token)",
    "refresh_token": "fedcba9876543210... (new rotated refresh token)",
    "user": { ... }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: `{"error": "Invalid refresh token"}` or `{"error": "Invalid refresh token: session compromised"}`

### C. Current Staff Profile
- **Route**: `GET /api/v1/staff/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "user": { ... }
  }
  ```

### D. Logout
- **Route**: `POST /api/v1/staff/auth/logout`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "refresh_token": "current_refresh_token"
  }
  ```
- **Response** (`HTTP 200 OK`): `{"message": "Logged out successfully"}`

---

## 3. Frontend Session Handling & Token Lifecycle

```
[User Submits Login] ──▶ POST /staff/auth/login ──▶ Store { accessToken, refreshToken, user }
                                                                 │
                                                                 ▼
[API Requests] ────────▶ Add Header: Authorization: Bearer <accessToken>
                                                                 │
                                                   ┌─────────────┴─────────────┐
                                                   ▼                           ▼
                                            HTTP 200 Success             HTTP 401 Unauthorized
                                                                               │
                                                                               ▼
                                                                POST /staff/auth/refresh
                                                                with { refreshToken }
                                                                               │
                                                                ┌──────────────┴──────────────┐
                                                                ▼                             ▼
                                                        Refresh Success                Refresh Failed
                                                        (Update tokens &               (Clear session,
                                                         replay request)                redirect /login)
```

### Storage Policy:
- Tokens are stored in secure browser storage (`localStorage` / session memory with token sanitization).
- Sensitive credentials, raw passwords, or secrets are NEVER stored or logged.
- Console logging filters out tokens and passwords.

---

## 4. Role-Based Access Control (RBAC)

The Go backend enforces two staff roles:

1. **`admin`**: Full administrative capabilities, including:
   - Creating, modifying, demoting staff accounts
   - Changing user roles (`driver` <-> `passenger`)
   - Viewing system audit logs (`GET /admin/audit-logs`)
   - Resetting staff passwords and revoking sessions
   - Driver verification and oversight
2. **`support`**: Operational support capabilities:
   - Listing app users and drivers (`GET /admin/users`)
   - Viewing individual driver and passenger profiles
   - Verifying driver documents (`PATCH /admin/drivers/:id/verify`)
   - Managing tickets and complaints

### Frontend Permission Helpers:
- `hasRole(user, 'admin')`: Allows staff management and audit log access.
- `hasRole(user, 'support')`: Allows user lookup, driver verification, and ticket resolution.
- UI elements reserved for admins are disabled or hidden with informative tooltips for support personnel.
- All frontend permission gates respect backend authority — HTTP 403 responses are gracefully handled.
