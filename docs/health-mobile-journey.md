# Mobile Journey — connected S-shaped 3D track

This pass replaces only the mobile Journey presentation on the existing `codex/health-road-to-5k` branch. It follows the latest “Neon 3D Running Goal Journey” reference. The desktop staircase, GOAL header, selector, Hero, other dashboard components and data behavior are preserved.

## Layout and interaction

The phone scene uses a continuous, four-row serpentine track with **nine consecutive connections**, all constructed from actual cubic Bézier geometry:

| Row, bottom to top | Visual positions from left to right | Traversal |
| --- | --- | --- |
| Bottom | 01, 02 | 01 → 02 |
| Second | 04, 03 | 03 → 04, right to left |
| Third | 05, 06, 07 | 05 → 06 → 07 |
| Top | 10, 09, 08 | 08 → 09 → 10, right to left |

**FINISH 5K is at the upper left.** This deliberate adjustment to the reference keeps the full route in exact numeric order without crossing, repeating or omitting a checkpoint. Directional chevrons follow the actual curve tangents. Unit tests sample every curve to check bounds and absence of intersections.

The track has dark metallic depth, circular layered checkpoint platforms, lime rails, moving energy on completed paths, environment reflections, soft procedural contact shadows, wireframe terrain and a gold finish portal/laurel/5K flag. All geometry and small procedural textures are authored in the repository; no screenshot or generated image replaces the interactive scene.

Passed/current/locked styling derives exclusively from the existing dashboard data. The current platform is larger, with a floating halo and breathing glow. Selecting 04 changes the detail panel and selection ring while actual current 03 keeps its beacon. The scene supports empty and fully completed histories through the existing evaluation engine.

Phone framing uses a **fixed orthographic angle**, with row spacing calculated from card dimensions. No orbit, zoom, map drag or horizontal scrolling is needed. The scene is 420 CSS px high, 70 px shorter than the preceding phone staircase. Accessible projected DOM buttons have **44 × 44 px** minimum targets, a **48 × 48 px** current target and numbers at least **17 px**. The selector and existing detail navigation retain their behavior. Keyboard arrows/Home/End/Enter remain supported.

## Desktop preservation

`responsive-track.ts` delegates desktop rendering to the existing `track-scene.ts` factory. Its only change is explicit cleanup when a responsive switch removes that scene, including instanced buffers. Desktop geometry, materials, camera, animation and CSS remain intact.

Deterministic on-demand screenshots at **1440 and 1024 px were byte-for-byte identical before and after**. Evidence: `tmp/health-verification/mobile-journey/desktop-before-*.png`, `desktop-after-*.png`, `desktop-comparison.json` and `local-preview-results.json`.

## Performance and fallback

- Repeated platform parts, arrows, shadows and laurel leaves use instancing. The initial 138 draw-call implementation was reduced to roughly **58–60 calls** and **25.5–26.4k triangles**, depending on selected-ring transitions.
- Visible mobile animation is capped at **20 FPS**; the final local acceptance sample recorded **17 frames in one second**. Desktop keeps its prior policy. Hidden/offscreen scenes stop rendering, and Effects OFF / reduced motion remove WebGL entirely.
- A connected semantic SVG/DOM S route remains usable after WebGL failure, with effects disabled or under reduced motion. It preserves all ten buttons, current/selected states, keyboard navigation and details.
- No additional dependency, HDR download or model download is needed for this scene. Mobile uses lightweight MSAA for cleaner edges; no bloom, SSR or dynamic shadow-map postprocessing is added. Reflections and shadows are environment/procedural approximations.
- Repeated phone resizing retained the same renderer and returned to **182 live tracked WebGL buffers**, equal to the baseline. Instanced attribute buffers, geometries, materials, textures and environment resources are explicitly released on replacement/disposal.
- Wider page regression sampled 16.7 ms median / 16.8 ms p95 page-rAF intervals, CLS **0.00470**, and some startup/interaction long tasks up to **293 ms**. Page-rAF timing is not the capped scene's drawing rate and is not a physical-device performance guarantee.

## Files changed in this pass

