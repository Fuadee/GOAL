# Health Journey — rising 3D staircase

The desktop implementation below is retained. The mobile staircase was subsequently replaced by the S-shaped track described in [health-mobile-journey.md](health-mobile-journey.md); use that report for current phone behavior and verification.

Implemented on `codex/health-road-to-5k` in the existing GOAL repository. This pass changes only the Journey presentation and its shared scene integration. The supplied staircase artwork guides the direction, metallic surfaces, lime accents, checkpoint badges and finish flag. No generated image is used as the interactive scene.

## Behavior and implementation

- Ten genuinely three-dimensional stations rise from bottom-left to top-right in numeric order. Extruded rounded profiles provide beveled platform edges; instanced supports provide height and depth. Nine visible geometric links connect adjacent stations.
- PBR metal surfaces use a locally generated studio environment for reflections. Soft contact shadows and glow use small procedural textures; a geometric wave grid, floating particles and a gently moving 5K flag provide atmosphere. No additional assets, rendering libraries or dependencies were introduced.
- Passed stations illuminate their rims and outgoing links, with moving energy on desktop. The actual current station is slightly raised and receives the brightest badge, floating ring and pulse. Locked stations stay muted. Station 10 is the highest and carries the finish flag.
- Status always comes from `data.levels[].progress.status`. **Current and selected levels are independent**: selecting 04 updates its detail preview and selector; current 03 keeps its beacon. Empty and fully completed histories are supported without inventing a current level.
- Checkpoints are real keyboard-accessible DOM buttons projected onto the geometry. Clicking/tapping selects without unexpectedly scrolling away. The explicit “ดูรายละเอียด” button opens the existing requirement disclosure and transfers focus to its summary. Arrow keys, Home/End, Enter and normal Tab navigation work. Hover highlights the badge and subtly changes the 3D cap without selecting it.
- The original heading, completion count, existing requirement disclosures and real run evidence remain. The top strip is now an accessible selector; on narrow phones it uses two rows of five sufficiently sized buttons.
- Desktop adds a short canvas reveal, bounded camera movement, pointer-responsive key lighting and smooth selected-cap motion. The scene is lazy-loaded and uses the existing visibility/lifecycle controller.

## Mobile, fallback and performance

The scene has no horizontal scroll container or minimum width. Narrow cards use a dedicated fixed orthographic camera and narrower supports, while keeping all ten badges and the flag inside the frame. Chrome verification covered **1440, 1024, 430, 390 and 320 px**; every checkpoint was within bounds, numerically ordered and hit-testable.

Desktop rendering is capped around 30 FPS; the final one-second sample rendered **30 frames**. Mobile retains the existing reduced quality policy: fixed camera, lower grid detail, pixel ratio capped at 1 and **on-demand WebGL rendering**. A small CSS current badge pulse can remain when effects are enabled. Offscreen scenes stop rendering; navigation and context loss dispose renderers/resources. Pointer movement does not create React updates per animation frame.

Final default-data scene budgets:

| Tier | Triangles | Draw calls | Ambient rendering |
| --- | ---: | ---: | --- |
| Desktop | 21,652 | 81 | Approximately 30 FPS while visible |
| Mobile | 17,300 | 81 | On demand |

Effects OFF, OS reduced motion, unsupported WebGL and context loss preserve an ordered semantic 2D route with all ten usable controls and the same selected-level details. These paths do not require the 3D canvas.

These are lightweight approximations rather than expensive postprocessing: glow is procedural additive geometry/sprites, contact shadows are soft procedural decals, and reflections are environment-based. There is no screen-space reflection or dynamic shadow-map pass. Physical-device Safari and low-end GPU performance remain unverified. Local page-rAF samples ranged from approximately 16.7 to 33.3 ms across the wider regression suite; the full-page motion run recorded CLS **0.00217** and startup/interaction long tasks up to **299 ms**, so these measurements are not a universal device performance guarantee.

## Files changed in this pass

