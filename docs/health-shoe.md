# Health Hero — interactive running shoe

Implemented in the existing `codex/health-road-to-5k` branch. The humanoid factory, `HeroRunnerScene` component and runner-photo background were removed from the Hero. The supplied neon shoe screenshot guided the charcoal/lime materials, floating shoe, circular platform, energy arcs and lighting. Hero text, finish-line card, GOAL branding and the practical dashboard remain intact.

## Model source and license

The Hero uses an **actual GLB**, not a PNG or primitive substitute: **Materials Variants Shoe**, © 2021 **Shopify**, distributed by the [Khronos glTF Sample Assets project](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). No suitable local shoe model existed before this task.

The Midnight variant is retained, with original laces/sole/fabric geometry, UVs, normal map and packed ORM map. Runtime shading creates a charcoal technical upper, metallic panels and lime sole/pull-tab accents. This is an adaptation of the licensed shoe, not an exact reconstruction of the reference screenshot's shoe silhouette. A visible Hero credit links to `public/health/models/SHOE-LICENSE.txt`; attribution/change metadata is also embedded in the GLB.

Original download: **7,833,592 bytes**. Optimized GLB: **1,537,180 bytes** (about 80% smaller). Geometry: **22,700 triangles / 13,540 vertices**, one material and three embedded 1024px JPEG textures. Unused variants/textures were removed. No decoder or external texture service is needed. The original source remains untouched in ignored temporary storage; the reproducible packing script is `tests/health/prepare-shoe-asset.cjs`.

`public/health/shoe-poster.png` (**109,854 bytes**) is a transparent render of this exact adapted GLB/platform. It appears during loading, with effects OFF, under reduced motion/weak hardware, or after model/WebGL failure. The live scene uses the GLB. The poster is not presented as interactive 3D.

## Interaction and rendering

- Automatic vertical-axis rotation uses elapsed active time at `2π / 10` radians per second.
- Mouse and touch use pointer capture. Dragging one viewport width rotates 360°. Automatic rotation stops while a pointer is held; release preserves bounded inertia and smoothly blends back to automatic motion.
- Vertical touch scrolling remains available through `touch-action: pan-y`. Pointer cancellation/lost capture ends the interaction safely.
- Keyboard-accessible left/right controls rotate by 45°. No focus trap or camera zoom/pan obscures the model.
- The shoe floats subtly; the platform stays centered while energy arcs move around it. Original material textures and studio environment reflections provide depth.
- Full tier draws at approximately 30 FPS with DPR capped at 1.5. Reduced/mobile shoe rendering is capped around 24 FPS at DPR 1. Track/medal reduced-tier rendering remains on demand as before.
- Reduced motion, weak hardware or effects OFF removes WebGL and displays the poster. The GLB is not requested when effects are already OFF.
- Offscreen/hidden-tab pause and renderer cleanup remain active. GLB ImageBitmaps, textures, geometry, environment render target, pointer listeners and frame callbacks are released on teardown.

## Files changed in this pass

| Files | Change |
| --- | --- |
| `components/health/motion/CinematicHero.tsx` | Replace runner scene/photo with shoe; remove obsolete photo parallax handlers. |
| `components/health/three/HeroRunnerScene.tsx` | Removed. |
| `components/health/three/HeroShoeScene.tsx` | New shoe wrapper, static fallback, keyboard controls and attribution. |
| `components/health/three/shoe-scene.ts` | Real GLB, adapted PBR shading, environment, platform and energy arcs. |
| `components/health/three/shoe-rotation.ts` | Pure rotation, drag/inertia and smooth-resume state. |
| `components/health/three/Health3DScene.tsx` | Wait for model readiness; pointer/touch capture and cleanup. |
| `components/health/three/scene-engine.ts` | Remove humanoid geometry; integrate shoe lifecycle/rotation while retaining track/medal behavior. |
| `components/health/three/three.types.ts` | Shoe scene, readiness and interaction contracts. |
| `components/health/three/loaders.ts` | Remove obsolete runner slot; explicitly close GLB ImageBitmaps during disposal. |
| `components/health/three/three.module.css`, `components/health/running.module.css` | Shoe placement, mobile spacing, controls and removal of old runner styles. |
| `public/health/models/goal-shoe.glb` | Optimized licensed shoe asset. |
| `public/health/models/SHOE-LICENSE.txt`, `public/health/models/README.md` | Source, attribution, changes and asset handoff. |
| `public/health/shoe-poster.png` | Actual-render static fallback. |
| `lib/running/shoe.test.cjs` | Six rotation/asset tests. |
| `tests/health/prepare-shoe-asset.cjs`, `shoe-capture.cjs`, `shoe-browser.cjs` | Asset preparation, poster generation and eleven browser acceptance checks. |
| `tests/health/three-browser.cjs`, `motion-browser.cjs`, `preview-browser.cjs`, `three-budget.cjs` | Update assertions from removed humanoid to real shoe and new mobile behavior. |
| `docs/health-shoe.md` | This report. |

