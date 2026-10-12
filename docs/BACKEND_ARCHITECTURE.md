# Backend Architecture Specification

**Project**: Rida Ride-Hailing Platform — Admin Backend Analysis  
**Repository**: `rida/RideBackend-Rewrite-/`  
**Date of Inspection**: October 2026  
**Auditor**: Principal Full-Stack Systems Analyst & Software Architect  

---

## 1. Technology Stack Summary

| Dimension | Specification | Source Verification |
|---|---|---|
| **Programming Language** | Go 1.26.8 | `RideBackend-Rewrite-/go.mod` (line 3) |
| **Web Framework** | Fiber v2 (`github.com/gofiber/fiber/v2` v2.52.15) | `RideBackend-Rewrite-/go.mod` (line 6) |
| **Database ORM** | GORM (`gorm.io/gorm` v1.31.2) | `RideBackend-Rewrite-/go.mod` (line 13) |
| **Database Driver** | PostgreSQL (`gorm.io/driver/postgres` v1.6.3 / `pgx/v5` v5.11.0) | `RideBackend-Rewrite-/go.mod` (line 12, 24) |
| **JWT Library** | `golang-jwt/jwt/v5` v5.3.1 | `RideBackend-Rewrite-/go.mod` (line 7) |
| **Cryptography** | `golang.org/x/crypto` v0.57.0 (bcrypt, AES-256-GCM) | `RideBackend-Rewrite-/go.mod` (line 10) |
| **UUID Generator** | `github.com/google/uuid` v1.6.0 | `RideBackend-Rewrite-/go.mod` (line 8) |
| **Environment Loader**| `github.com/joho/godotenv` v1.5.1 | `RideBackend-Rewrite-/go.mod` (line 9) |
| **Static File Serving**| Fiber static router (`/api/v1/uploads` -> `./uploads/public`) | `RideBackend-Rewrite-/routes/app.go` (line 58) |

---

## 2. Server Configuration & Bootstrap Lifecycle

The backend application boots from `RideBackend-Rewrite-/main.go`:

1. **Configuration Loading** (`config.LoadConfig()` in `config/config.go`):
   - Loads `.env` file from the workspace or parent directory.
   - Validates required environment variables: `JWT_SECRET`, `STAFF_JWT_SECRET` (>= 32 bytes and distinct from `JWT_SECRET`), `DB_PASSWORD`, and `STAFF_TOTP_KEY` (32 bytes).
   - Server port defaults to `PORT=3000` (`getEnv("PORT", "3000")`, matching `.env` configuration).
2. **Directory & File Migrations** (`utils.MigrateExistingUploads()`):
   - Prepares upload folders: `./uploads/public` (public profile pictures) and `./uploads/licences` (private driver documents).
3. **Database Connection & Auto-Migration** (`db.Connect(cfg)` in `db/db.go`):
   - Opens PostgreSQL connection via GORM.
   - Runs GORM auto-migrations for: `models.User`, `models.DriverProfile`, `models.PassengerProfile`, `models.Rating`, `models.StaffUser`, `models.StaffSession`, and `models.StaffAuditLog`.
4. **Router & Middleware Initialization** (`routes.BuildApp(cfg, appStore)` in `routes/app.go`):
   - Initializes Fiber instance with global 10MB payload limit.
   - Mounts global middlewares: `recover.New()`, `helmet.New()`, `logger.New()`, and `cors.New()`.
   - Global route prefix is strictly `/api/v1`. Any route outside this prefix receives a JSON 404 response.
   - Starts listening on `:${cfg.Port}`.

---

## 3. Realm Separation & Security Model

The backend establishes two completely isolated authentication realms:

```
                    ┌──────────────────────────────────────────────┐
                    │           RideBackend Service (/api/v1)     │
                    └──────────────────────┬───────────────────────┘
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
      ┌─────────────────────────┐                     ┌─────────────────────────┐
      │        APP REALM        │                     │       STAFF REALM       │
      │       (aud="app")       │                     │      (aud="staff")      │
      ├─────────────────────────┤                     ├─────────────────────────┤
      │ Users: Drivers, Riders  │                     │ Users: Admins, Support  │
      │ Storage: users          │                     │ Storage: staff_users    │
      │ Secret: JWT_SECRET      │                     │ Secret: STAFF_JWT_SECRET│
      │ TTL: 72 hours           │                     │ TTL: 15 min / 7 d (ref) │
      │ Self-registration: Yes  │                     │ Self-registration: No   │
      │ Auth: /api/v1/auth/*    │                     │ Auth: /api/v1/staff/*   │
      └─────────────────────────┘                     └─────────────────────────┘
```

