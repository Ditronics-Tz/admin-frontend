# Frontend implementation status

- F1: done; `ship/fe-ci` plus `ship/fe-clean-checkout`; clean Windows npm ci/format/lint/typecheck/41 tests/build pass; seven advisories explicitly deferred; hosted CI pending owner push.
- F2: done; `ship/fe-api`; phone reveal endpoint waiting on B6, graceful masked fallback present; checks pass.
- F3: local implementation done; `ship/fe-token-csp`; isolated refresh exception documented; browser CSP/hosting acceptance pending because browser check was blocked by policy.
- F4: local implementation done; `ship/fe-pagination`; B4 filters/readiness implemented in source; deployed integration smoke pending.
- F5: local implementation done; `ship/fe-user-security` and `ship/fe-auth-integration`; user sessions/events/revoke/unlock fixtures match the approved B5 contract; staff 2FA replacement/pending activation and memory access rotation integrated; B5 source reconciliation and deployed smoke pending.
- F6: local implementation done; `ship/fe-verification`; B3/B4 presign/expiry-filter pagination implemented in source; provider configuration/deployed integration smoke pending.
- F7: local implementation done; `ship/fe-support`; checks pass; waiting on B8 persisted tickets/complaints and unified report patch/notes contract.
- F8: local implementation done; `ship/fe-rides`; checks pass; waiting on B7/B8 canonical ride detail/actions/counts; production map provider configuration required.
- F9: local implementation done; `ship/fe-ratings`; checks pass; waiting on B8 ratings moderation list/hide/restore.
