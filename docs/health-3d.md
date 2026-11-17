# GOAL Health — 3D implementation and verification

Implemented in the existing repository on `codex/health-road-to-5k`, 2026-11-10. Open **http://localhost:3001/health**. No new project, separate prototype, push, deployment or production database write was performed.

## Implemented experience

- **Hero runner:** a real WebGL scene containing an articulated procedural runner, metallic surfaces, lime rim lighting, a platform and energy arc. It reveals gently, has subtle idle movement and mouse-only depth response. Mobile places the runner above the title without obscuring the form, metrics or CTA.
- **Ten-level route:** a semi-isometric platform/path with ten actual checkpoints. Passed nodes and connections light up; the current node is emphasized; locked nodes remain legible. The overlaid controls are real DOM buttons, accessible by Tab/Enter or touch. Selecting a node opens and focuses the corresponding existing roadmap details.
- **Unlock medal:** a dimensional medal/trophy above the existing dismissible achievement summary. It is mounted only for a confirmed `achievement` feedback event containing newly passed levels. Several unlocks produce one scene and one summary. PB-only feedback does not produce a level medal.
- **2D utilities:** form, history, PBs, charts, numerical progress, and all existing level details remain DOM UI. The existing effects preference controls both DOM decoration and 3D. Disabling it leaves the complete practical dashboard usable.

The runner and medal are **original procedural placeholders, not production-ready artist models**. They are real geometry, not images or billboards. The hero visibly says `CONCEPT MODEL`. No suitable GLB/glTF assets existed in the repository/reference bundle. The old runner photograph remains the 2D fallback and a subdued background when 3D is active.

## State and safety

`LevelTrackScene` receives `RunnerDashboardData.levels`, uses the existing `progress.status` and `levelRequirement`, and never evaluates new achievement rules. Server refresh after save/edit/soft-delete updates both the mesh materials and DOM checkpoint states.

`UnlockMedalScene` is attached to the existing `AchievementFeedback` flow. That flow waits for a successful action and a matching refreshed record before calculating newly passed levels. Opening/reloading the page, failed saves, unrelated renders, edits and deletes do not create medals. The original close button dismisses the entire celebration and releases the scene.

SHA-256 checks matched all nine pre-change protected files: achievement rules, pace/history/read/write helpers, types, progress derivation, Health actions, migration, Next configuration and `.env.local`. **No database, migration, authentication, write-guard or production-configuration changes were needed.** The actual preview still has seven records and remains read-only under its original permissions. All mutation verification ran against the existing in-memory loopback fixture and original server actions.

## Architecture and files changed in this pass

| File | Responsibility |
| --- | --- |
| `components/health/three/three.types.ts` | Scene, state, quality and renderer lifecycle contracts. |
| `components/health/three/quality.ts` | Pure quality-tier policy. |
| `components/health/three/Health3DProvider.tsx` | Hardware/media hints, WebGL2 capability and existing effect preference. |
| `components/health/three/Health3DScene.tsx` | Lazy import, visibility/resize lifecycle, fallback, context-loss handling. |
| `components/health/three/scene-engine.ts` | Three.js geometry, cameras, materials, lighting, data updates and render lifecycle. |
| `components/health/three/loaders.ts` | Optional GLB/glTF normalization, optional local Draco decoder and disposal. |
| `components/health/three/HeroRunnerScene.tsx` | Hero placement and visible concept label. |
| `components/health/three/LevelTrackScene.tsx` | Data-derived checkpoints, projected DOM controls and roadmap synchronization. |
| `components/health/three/UnlockMedalScene.tsx` | Genuine-unlock-only medal scene. |
| `components/health/three/three.module.css` | Responsive canvas/track/medal layout and accessible controls. |
| `components/health/RunnerQuestDashboard.tsx` | 3D provider integration and effect-toggle description. |
| `components/health/RunningRoadmap.tsx` | Track integration and stable details IDs. |
| `components/health/motion/CinematicHero.tsx` | Hero scene integration. |
| `components/health/motion/AchievementFeedback.tsx` | Medal integration into confirmed feedback. |
| `components/health/running.module.css` | Dim the existing photo when the real 3D runner is ready. |
| `package.json`, `package-lock.json` | Three.js runtime and types. |
| `lib/running/three.test.cjs` | Quality-tier/fallback tests. |
| `tests/health/three-browser.cjs` | Fourteen real-browser 3D acceptance scenarios. |
| `tests/health/three-budget.cjs` | Verify renderer lazy loading and measure its chunks. |
| `tests/health/motion-browser.cjs` | Account for the additional scene visibility observers when checking cleanup. |
| `tests/health/preview-browser.cjs` | Wait for real scene/fade completion before local-preview screenshots. |
| `public/health/models/README.md` | Production asset requirements and replacement instructions. |
| `docs/health-3d.md` | This report. |

