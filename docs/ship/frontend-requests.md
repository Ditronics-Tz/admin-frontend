# Backend requests from admin UI

Contracts will be reconciled against backend `docs/api/openapi.yaml` and `docs/ship/api-changes.md` as tasks progress.

- F2: POST `/admin/users/:id/reveal-phone` → `{phone}` with a persisted audit entry. Required for shared MaskedValue; parent has confirmed B6 is planned. Missing endpoint gracefully leaves phone masked.
- F4: `/admin/users` accepts status, verification_status and sort_by/sort_order in addition to role/q/limit/offset. Drivers count with `limit=1` and total, including inactive status. Vehicle type filter remains disabled pending an authoritative backend field. `/admin/staff` accepts q/role/status/limit/offset. `/admin/audit-logs` accepts q/action/actor/from/to/limit/offset. `/ready` returns `{status,database,version,uptime_seconds}`. Parent confirmed B4 plans these filters and readiness (sort contract still to reconcile).
