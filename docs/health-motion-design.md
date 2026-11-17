# Health — cinematic neon motion implementation

Implemented on `codex/health-road-to-5k`, verified 2026-11-10. This extends the existing GOAL Next.js `/health` route. Branding, fonts, navigation, ten achievement rules and the existing write controls are retained.

## Motion map

| Area | Implemented behavior |
| --- | --- |
| Hero | Ambient entrance, runner reveal at 150 ms, masked title stagger at 300/380/440 ms, a single light sweep, finish card at 700 ms, progress sequence at 800/950/1100 ms. Subtle layered trails and a mouse-only parallax limited to ±6/4 px. |
| Progress | Separate Level and Distance progress, transform-based fills with a luminous leading edge, accurate count-up values. Final values are server-rendered and available to screen readers; DOM-only animation avoids rerendering the dashboard each frame. Counters do not restart on form renders. |
| Roadmap | Ten accessible details cards. Completed circular badges, current-level border beam and slow breathing light, readable metallic locked cards. Hover lift/reflection does not move neighboring cards. |
| Confirmed unlock | After a successful action, match the save receipt against refreshed server records. Only newly passed levels are highlighted, with checkmark draw, a short burst, one combined announcement and updated progress. No celebration on initial load, reload, failed save or unrelated refresh. |
| Personal Best | Trophy treatment and genuine improved-record badges. Ties, worse results and walking do not create fake PBs. Existing PB definitions are unchanged. |
| Form | Focus ring and field highlighting, animated computed pace, button sweep/press feedback, loading spinner, success checkmark. A synchronous submit lock prevents repeated dispatch before React has rendered the pending state. |
| Analytics | Real last-12-record distance bars, pace line draw, smooth scale transitions, keyboard/touch tooltip and once-per-mount section reveal. |
| History | New-row entrance/highlight, layout-position transitions and exit after confirmed deletion. Edit/delete feedback is neutral; progress remains derived from the server. |
| Controls | Effects preference saved in the existing localStorage key; OS reduced motion overrides it. Decorative motion pauses offscreen and in hidden tabs. Mobile/low-capability modes reduce ambient work and particles. |

The image comes from the existing supplied reference; its provenance is in `public/health/README.md`. No screenshot is used as interface content.

## Changed files in this motion pass

| Files | Purpose |
| --- | --- |
| `components/health/RunnerQuestDashboard.tsx` | Compose sections; save snapshots, confirmation and temporary feedback lifecycle. |
| `components/health/RunnerQuestLogForm.tsx` | Focus/loading/success interactions and duplicate-submit guard. |
| `components/health/RunningRoadmap.tsx` | Ten-level visual states and unlock highlights. |
| `components/health/RunAnalytics.tsx` | Interactive bars, pace line and tooltip. |
| `components/health/RunHistory.tsx` | Animated real records, edit/delete feedback. |
| `components/health/running.module.css` | Scoped neon surfaces, responsive layouts, motion and accessibility overrides. |
| `components/health/motion/tokens.ts` | Shared rhythm, timing and feedback lifetime. |
| `components/health/motion/RunMotionProvider.tsx` | Preference, media query, visibility observer and Framer Motion boundary. |
| `components/health/motion/AnimatedValues.tsx` | Accurate number and progress animation with cleanup. |
| `components/health/motion/CinematicHero.tsx` | Hero composition and bounded pointer depth. |
| `components/health/motion/AchievementFeedback.tsx` | Dismissible single-summary celebration or neutral feedback. |
| `components/health/motion/feedback.ts` | Presentation-only snapshots and confirmed save/PB attribution. |
| `public/health/runner-reference.webp`, `public/health/README.md` | Existing runner asset and provenance. |
| `lib/running/motion.test.cjs` | Eight feedback safety tests. |
| `tests/health/browser.cjs` | Existing regression suite adapted to animated values and asynchronous cleanup. |
| `tests/health/motion-browser.cjs` | Sixteen motion, interaction, accessibility and performance checks. |
| `tests/health/preview-browser.cjs` | Read-only inspection of actual localhost:3001. |
| `tests/health/prepare-motion-build.cjs` | Environment-free verification copy of the same app, avoiding interference with existing dev servers. |
| `docs/health-motion-design.md` | This report and reproduction guide. |

No dependencies were added. The implementation uses the existing `framer-motion`, `lucide-react`, React, CSS and browser animation APIs. No Three.js/WebGL is used.

## Functional and database safety

SHA-256 comparison with the pre-motion snapshot confirmed no changes to `achievements.ts`, `quest.ts`, `quest.server.ts`, `quest.types.ts`, `progress.ts`, Health server actions, the existing migration, Next configuration, package files or `.env.local`.

No schema/migration/authentication/persistence changes in this pass. No production writes, reset, push or deployment. The actual preview still displays all seven existing records and has its write button disabled. All browser mutation scenarios use a loopback-only in-memory REST fixture, the existing server actions and the original feature flag. No test-only bypass was added to the application.

