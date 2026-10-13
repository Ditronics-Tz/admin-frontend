# Backend requests from admin UI

Contracts will be reconciled against backend `docs/api/openapi.yaml` and `docs/ship/api-changes.md` as tasks progress.

- F2: POST `/admin/users/:id/reveal-phone` → `{phone}` with a persisted audit entry. Required for shared MaskedValue; parent has confirmed B6 is planned. Missing endpoint gracefully leaves phone masked.
