# Road to 5K — implementation and local verification

## Scope

The existing Next.js 14 App Router `/health` now uses 10 evidence-based achievements. No new project, training plan, calendar, authentication system, push, deployment, or production migration was created.

Reference originals were read without modification; copies are in `references/health-redesign/`. `CODEX_PROMPT.md` is the rules source. Prototype/sample charts are never loaded as user data.

## Rules and evidence

- L1–L5: continuous running at least 1 / 2 / 2.5 / 3 / 4 km, no pace limit.
- L6: at least 5 km, continuous or explicit run/walk. Walking alone does not qualify.
- L7: at least 5 km continuous, no pace limit.
- L8–L10: at least 5 km continuous, average pace at most 600 / 540 / 480 seconds/km.
- Evaluate `duration_seconds / distance_km` before display rounding. A 5.5 km / 44:00 run qualifies for L10; 5 km / 40:01 does not.
- Read every history page; never use old cached progress or old result labels as evidence. Compute a contiguous completed prefix and the first missing level; retain later evidence as pending.
- Level Progress = contiguous completed levels / 10. Distance Progress = highest non-deleted non-walking distance / 5 km, capped at 100%.
- Legacy `no_stop=true` proves continuous running. False/missing is unknown, never inferred as run/walk. Pace-only legacy duration is labelled estimated and cannot certify timed L8–L10.
- Personal Best is all-time historical performance; Latest Activity is separate. A 5K time is shown only for exactly 5.00 km continuous records with recorded elapsed time. No fabricated splits.

## Persistence and safety

The repository uses `lib/supabase/rest.ts` with a server-side service-role key and shared run history. Vercel Production allows visitors to add a run once the database schema is ready. Set `GOAL_HEALTH_PUBLIC_LOGGING=false` in Vercel Production and redeploy to pause public submissions.

For personal use on the loopback development server, select your Supabase database in `.env.local`, set `GOAL_HEALTH_WRITES_ENABLED=true` in `.env.development.local`, and restart `npm run dev`. That flag enables edits, soft deletion and rest-day changes for the entire instance. Keep it off on public deployments.

The migration `supabase/migrations/20261110090000_running_ten_levels.sql`:

1. Adds `activity_type` (default unknown), `deleted_at`, and `updated_at` to run history; leaves original no_stop, duration, pace, note, result, level_id, effort and created_at unchanged.
2. Copies each existing run to a revision journal once, then journals every update transactionally via a trigger.
3. Preserves the existing five level UUIDs and foreign keys while updating rule metadata, and adds L6–L10. Pace limits become nullable.
4. Leaves all legacy level progress and reward records intact; computed read models replace them as the UI source.
5. Uses soft deletion in the application. Revisions preserve prior versions when a user edits or removes a run. No DELETE is sent by the new Health path.
6. Uses updated_at preconditions for edits/deletes to reject stale tabs instead of silently overwriting concurrent changes.

After full access became available, this migration was executed verbatim against an isolated in-memory PostgreSQL runtime (PGlite 0.5.16), with the repository's old schema, seven reference fixture records, and simulated Supabase roles. Nine SQL integration checks passed. The check found and fixed a missing explicit SELECT/INSERT grant for service_role on the revision journal; the trigger no longer depends on project default privileges. No production or hosted Supabase migration has been applied. Rehearsal on the intended disposable Supabase clone remains advisable to verify its project-specific settings and PostgREST integration.

Read-only live inspection on 2026-11-10 confirmed: 5 existing levels, 7 history records, all 7 with `no_stop=true` and valid elapsed seconds, new columns not yet present. No production writes were made. A fresh backup and migration rehearsal remain prerequisites for a future rollout.

A read-only check on 2026-11-18 found all ten stored level definitions, the run history columns used by the readiness check, and the revision journal on the configured Supabase project.

## Open locally for a read-only review

In the repository PowerShell terminal:

```powershell
$env:GOAL_HEALTH_WRITES_ENABLED='false'
npm run dev -- --port 3000
```

Open http://localhost:3000/health. Existing `.env.local` supplies the existing read connection. Do not enable writes or run migrations against that connection during review. The original 7 rows remain available and levels are computed with the new rules immediately.

## Automated checks

```powershell
npm run lint
npm run typecheck
npm test
npm run test:health
```

Existing money/blood-donation/dashboard suites remain part of `npm test`. Health tests cover all thresholds, run/walk, walking, unknown continuity, time parsing, raw pace precision, longer-than-5K runs, historical unlocks, 1,006-row pagination, input validation, preservation, concurrency conflicts, continued logging after L10, and action failures.

