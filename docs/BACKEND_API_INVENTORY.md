# Backend API Inventory Contract

> Historical snapshot. Driver verification and account controls below are superseded by [the current integration contract](ADMIN_API_INTEGRATION.md) and `RideBackend-Rewrite-/docs/VERIFICATION.md`. Boolean verification is retired.

**Project**: Rida Ride-Hailing Platform  
**Backend Source Directory**: `RideBackend-Rewrite-/`  
**Verified Under**: Fiber v2 `/api/v1` route prefix  
**Status**: Confirmed from Go backend source code (`routes/`, `controllers/`, `models/`, `store/`)  

---

## Complete Discovered Endpoints Contract Table

| Module | Method | Endpoint | Auth | Permission | Request Body / Params | Response Structure | Source File & Line |
|---|---|---|---|---|---|---|---|
| **System** | `GET` | `/api/v1/health` | None | Public | None | `{"status":"ok", "version":"1.0.0"}` | `routes/app.go:50-55` |
| **Static Files** | `GET` | `/api/v1/uploads/*` | None | Public | File path parameter | Static image binary (`./uploads/public`) | `routes/app.go:58` |
| **Files** | `GET` | `/api/v1/files/licences/:id` | Bearer Token | Staff (`admin`, `support`) OR Owning Driver | Path param: `:id` (user_id or licence filename) | Document file stream (`./uploads/licences/*`) or 401/403/404 | `controllers/file_controller.go:27-111`, `routes/file_routes.go:11` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/login` | None (Public) | None | Body: `{"email": string, "password": string, "totp_code"?: string}` | `{"access_token": string, "refresh_token": string, "must_change_password": bool, "user": StaffUserResponse}` | `controllers/staff_auth_controller.go:105-216`, `routes/staff_auth_routes.go:16` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/refresh` | None (Public) | None | Body: `{"refresh_token": string}` | `{"access_token": string, "refresh_token": string, "user": StaffUserResponse}` | `controllers/staff_auth_controller.go:219-280`, `routes/staff_auth_routes.go:17` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/logout` | Bearer Token (`StaffProtected`) | Any active staff | Optional Body: `{"refresh_token": string}` | `{"message": "Logged out successfully"}` | `controllers/staff_auth_controller.go:283-301`, `routes/staff_auth_routes.go:21` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/logout-all` | Bearer Token (`StaffProtected`) | Any active staff | None | `{"message": "All sessions revoked"}` | `controllers/staff_auth_controller.go:304-313`, `routes/staff_auth_routes.go:22` |
| **Staff Auth** | `GET` | `/api/v1/staff/auth/me` | Bearer Token (`StaffProtected`) | Any active staff | None | `{"user": StaffUserResponse}` | `controllers/staff_auth_controller.go:316-322`, `routes/staff_auth_routes.go:23` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/change-password` | Bearer Token (`StaffProtected`) | Any active staff | Body: `{"current_password": string, "new_password": string}` (min 12 chars) | `{"message": "Password changed successfully"}` | `controllers/staff_auth_controller.go:325-366`, `routes/staff_auth_routes.go:24` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/2fa/setup` | Bearer Token (`StaffProtected`) | Any active staff | None | `{"secret": string, "qr_code_url": string}` | `controllers/staff_auth_controller.go:369-399`, `routes/staff_auth_routes.go:25` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/2fa/verify` | Bearer Token (`StaffProtected`) | Any active staff | Body: `{"code": string}` (6 digits) | `{"message": "2FA enabled successfully", "totp_enabled": true}` | `controllers/staff_auth_controller.go:402-436`, `routes/staff_auth_routes.go:26` |
| **Staff Auth** | `POST` | `/api/v1/staff/auth/2fa/disable` | Bearer Token (`StaffProtected`) | Any active staff | Body: `{"password": string, "code": string}` | `{"message": "2FA disabled successfully"}` | `controllers/staff_auth_controller.go:439-474`, `routes/staff_auth_routes.go:27` |
| **Admin Oversight** | `GET` | `/api/v1/admin/users` | Bearer Token (`StaffProtected`) | `admin`, `support` | Query: `?role=driver` or `?role=passenger` | `{"count": int, "users": UserResponse[]}` | `controllers/admin_controller.go:30-38`, `routes/admin_routes.go:21` |
| **Admin Oversight** | `GET` | `/api/v1/admin/users/:id` | Bearer Token (`StaffProtected`) | `admin`, `support` | Path param: `:id` (user UUID) | `{"user": UserResponse, "driver_profile"?: DriverProfile, "passenger_profile"?: PassengerProfile, "average_rating": float64, "total_ratings": int}` | `controllers/admin_controller.go:41-58`, `routes/admin_routes.go:22` |
| **Driver Verification** | `PATCH` | `/api/v1/admin/drivers/:id/verify` | Bearer Token (`StaffProtected`) | `admin`, `support` | Path param: `:id` (driver user UUID), Body: `{"verified": bool}` | `{"message": "driver verification updated", "driver_profile": DriverProfile}` | `controllers/admin_controller.go:87-104`, `routes/admin_routes.go:23` |
| **Dashboard Stats** | `GET` | `/api/v1/admin/stats` | Bearer Token (`StaffProtected`) | `admin`, `support` | None | `{"total_drivers": int, "total_passengers": int, "active_rides": 0, "open_tickets": 0, "open_complaints": 0}` | `controllers/admin_controller.go:109-119`, `routes/admin_routes.go:24` |
| **Rides** | `GET` | `/api/v1/admin/rides` | Bearer Token (`StaffProtected`) | `admin`, `support` | None | `{"count": 0, "rides": []}` (Backend stub) | `controllers/admin_controller.go:122-124`, `routes/admin_routes.go:25` |
| **Complaints** | `GET` | `/api/v1/admin/complaints` | Bearer Token (`StaffProtected`) | `admin`, `support` | None | `{"count": 0, "complaints": []}` (Backend stub) | `controllers/admin_controller.go:127-129`, `routes/admin_routes.go:26` |
| **Complaints** | `PATCH` | `/api/v1/admin/complaints/:id` | Bearer Token (`StaffProtected`) | `admin`, `support` | Path param: `:id` | `{"message": "complaint updated", "id": id, "status": "resolved"}` | `controllers/admin_controller.go:132-139`, `routes/admin_routes.go:27` |
| **Tickets** | `GET` | `/api/v1/admin/tickets` | Bearer Token (`StaffProtected`) | `admin`, `support` | None | `{"count": 0, "tickets": []}` (Backend stub) | `controllers/admin_controller.go:142-144`, `routes/admin_routes.go:28` |
| **Tickets** | `PATCH` | `/api/v1/admin/tickets/:id` | Bearer Token (`StaffProtected`) | `admin`, `support` | Path param: `:id` | `{"message": "ticket updated", "id": id, "status": "in_progress"}` | `controllers/admin_controller.go:147-154`, `routes/admin_routes.go:29` |
| **User Role Oversight** | `PATCH` | `/api/v1/admin/users/:id/role` | Bearer Token (`StaffProtected`) | `admin` only | Path param: `:id`, Body: `{"role": "driver" \| "passenger"}` | `{"message": "role updated", "user": UserResponse}` | `controllers/admin_controller.go:61-84`, `routes/admin_routes.go:32` |
| **Audit Logs** | `GET` | `/api/v1/admin/audit-logs` | Bearer Token (`StaffProtected`) | `admin` only | Query: `?limit=50&offset=0` | `{"total": int64, "limit": int, "logs": StaffAuditLog[]}` | `controllers/admin_controller.go:159-172`, `routes/admin_routes.go:33` |
| **Staff Management** | `POST` | `/api/v1/admin/staff` | Bearer Token (`StaffProtected`) | `admin` only | Body: `{"name": string, "email": string, "role": "admin" \| "support"}` | `{"message": "...", "staff": StaffUserResponse, "one_time_password": string}` | `controllers/admin_controller.go:177-221`, `routes/admin_routes.go:36` |
| **Staff Management** | `GET` | `/api/v1/admin/staff` | Bearer Token (`StaffProtected`) | `admin` only | None | `{"count": int, "staff": StaffUserResponse[]}` | `controllers/admin_controller.go:224-231`, `routes/admin_routes.go:37` |
| **Staff Management** | `PATCH` | `/api/v1/admin/staff/:id` | Bearer Token (`StaffProtected`) | `admin` only | Path param: `:id`, Body: `{"name"?: string, "is_active"?: bool}` | `{"message": "...", "staff": StaffUserResponse}` | `controllers/admin_controller.go:234-284`, `routes/admin_routes.go:38` |
| **Staff Management** | `PATCH` | `/api/v1/admin/staff/:id/role` | Bearer Token (`StaffProtected`) | `admin` only | Path param: `:id`, Body: `{"role": "admin" \| "support"}` | `{"message": "Staff role updated", "staff": StaffUserResponse}` | `controllers/admin_controller.go:287-333`, `routes/admin_routes.go:39` |
| **Staff Management** | `POST` | `/api/v1/admin/staff/:id/reset-password` | Bearer Token (`StaffProtected`) | `admin` only | Path param: `:id` | `{"message": "Password reset successfully", "one_time_password": string}` | `controllers/admin_controller.go:336-370`, `routes/admin_routes.go:40` |
| **Staff Management** | `POST` | `/api/v1/admin/staff/:id/revoke-sessions` | Bearer Token (`StaffProtected`) | `admin` only | Path param: `:id` | `{"message": "All sessions revoked"}` | `controllers/admin_controller.go:373-389`, `routes/admin_routes.go:41` |

---

## App Realm Endpoints (Reference Only — Not for Admin Frontend Directly)

| Module | Method | Endpoint | Auth | Purpose |
|---|---|---|---|---|
| App Auth | `POST` | `/api/v1/auth/register` | Public | Driver / Passenger self-registration (`routes/auth_routes.go:15`) |
| App Auth | `POST` | `/api/v1/auth/login` | Public | Driver / Passenger login (`routes/auth_routes.go:16`) |
| App Auth | `GET` | `/api/v1/auth/me` | App Token (`AppProtected`) | Current passenger or driver profile (`routes/auth_routes.go:23`) |
| Driver Profile | `GET` | `/api/v1/driver/profile/me` | App Token (Driver) | Driver views own profile (`routes/profile_routes.go:16`) |
| Driver Profile | `PUT` | `/api/v1/driver/profile/me` | App Token (Driver) | Driver updates license/plate (`routes/profile_routes.go:17`) |
| Driver Profile | `POST` | `/api/v1/driver/profile/me/images` | App Token (Driver) | Multipart upload for license and avatar (`routes/profile_routes.go:18`) |
| Driver Lookup | `GET` | `/api/v1/driver/profile/:userId` | App Token (Any) | Lookup driver profile by ID (`routes/profile_routes.go:20`) |
| Passenger Profile| `GET/PUT` | `/api/v1/passenger/profile/me` | App Token (Passenger)| Passenger self profile (`routes/profile_routes.go:23-24`) |
| Ratings | `POST` | `/api/v1/ratings/` | App Token | Submit rating (`routes/rating_routes.go:15`) |
| Ratings | `GET` | `/api/v1/ratings/user/:userId`| App Token | List ratings for user (`routes/rating_routes.go:16`) |