| File | Purpose |
| --- | --- |
| `components/health/RunningRoadmap.tsx` | Shared selected state and accessible top selector. |
| `components/health/three/LevelTrackScene.tsx` | Semantic checkpoints, hover/keyboard interaction, selection/detail separation and fallback. |
| `components/health/three/track-scene.ts` | New staircase geometry, materials, lights, atmosphere, animation and responsive camera. |
| `components/health/three/track-layout.ts` | Pure ordered desktop/mobile positions and semantic fallback anchors. |
| `components/health/three/scene-engine.ts` | Replace the old flat two-row track factory with the staircase; retain shoe and medal integration. |
| `components/health/three/Health3DScene.tsx` | Track pointer-light input and listener cleanup. |
| `components/health/three/three.types.ts` | Hover and pointer contracts. |
| `components/health/three/three.module.css` | Journey layout, badges, selector, responsive sizing, accessible motion/fallback styles. |
| `lib/running/journey.test.cjs` | Three unit tests for ordering, elevation and fallback framing. |
| `tests/health/journey-browser.cjs` | Seventeen production-browser acceptance checks. |
| `tests/health/journey-capture.cjs` | Read-only screenshots of the actual local app. |
| `tests/health/three-browser.cjs` | Update the keyboard regression to test selection first, then explicit detail/focus navigation. |
| `docs/health-journey.md` | This report. |

## Verification results

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, no warnings/errors. |
| `npm run typecheck` | Passed. |
| `npm test` | **89/89 passed.** |
| `npm run build` | Passed: 24 static pages generated; `/health` approximately 23.4 kB route JS / 170 kB first-load JS. Lazy Three.js code is additional. |
| Journey acceptance | **17/17 passed.** |
| General 3D regression | **14/14 passed.** |
| Motion regression | **16/16 passed.** |
| Health behavior regression | **13/13 passed.** |
| Shoe regression | **11/11 passed.** |

**71 browser checks passed** against the latest production build. They include real mouse/keyboard/touch interaction, all five viewport sizes, current/selected separation, empty/completed histories, genuine save/edit/soft-delete using the isolated fixture, effects/reduced motion, offscreen rendering, context loss, unsupported WebGL, navigation disposal and absence of unexpected JavaScript/WebGL/hydration errors.

The production build used the existing verification copy at `tmp/health-verification/motion-build`, with no production `.env` files and only the loopback in-memory REST fixture. This isolates `.next` from the user's running development server; it is the same application source, not a separate prototype. Browser suites ran sequentially because they share the fixture.

Twenty protected files were hashed before and after this pass; **20/20 were unchanged**. They include the Hero and shoe implementation, medal component, form/history/analytics/dashboard, achievement and pace logic, server actions, database access, migration, dependency manifests and local environment. No migration or production write was performed. No push or deployment was performed. Existing unrelated working-tree changes were preserved.

## Preview and screenshots

Open **http://localhost:3000/health**, then scroll to **THE JOURNEY**. Choose 04 using either selector: its requirements appear while 03 remains the actual current level for the existing two-completed-level history. Try “ดูรายละเอียด”, the arrow keys, Effects OFF and a narrow browser viewport.

Screenshots and machine-readable results are in `tmp/health-verification/journey/`:

- `local-1440.png`, `local-1024.png`, `local-390.png`, `local-320.png`: actual app, existing data, read-only capture.
- `journey-1440.png`, `journey-1024.png`, `journey-430.png`, `journey-390.png`, `journey-320.png`: isolated production acceptance, current 03 / selected 04.
- `effects-off.png`, `reduced-motion.png`, `all-completed.png`: alternative states.
- `results.json`, `local-preview-results.json`: acceptance and local inspection results.

Reproduction uses the same fixture/build setup documented in `docs/health-motion-design.md`. With the bundled Playwright package on `NODE_PATH`, run `node tests/health/journey-browser.cjs`; the read-only actual-app capture is `node tests/health/journey-capture.cjs`. The pre-existing local `/favicon.ico` 404 and outdated Browserslist advisory remain outside this change.
