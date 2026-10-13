# Frontend implementation status

- F1: done; `ship/fe-ci` plus `ship/fe-clean-checkout`; clean Windows npm ci/format/lint/typecheck/41 tests/build pass; seven advisories explicitly deferred; hosted CI pending owner push.
- F2: done; `ship/fe-api`; phone reveal endpoint waiting on B6, graceful masked fallback present; checks pass.
- F3: local implementation done; `ship/fe-token-csp`; isolated refresh exception documented; browser CSP/hosting acceptance pending because browser check was blocked by policy.
- F4: local implementation done; `ship/fe-pagination`; B4 filters/readiness implemented in source; deployed integration smoke pending.
- F5: local implementation done; `ship/fe-user-security` and `ship/fe-auth-integration`; sessions/events/revoke/unlock and staff 2FA replacement/pending activation match landed B5 controllers/routes/models; local checks pass; backend B5 acceptance and deployed smoke pending.
- F6: local implementation done; `ship/fe-verification`; B3/B4 presign/expiry-filter pagination implemented in source; provider configuration/deployed integration smoke pending.
- F7: done; `ship/fe-b8-integration`; support tickets use the persisted ticket workflow; complaint/report detail routes use the existing audited report actions; filters, notes, and resolution match backend contracts; checks pass.
- F8: done; `ship/fe-b8-integration`; ride filters, Tanzania-local date ranges, canonical detail/actions/counts match B7/B8; checks pass; production map tile provider configuration remains an owner deployment dependency.
- F9: done; `ship/fe-b8-integration`; moderation filters, visibility state, admin-only controls, and required audited reasons match B8; checks pass.
