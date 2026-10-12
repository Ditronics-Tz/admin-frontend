# Promotions and referrals

The Promotions navigation entry opens `/promotions`. It uses the existing
React Router workspace, Radix components, React Hook Form, TanStack Query,
Sonner toasts and shared Axios client. No dependencies were added.

Routes:

- `/promotions`: global stat cards, search, audience filter, status tabs,
  paginated table/cards, copy codes, and row actions.
- `/promotions/new`: create, generate a code, choose recipients, preview,
  save draft or activate.
- `/promotions/:id`: overview, audience management, redemption history and share.
- `/promotions/:id/edit`: edit with financial and audience fields locked after use.
- `/promotions/referrals`: referral settings and filtered referral history.

The existing passenger account details dialog now includes granted promos and
redemptions. All API requests use `/api/v1` through the existing API configuration.
There is no mock fallback in the product: backend errors are shown with retries.

## Permissions and sessions

Staff roles come from the current authenticated session. Support can read all
promotion/referral views; write buttons are hidden and form inputs disabled.
A 403 switches the entire feature to read-only for the current staff session.
The original backend error remains visible, including the existing setup-2FA
link when relevant. A new sign-in, role change, or changed TOTP enrollment clears
that denial. Backend authorization remains authoritative.

The existing Axios interceptor attaches the staff access token, shares one
refresh operation between concurrent 401 responses, rotates refresh tokens, and
retries each request once. Promotion requests use that client unchanged; they
also work when the 15-minute access token expires during editing.

## Contract assumptions

- List responses omit audience counts and total discounts. Audience badges use
  cached detail requests. Global statistics paginate all promos and sum applied
  discounts from detail responses, with at most six concurrent detail requests.
  These cards are cached for one minute. A backend aggregate endpoint would be
  preferable for a large promo catalog; the frontend currently uses only the
  documented endpoints and never invents totals from the current page.
- Referral and redemption rows contain account IDs. Names and contact information
  are loaded through the existing user detail endpoint and cached by user ID.
  Deleted/unavailable accounts retain their ID and a retry control.
- Status is not patchable. Creation first saves a draft, adds selected recipients,
  then calls resume when activation was requested. Failed later steps preserve
  the created draft ID so retries do not create duplicate promos. Editing an
  existing active/paused/archived promo offers Save changes; Save as draft is
  offered for new/draft promos. Save and activate uses resume for draft/paused.
- Audience CSV/paste accepts phone/email columns, quoted cells, comma/semicolon/
  tab delimiters and newlines. Search-selected accounts are staged for a new
  promo. Pasted identifiers are resolved by the backend on save. Reports show
  added/already-present counts and rejected identifiers; current grants can be
  removed in the detail audience table. Initial and pasted identifiers referring
  to the same passenger are deduplicated by the backend.
- Sharing confirms the audience count from detail and shows the returned count.
  The current backend notifier logs acceptance and does not send SMS or push;
  success says notifications were accepted, rather than claiming delivery.
- All displays/input conversions use Africa/Dar_es_Salaam (UTC+3), independent
  of the browser timezone. Money displays as `TSh 5,000`. Inputs accept whole
  numbers; unsafe JavaScript integers are rejected instead of silently rounding
  a large backend int64 amount.
- English message IDs are fallback translations. Common labels have Swahili
  translations and follow the existing UI locale; remaining English messages
  can be translated in `i18n.ts` without changing components. Navigation follows
  the existing English navigation configuration.

Radix dialogs trap focus, support Escape, and have accessible titles and
descriptions. Inputs have labels and field errors. Pause/archive/share require
confirmation. Form navigation and browser closing warn about unsaved changes.
Tables become labelled stacked cards below 768px. Lists have skeleton, empty,
error and retry states.

## Validation

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
The existing Node test runner covers API verbs/payloads, expired-token refresh,
400/409 field mappings, 403 read-only switching, role-gated component rendering,
used-promo locks, complete-catalog statistics, bounded requests, CSV parsing,
client validation, TZS formatting and Tanzania date input round-trips. CSS imports
are ignored only by the Node component test loader.

These are HTTP contract and server-rendered component tests, rather than a full
interactive browser test suite. No application data is created by those tests.