Added runtime dependency: **`three@0.187.0`**. Added development dependency: **`@types/three@0.187.0`**. The existing Framer Motion is retained. React Three Fiber/Drei were not added: these three fixed scenes use a small imperative adapter, avoiding an additional React renderer/helper stack while preserving the existing React 18 setup.

## Quality, rendering and fallback

| Tier | Selection | Rendering |
| --- | --- | --- |
| Full | Effects enabled, WebGL2 available, capable hardware, noncompact viewport | Antialiasing, DPR capped at 1.5, decorative drawing capped around 30 FPS, subtle idle/pointer motion. |
| Reduced | Compact/coarse-pointer devices or memory/CPU hints at the medium tier | Lower geometry detail, DPR 1, antialiasing off, static on-demand rendering. Draw only for visibility, resize or state/selection changes. |
| 2D fallback | Effects off, OS reduced motion, missing WebGL2, save-data preference, ≤2 GB memory hint or ≤2 CPU hint | No renderer import/creation; full DOM route, photo, details and dashboard remain usable. |

Visibility observers stop decorative frame scheduling offscreen. The document visibility event pauses it in hidden tabs. Cleanup disconnects observers, removes pointer/visibility/context listeners, cancels rAF, stops any animation mixer, disposes geometry/materials/textures, disposes the renderer and releases the WebGL context. Context loss drops the affected scene back to its DOM representation; it does not block data interaction.

The app creates at most three small contexts (hero, track and temporary medal); the medal is short-lived. No shadows, bloom render passes, WebGL postprocessing, physics, downloaded fonts for 3D labels or continuous React rerender loop are used. Track height is reserved before renderer load to avoid a load-induced jump. The mobile track pans inside its own container; the page does not overflow horizontally.

## Measured performance

- Production build: `/health` **22.6 kB route JS / 169 kB first-load JS**, versus approximately 20.3 / 166 kB before this pass.
- Browser network verification confirmed that effects OFF loads **none** of the renderer chunks. Enabling 3D loads three asynchronous chunks totaling **648,041 raw bytes / 162,721 gzip bytes**. This additional cost is deliberately separate from first-load JS; lazy loading does not make it free.
- Optional GLTF/Draco loader chunks are also separate and are not loaded by the procedural scenes. Decoder/model downloads are not configured by default.
- Full-tier runner: **7,976 triangles / 29 draw calls**. Track: **5,420 triangles / 30 draw calls**. The sample had two live contexts.
- Local headless Chrome sample: page rAF interval median **16.7 ms**, p95 **16.8 ms**. Decorative 3D draws are intentionally capped around 30 FPS; these rAF figures do not mean the renderer draws at 60 FPS.
- The full motion scenario measured CLS **0.02395**, with startup/interaction long tasks between 60–95 ms. This is local diagnostic evidence, not a guarantee for all physical phones/GPUs.

## Verification results