**No runtime or development dependencies were added.** The packing script uses Sharp already available in the local tooling runtime. `package.json` and its lockfile are unchanged.

## Verification

| Check | Result |
| --- | --- |
| Lint | Passed, no warnings/errors. |
| Typecheck | Passed. |
| Unit/integration tests | **86/86 passed**. |
| Production build | Passed; 24 static pages generated. Same app source built in an environment-free verification copy to avoid interfering with the existing dev server. |
| Shoe browser acceptance | **11/11 passed** against the production build. |
| Existing Health regression | **13/13 passed**. |
| General 3D acceptance | **14/14 passed**, including real save/edit/delete, valid medal trigger, context loss and resource cleanup. |
| Motion acceptance | **16/16 passed**. |
| Desktop/mobile | 1440, 1024, 390 and 320 px inspected; no horizontal page overflow. Real browser mouse events and Chrome touch dispatch verified dragging. |
| Actual local app | HTTP 200, ten levels, all seven existing records and the original read-only guard retained. |

Final automatic-rotation sample: **359.88° over 10.008 seconds**. A held mouse/touch pointer stopped automatic rotation; full-width mouse dragging completed a full turn; release resumed smoothly. Keyboard controls, static preference persistence, unsupported WebGL, model decode failure and loaded fallback art were checked.

Final shoe scene: **32,636 triangles / 23 draw calls** including its platform and arcs. Local headless Chrome page frame sample: median **16.7 ms**, p95 **16.8 ms**. This is a page-rAF sample, not a claim that the deliberately capped 3D renderer draws at 60 FPS. The broader motion scenario measured CLS **0.0336**, with some startup/interaction long tasks up to 172 ms. The static poster remains visible during model loading/compilation.

Build reports `/health` **22.9 kB route JS / 169 kB first-load JS**. Three.js/GLTF loader code and the **1.54 MB GLB** are loaded separately when needed; the model's network cost is additional to the first-load JS figure. No JavaScript, WebGL shader or hydration errors were observed in the acceptance suites. The actual app's pre-existing `/favicon.ico` 404 remains.

## Data safety

SHA-256 checks matched all fourteen protected files captured before this pass, including achievement/pace/history/progress code, Health server actions, migration, config, `.env.local`, package files, LevelTrackScene, UnlockMedalScene and AchievementFeedback. No DB/auth/write-guard changes, production writes, history reset, push or deployment occurred. Mutation tests used the existing loopback in-memory fixture only.

## Open and review

The user's existing server is currently on **http://localhost:3000/health**; it was retained. Port 3001 was not running during this pass. Reload the page, drag the shoe horizontally, hold it to pause, release it to resume, use the arrow controls, and toggle effects OFF/ON. OS reduced motion shows the same shoe as a static poster.

Screenshots in ignored `tmp/health-verification/shoe/`:

- `local-desktop.png`, `local-mobile.png`: actual local app with existing records.
- `desktop-final.png`, `shoe-1024.png`, `shoe-390.png`, `shoe-320.png`: production acceptance layouts.
- `mouse-360.png`, `touch-drag.png`: pointer interaction.
- `effects-off.png`: static fallback.
- `results.json`: eleven checks and measured rotation/frame results.
- `local-preview-results.json`: live preview findings.

Use the isolated fixture setup from `docs/health-motion-design.md` to reproduce mutation tests. Run browser suites sequentially because the fixture is shared. With the bundled Playwright module path in `NODE_PATH`, run `node tests/health/shoe-browser.cjs`, then the existing `browser.cjs`, `three-browser.cjs` and `motion-browser.cjs` scripts. `preview-browser.cjs` is read-only and targets the actual server on port 3000.

Remaining limits: the shoe silhouette is the licensed Shopify asset rather than the exact concept artwork; physical-device Safari/low-end GPU testing was not available. Mobile layout/touch were exercised in Chrome emulation. Existing favicon/Browserslist/optional Sharp advisories remain outside this change. No shoe model is missing and no humanoid/primitive shoe placeholder is shipped in the Hero.