## Isolated build and browser tests (no Supabase connection)

Terminal A:

```powershell
node tests/health/mock-server.cjs
```

Terminal B:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54125'
$env:SUPABASE_SERVICE_ROLE_KEY='local-test-only'
$env:GOAL_HEALTH_WRITES_ENABLED='true'
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

Terminal C, using the Playwright installation available on this task machine:

```powershell
$env:NODE_PATH='C:\Users\Jouloung\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node tests/health/browser.cjs
```

The test uses installed Chrome headlessly. `GOAL_TEST_BROWSER_CHANNEL=msedge` selects installed Edge instead. On another machine, provide a local Playwright installation via NODE_PATH. No new npm dependencies were added.

The REST simulator binds to loopback and stores fixtures in memory only. It is a verification tool, not production persistence or a seed script. Browser tests perform real Next server actions against it, exercise desktop/mobile, keyboard, motion, save/edit/delete/reload, empty/loading/error/retry states, and check console errors. Screenshots and JSON results go to ignored `tmp/health-verification/`.

Stop these local processes with Ctrl+C when finished. In a new terminal, run normal `npm run dev` to return to existing data. Do not reuse a fixture-built `.next` directory for release; rebuild with the intended reviewed environment after migration rehearsal.

## Files changed by this task

- `.gitignore`: ignore temporary Health renders/test artifacts.
- `package.json`: retain existing test suites; add running tests and typecheck/test:health scripts.
- `app/health/page.tsx`, `actions.ts`, `loading.tsx`, `error.tsx`: page, server actions and resilient UI states.
- `components/health/RunnerQuestDashboard.tsx`, `RunnerQuestLogForm.tsx`, `running.module.css`: responsive Neon Sport UI, real-data charts, records, editing and motion/accessibility controls. Existing goal Vision Board image integration remains.
- `lib/running/achievements.ts`, `quest.ts`, `quest.types.ts`, `quest.server.ts`, `progress.ts`: rule engine, compatibility, read models and persistence.
- `lib/running/achievements.test.cjs`, `persistence.test.cjs`: unit/service/action regression tests.
- `supabase/migrations/20261110090000_running_ten_levels.sql`: unapplied additive migration.
- `tests/health/helpers.cjs`, `mock-server.cjs`, `browser.cjs`, `migration.cjs`: isolated verification infrastructure.
- `references/health-redesign/`: five unmodified reference copies.
- `docs/health-road-to-5k.md`: this review/runbook.

Pre-existing unrelated working-tree edits were left in place. `components/health/RunnerQuestDashboard.tsx` and `package.json` already had user edits; their shared distance helper and existing test suites were retained. No Git push or deployment was performed.

## Final verification (2026-11-10)

- `npm run lint`: PASS, no warnings/errors.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 68 tests (existing suites included).
- `npm run build`: PASS against isolated REST fixtures; `/health` first load JS 115 kB.
- Browser: PASS, 13 checks at desktop 1440 px and mobile 390/320 px, including full save/edit/soft-delete/reload and server-error recovery. No unexpected page or console errors. Deliberately injected failed backend responses were expected in the recovery test.
- Screenshot review: desktop and mobile, including settled animations and separate 20% level / 40.2% distance progress for reference fixtures.
- Reference copy SHA-256 comparisons: all five match originals.
- `git diff --check`: PASS. No dependency/lockfile changes or unrelated user edits overwritten.
- PostgreSQL migration execution/trigger integration: PASS, 9 checks in isolated PGlite (added after full access). Original fields, level UUIDs, rewards, rerun safety, trigger permissions, stale updates, soft deletion, rollback, denied anonymous/authenticated access and restricted physical deletion were checked. Hosted Supabase/PostgREST integration remains a rollout check.
- Build emitted an existing outdated Browserslist data advisory during verification; it does not fail compilation.

## Repeat the SQL integration test

The optional [PGlite runtime](https://pglite.dev/docs/) is installed only into an ignored temporary directory; the application's package.json and lockfile do not gain dependencies. It runs PostgreSQL in memory without reading .env or connecting to any remote database.

```powershell
npm install --prefix tmp/health-verification/sql-runtime --no-save --package-lock=false --ignore-scripts @electric-sql/pglite@0.5.16
node tests/health/migration.cjs
```

The harness uses the original running/reward migrations and timestamp trigger, creates isolated anon/authenticated/service_role roles, and inserts only reference fixtures. The old pgcrypto extension bootstrap is omitted because gen_random_uuid is built into this runtime; the new 10-Level migration itself is executed unchanged. JSON results are written to `tmp/health-verification/sql-results.json`.