| File | Purpose |
| --- | --- |
| `components/health/three/mobile-track-layout.ts` | Exact four-row traversal, cubic controls and matching fallback path. |
| `components/health/three/mobile-track-scene.ts` | Mobile-only track geometry, platforms, materials, effects, framing, instancing and disposal. |
| `components/health/three/responsive-track.ts` | Route to preserved desktop or new phone factory. |
| `components/health/three/scene-engine.ts` | Mobile capped rendering, MSAA, responsive policy restart and scene metadata. |
| `components/health/three/track-scene.ts` | Desktop scene cleanup when switching factories; visual code unchanged. |
| `components/health/three/LevelTrackScene.tsx` | Matching mobile fallback anchors/path and accessible FINISH label. |
| `components/health/three/three.module.css` | Scoped phone card, target sizes, number sizes and finish label. |
| `lib/running/mobile-journey.test.cjs` | Five mathematical route/order/framing/intersection tests. |
| `tests/health/mobile-journey-browser.cjs` | Thirteen targeted mobile acceptance checks. |
| `tests/health/mobile-journey-capture.cjs` | Read-only real-app phone screenshots and desktop comparison. |
| `tests/health/journey-browser.cjs` | Preserve desktop assertions; accept the new mobile traversal and capped animation. |
| `docs/health-mobile-journey.md`, `docs/health-journey.md` | Current report and supersession note. |

## Verification

| Check | Result |
| --- | --- |
| Lint | Passed, no warnings/errors. |
| Typecheck | Passed. |
| Automated unit/integration tests | **94/94 passed.** |
| Production build | Passed; 24 static pages generated. |
| Targeted mobile browser checks | **13/13 passed.** |
| General Journey checks | **17/17 passed.** |
| 3D regression | **14/14 passed.** |
| Motion regression | **16/16 passed.** |
| Health behavior regression | **13/13 passed.** |
| Shoe regression | **11/11 passed.** |

The **84 browser checks** cover 320, 360, 375, 390 and 430 px, fifty actual touch selections, label hit testing/non-overlap, finish bounds, selected/current separation, fixed framing, GPU-buffer cleanup, animation limits, keyboard focus, effects/reduced motion, WebGL loss and the existing Health/shoe behavior. No unexpected JavaScript, hydration or WebGL errors were observed.

Build and mutation tests used the same app source in `tmp/health-verification/motion-build` and the loopback, in-memory fixture. No production environment files were copied. **21 protected files remained hash-identical**, including the Hero, roadmap wrapper/selector, other dashboard components, running rules/pace/PB/persistence, server actions, migration, dependency manifests and local environment. No production data, database schema or authentication/write permissions changed. No push or deploy occurred.

## Preview, screenshots and limitations

Open **http://localhost:3000/health** and use a 320–430 px browser viewport. Scroll to THE JOURNEY; tap 04 to inspect its conditions while 03 remains current for the existing history. Try Effects OFF, keyboard navigation and the detail button.

Actual screenshots are in `tmp/health-verification/mobile-journey/`:

- `local-mobile-320.png`, `local-mobile-360.png`, `local-mobile-375.png`, `local-mobile-390.png`, `local-mobile-430.png`: the existing local app, captured without submitting records.
- `mobile-320.png` through `mobile-430.png`: actual production-build browser renders using isolated fixture data.
- `effects-off.png`, `reduced-motion.png`: semantic fallback.
- `desktop-before-*.png`, `desktop-after-*.png`: unchanged desktop evidence.
- `results.json`, `local-preview-results.json`: checks and measurements.

Use the fixture setup in `docs/health-motion-design.md` to reproduce browser checks with `node tests/health/mobile-journey-browser.cjs`. For read-only local screenshots, run `node tests/health/mobile-journey-capture.cjs` with the bundled Playwright package on `NODE_PATH`.

Remaining limits: phone layout and touch were tested in Chrome emulation, not physical iOS Safari/low-end devices. The fixed mobile camera intentionally does not rotate or pan. The pre-existing local favicon 404 and Browserslist age advisory remain outside this mobile-only change.
