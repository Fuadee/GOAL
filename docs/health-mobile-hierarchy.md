# Mobile Journey state hierarchy

Implemented on `codex/health-road-to-5k`, refining the existing mobile scene rather than rebuilding it.

## Root cause

The preceding correction removed the oversized lime token but also equalized checkpoint scales and reduced current lighting too far. Current and completed rims had the same brightness, locked platforms retained bright chrome surfaces and route edges, and the gold finish decoration competed with the active checkpoint. This weakened the hierarchy between actual states.

## Visual changes

- **Current:** dark metallic token retained, increased from 44 to 48 px (**9.09%**); actual shared platform/body geometry scales to 1.09. Brighter rim, stronger platform glow, restrained breathing shadow, base halo and soft beam emphasize the actual current level without a solid lime face. Its number is 18 px.
- **Completed:** green metallic core, visible thicker checkmark, medium glow, lime rims and bright completed route segments. Instanced surface tint separates these from locked platforms.
- **Locked:** darker metallic surface tint, dimmer rims/routes, muted token borders and readable numbers/locks. Locked selection still has its separate thin selection outline.
- **Finish:** flag, gold portal/laurel and FINISH marker remain, but locked finish illumination is restrained. Its stronger finish colors return when its real status changes; no state is hardcoded to Level 03.

Positions, route sequence, camera and interaction behavior are unchanged. All treatment derives from actual `passed` / `available` / `locked` status, independently of the selected level. Effects OFF and reduced motion preserve the existing fallback and accessibility behavior.

## Files changed

1. `components/health/three/three.module.css` — scoped mobile state hierarchy, checkmark, token scale, breathing glow and muted finish marker.
2. `components/health/three/mobile-track-scene.ts` — per-state instanced material tint/scale, rim/path colors, current glow/beam, locked finish decoration.
3. `tests/health/mobile-journey-browser.cjs` — restrained 8–10% current size, dark core, border hierarchy, status icons and independent selection checks.
4. `docs/health-mobile-hierarchy.md` — this report.

## Verification

- Lint and typecheck passed.
- Automated tests: **94/94 passed**.
- Production build passed, using the same application source in the existing isolated build directory; no production environment files were copied.
- Mobile browser acceptance: **14/14 passed**, covering 320/360/375/390/430 px, all ten targets, fifty taps, current 03 with selected 04, readable non-overlapping labels, keyboard/details, resize/GPU cleanup, frame cap/offscreen pause, effects OFF, reduced motion and WebGL loss.
- Actual local-app capture: all seven original records retained, write guard enabled, no unexpected JavaScript/WebGL/hydration errors.
- Desktop 1440 and 1024 px deterministic captures remain byte-identical to the original desktop baseline.
- All 21 protected business/data/Hero/dependency files remain hash-identical. No achievement/data/DB/migration/auth changes. No push or deploy.

## Before and after

Actual browser screenshots, not concept images:

- Before: `tmp/health-verification/hierarchy/before/local-mobile-320.png`, `local-mobile-375.png`, `local-mobile-390.png`, `local-mobile-430.png`.
- After: matching files under `tmp/health-verification/hierarchy/after/`.
- Actual-app/desktop evidence: `tmp/health-verification/hierarchy/after/local-preview-results.json`.

Open http://localhost:3000/health and scroll to THE JOURNEY at phone width. Select 04: its details update while 03 retains the strongest active treatment. Physical-device iOS Safari was not tested; mobile verification used Chrome emulation.