## Verification results

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, no warnings/errors. |
| `npm run typecheck` | Passed. |
| `npm test` | 76/76 passed, including eight new feedback tests. |
| `npm run build` | Passed on an isolated copy of this same source with fixture-only environment. All 24 static pages generated. |
| Existing Health browser regression | 13/13 passed against the production build. |
| Motion acceptance | 16/16 passed against the production build. |
| Actual `localhost:3001/health` | HTTP 200; ten levels, seven records, write guard retained; desktop/mobile inspected. |
| Responsive | 1440, 1024, 390 and 320 px: no page horizontal overflow. |
| Accessibility | Keyboard details, visible focus, chart tooltip, mobile navigation/Escape, effects OFF and OS reduced motion verified. |
| Lifecycle | Observer disconnect on navigation and no duplicate observers after return; timers, rAF and native animations have cleanup. |
| Console | No unexpected errors/hydration warnings in fixture browser checks. Actual preview has an existing `/favicon.ico` 404, recorded separately. |

Screenshots are captured without forcibly cancelling animations so the screenshot harness does not interfere with subsequent animation-toggle checks.

Final production-browser sample: 119 measured frame intervals after warm-up, median **16.7 ms**, p95 **16.8 ms**, maximum **16.9 ms**; measured cumulative layout shift **0.00327** across the scenario. One 95 ms long task was observed during page startup. Four ambient animations were running while the hero was visible; offscreen pause was independently verified. These are local headless Chrome measurements, not a guarantee of 60 FPS on every physical device.

Build reports `/health` at **20.3 kB route JS / 166 kB first-load JS**. First-load JS grew from approximately 115 kB before this motion pass, primarily from using the existing Framer Motion runtime for layout and presence transitions. The runner source is 20.8 kB. Count-up work is finite, avoids unchanged text writes and does not trigger React renders per frame. Browser testing did not reveal sustained frame stalls in the measured interval.

## Screenshots and machine-readable evidence

All paths below are relative to the repository and ignored by Git:

- `tmp/health-verification/motion/local-desktop.png` — actual localhost:3001, existing data.
- `tmp/health-verification/motion/local-mobile.png` — actual localhost:3001, 390 px.
- `tmp/health-verification/motion/desktop.png`, `laptop.png`, `mobile.png`, `mobile-small.png` — full-page fixture review at all four widths.
- `tmp/health-verification/motion/unlock.png` — confirmed multi-level celebration in the isolated fixture.
- `tmp/health-verification/motion/motion-results.json` — sixteen checks and performance sample.
- `tmp/health-verification/motion/local-preview-results.json` — actual-preview findings including favicon diagnostic.
- `tmp/health-verification/browser-results.json` — thirteen regression checks.

## Try the effects at localhost:3001/health

Open http://localhost:3001/health. The existing development server is already running. Reload to see the opening sequence; hover the hero/current level; expand a level using Tab then Enter; switch the chart between distance and Pace; focus a graph point; change the form distance/time to see live pace. The effect toggle is at the top-right. Enable OS reduced motion, or emulate it in browser developer tools, to verify the static experience.

The local preview retains its existing read-only permission state. Unlocks require an actual successful save, so do not expect a celebration from opening existing records. Use the isolated fixture below to test saves without touching live data. There is no production demo button or fake achievement trigger.

If port 3001 is no longer running, start it from the repository with `npm run dev -- --port 3001`. Keep the existing environment and write permission unchanged.

## Reproduce isolated save/celebration checks

From the repository, in a dedicated PowerShell terminal:

```powershell
node tests/health/mock-server.cjs
```

In a second terminal:

```powershell
node tests/health/prepare-motion-build.cjs
Set-Location tmp/health-verification/motion-build
$env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54125'
$env:SUPABASE_SERVICE_ROLE_KEY='local-test-only'
$env:GOAL_HEALTH_WRITES_ENABLED='true'
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

The copy contains no `.env` files and uses only in-memory fixture data. In a third terminal at the repository root, set `NODE_PATH` to an installed Playwright package location (the bundled runtime on this machine is shown):

```powershell
$env:NODE_PATH='C:\Users\Jouloung\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node tests/health/browser.cjs
node tests/health/motion-browser.cjs
node tests/health/preview-browser.cjs
```

Run the fixture suites sequentially: both reset the same in-memory fixture. They never reset the real database. For manual celebration testing open http://127.0.0.1:3100/health and record a continuous 5 km / 50:00 run, then a continuous 5.5 km / 44:00 run. Test records disappear when the fixture process stops. Close these dedicated terminals after review; their environment variables are process-local.

## Remaining limits

- No restore action exists in the existing backend. This pass keeps confirmed soft-delete feedback and cancellation; it does not invent a restore control or alter persistence.
- Runner resolution is limited to the original 503 × 310 reference. Its softness at desktop size is retained instead of fabricating a higher-resolution source.
- Physical low-end phones and assistive-technology devices were not available; viewport, touch-capable controls, keyboard and reduced-motion behavior were checked in Chrome.
- Existing global favicon 404 and stale Browserslist data remain. Production startup also recommends the optional `sharp` image optimizer. These do not fail the build; package/config changes are outside this motion-only pass.
- The prior database migration remains unapplied to production and the current preview remains read-only. See `docs/health-road-to-5k.md` for the earlier data implementation and rollout prerequisites.