| Check | Result |
| --- | --- |
| Lint | Passed without warnings/errors. |
| Typecheck | Passed. |
| Unit/integration suite | **80/80 passed**, including four new quality-policy tests and all existing achievement/persistence/feedback tests. |
| Production build | Passed; all 24 static pages generated. Built an environment-free copy of the same source to avoid interfering with the user's active dev server. |
| Existing Health browser regression | **13/13 passed**: ten levels, pace boundaries, run/walk, retroactive progress, edit/delete, validation, original rows, mobile, loading/error recovery. |
| Existing motion acceptance | **16/16 passed** against the final 3D-enabled production build. |
| New 3D acceptance | **14/14 passed** against the final production build. |
| Bundle loading check | Passed: no renderer requests with effects off; measured lazy chunks after enabling. |
| Actual localhost:3001 | HTTP 200, ten levels, seven records, original read-only guard intact. |

The 3D scenarios cover mesh rendering, correct checkpoint states, keyboard/tap synchronization, offscreen pause, simulated document visibility events, save failure, combined unlock, edit/delete, persistent effects preference, 1024/390/320 layouts, static mobile rendering, reduced motion, forced WebGL context loss, navigation/context release, unsupported WebGL, geometry budget and console errors. Desktop 1440 is also covered. No unexpected JavaScript or hydration errors occurred. The actual app's existing `/favicon.ico` 404 remains separately recorded.

## Screenshots and evidence

Artifacts are in the ignored `tmp/health-verification/three/` directory:

- `local-desktop.png`, `local-mobile.png`: actual localhost:3001 with existing records.
- `desktop-hero.png`, `desktop-track.png`: production fixture runner and route.
- `laptop-1024.png`, `mobile-390.png`, `mobile-320.png`: responsive scenes.
- `medal-unlock.png`: a genuine successful fixture save unlocking six levels.
- `reduced-motion.png`: 2D fallback.
- `results.json`: fourteen 3D checks, geometry and runtime sample.
- `bundle-results.json`: exact lazy chunk sizes and fallback loading assertion.
- `local-preview-results.json`: actual preview findings.

Existing regression results remain at `tmp/health-verification/browser-results.json`; motion results are at `tmp/health-verification/motion/motion-results.json`.

## Try locally

At http://localhost:3001/health, reload to view the runner, select a route node with a pointer or Tab/Enter, and use the top-right effects toggle. Narrow the viewport for reduced rendering; enable OS reduced motion to see the 2D fallback. The existing server is retained. If it has stopped, run `npm run dev -- --port 3001` from the repository without changing its environment/write permissions.

To test actual saves and medals safely, follow the isolated fixture build instructions in `docs/health-motion-design.md`. The same `tests/health/prepare-motion-build.cjs` copies this current source and dependencies without production environment files. Use the loopback fixture on 54125 and app on 3100. From the repository, run the browser suites **sequentially**, because their fixtures share in-memory state:

```powershell
$env:NODE_PATH='C:\Users\Jouloung\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node tests/health/browser.cjs
node tests/health/motion-browser.cjs
node tests/health/three-browser.cjs
node tests/health/three-budget.cjs
node tests/health/preview-browser.cjs
```

The production-connected preview intentionally cannot simulate a fake unlock. A medal requires an actual successful save in an appropriately authorized instance. No write flag or schema check is bypassed by the scene components.

## Remaining limits and asset handoff

1. Runner, medal and track geometry are concept placeholders. Final art quality depends on licensed production models. Recommended `runner.glb` and `medal.glb`, texture/polygon budgets, coordinate conventions and optional checkpoint/track art are specified in `public/health/models/README.md`.
2. GLB/glTF loader architecture and optional local Draco configuration are implemented, but no production asset or Draco payload was supplied to validate final appearance, skinning or animation clips. Checkpoint/track meshes are procedural; replacing those with art requires adapting the track factory. KTX2/Meshopt are not configured.
3. Physical low-end mobile devices, Safari and assistive-technology hardware were not available. Chrome viewport, keyboard, touch-friendly controls and fallback paths were exercised. Hardware hints are imperfect; users can always switch effects off.
4. The existing favicon 404, stale Browserslist advisory and optional `sharp` recommendation remain outside this scoped feature. No unrelated dependency upgrades or production configuration changes were made.
5. The prior migration remains unapplied to production and the real preview stays read-only. Existing history was never replaced with fixture data.

Implementation API references: [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer) and [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html).
