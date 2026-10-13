# Admin UI ship implementation

## F1 — Baseline and CI

Branch: `ship/fe-ci`. Preserved pre-existing task fixes in `ship/fe-baseline` (`d632298`) before beginning the ship work.

The current checkout had 12 source formatting failures, rather than the eight in the audit snapshot. Applied the existing Prettier configuration. Added clean-checkout CI with Node 24 (required by the existing test loader), npm ci, format, lint, typecheck, tests, build, and report-only dependency audit.

### Advisory dispositions (npm audit, 13 October 2026)

| Package | Severity | Disposition | Reason |
| --- | --- | --- | --- |
| braces | High | Defer | GHSA-vfj7-8cjw-p6xm; installed build dependency, npm offers only a Tailwind major upgrade. |
| chokidar | High | Defer | Inherits braces exposure through Tailwind's build watcher. |
| micromatch | High | Defer | Inherits braces exposure through build glob matching. |
| fast-glob | High | Defer | Inherits micromatch exposure in the Tailwind build chain. |
| tailwindcss | High | Defer | npm recommends 4.3.3, a major migration explicitly excluded from this run. |
| postcss-selector-parser | Moderate | Defer | GHSA-rj75-hqrm-r3gf; npm offers a Tailwind major migration, not a compatible patch. |
| postcss-nested | Moderate | Defer | Inherits selector parser exposure through Tailwind's build chain. |

No safe patch upgrade was offered by the installed lockfile audit. These are deferred advisories, not resolved security findings. CI publishes the current result without forcing a major upgrade. Build inputs should remain repository controlled pending the migration.

Validation: format check, typecheck, tests (29/29), and production build passed. Lint passed with five existing Fast Refresh warnings. npm audit reported the seven deferred advisories above. The CI uses npm ci to exercise a clean checkout; a hosted CI run is pending push/PR by the owner.