### Staff Realm Security Features:
- **Token Signing**: Uses `STAFF_JWT_SECRET` (at least 32 bytes), separate from app realm `JWT_SECRET`.
- **Token Claims**: `iss="ride-backend"`, `aud="staff"`, `sub=staff_id`, `role`, `jti`.
- **Access Token TTL**: 15 minutes.
- **Refresh Token Rotation**: Refresh tokens are single-use 32-byte cryptographically secure random tokens, SHA-256 hashed in `staff_sessions`. Presenting an already-used or revoked token triggers immediate family revocation (token reuse detection).
- **Brute Force Protection**: In-memory rate limiting (10 attempts per minute per IP and per email). After 5 consecutive failed attempts, the account is locked for 15 minutes (`locked_until`).
- **Timing Attack Mitigation**: When an email is unrecognized, bcrypt compares against a dummy hash to preserve constant execution time.
- **Two-Factor Authentication (TOTP - RFC 6238)**: Optional for support, configurable mandatory for admins (`STAFF_REQUIRE_2FA_FOR_ADMIN=true`). Secrets are stored encrypted at rest with AES-256-GCM.
- **Temporary Password Enforcement**: Accounts with `must_change_password=true` are blocked from all endpoints except `/staff/auth/me` and `/staff/auth/change-password`.

---

## 4. Database Schema and Entity Architecture

The backend manages the following relational models via GORM:

1. **`staff_users`**:
   - `id` (UUID PK), `name` (string), `email` (string unique), `password_hash` (bcrypt cost 12), `role` (`admin` | `support`), `is_active` (bool), `must_change_password` (bool), `failed_attempts` (int), `locked_until` (timestamp), `last_login_at` (timestamp), `totp_secret_enc` (AES encrypted), `totp_enabled` (bool), `created_by` (UUID), `created_at`, `updated_at`.
2. **`staff_sessions`**:
   - `id` (UUID PK), `staff_id` (UUID FK), `token_hash` (varchar 64), `family_id` (UUID), `user_agent`, `ip`, `expires_at`, `revoked_at`, `replaced_by`, `created_at`.
3. **`staff_audit_logs`**:
   - `id` (UUID PK), `actor_id` (varchar 64), `action` (varchar 100), `target_type` (varchar 50), `target_id` (varchar 64), `ip`, `meta` (JSONB), `created_at`.
4. **`users`** (App realm):
   - `id` (UUID PK), `name`, `email` (unique), `password_hash`, `role` (`driver` | `passenger`), `is_active` (bool), `created_at`, `updated_at`.
5. **`driver_profiles`**:
   - `user_id` (UUID PK), `licence_number`, `vehicle_card_number`, `plate_number`, `licence_image_url`, `profile_picture_url`, `verified` (bool), `average_rating` (float64), `total_ratings` (int), `created_at`, `updated_at`.
6. **`passenger_profiles`**:
   - `user_id` (UUID PK), `full_name`, `profile_picture_url`, `phone`, `average_rating` (float64), `total_ratings` (int), `created_at`, `updated_at`.
7. **`ratings`**:
   - `id` (UUID PK), `from_user_id` (UUID), `to_user_id` (UUID), `score` (int 1-5), `comment`, `created_at`.

---

## 5. Network, Ports, and CORS

- **Local Port**: Port 3000 (specified in `RideBackend-Rewrite-/.env` as `PORT=3000`).
- **Base Path**: `/api/v1`.
- **CORS Allowed Origins**: Specified in backend `.env` / config (`CORS_ALLOWED_ORIGINS`). Recommended values: `http://localhost:5173,http://localhost:3000`.
- **Static Assets**:
  - Public images: `GET /api/v1/uploads/*`
  - Private licence files: `GET /api/v1/files/licences/:id` (requires valid Staff or owning Driver Bearer token).

---

## 6. Realtime & WebSocket Capabilities

**Inspection Finding**:
No WebSocket, Socket.IO, Server-Sent Events (SSE), or MQTT endpoints exist in the backend source code. All operations are strictly standard HTTP JSON REST endpoints. Realtime features (such as live dispatch or fleet telemetry) must rely on controlled HTTP polling until server-side event streaming is implemented.
