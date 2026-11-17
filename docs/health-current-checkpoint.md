# Mobile current checkpoint refinement

Changed only the mobile current-checkpoint treatment on `codex/health-road-to-5k`.

## Root cause

The visible number token is a semantic DOM button projected onto shared Three.js geometry. Its mobile `available` rule used a solid-looking lime gradient, a 48px token and 23px number, whereas other tokens were 44px with 17px numbers. Both the platform group and instanced body geometry were additionally scaled to 1.09. An elevated halo and strong glow sprite compounded the oversized appearance.

## Correction

- Current token is now 44px with a 17px number: 100% of the other token sizes, retaining the full touch target.
- Dark metallic gradient, inset reflected highlight, shaded lower edge, pale readable number and illuminated lime border match the existing material family.
- Shared platform and body geometry now use scale 1. Positions, camera and path are unchanged.
- Current emphasis comes from platform lighting, a softly breathing glow, one halo placed around the base and a low-opacity vertical light sprite. The selection ring is suppressed on the actual current token to avoid redundant overlapping rings.
- All current lighting remains driven by `status === 'available'`, independently of selection. Selecting 04 retains the treatment on current 03.
- Effects OFF and reduced motion retain the existing semantic fallback and motion policy.

## Files changed

- `components/health/three/three.module.css`: scoped mobile token surface, size and restrained breathing shadow.
- `components/health/three/mobile-track-scene.ts`: equal geometry scale, base halo, lower glow, subtle beam and ring visibility.
- `tests/health/mobile-journey-browser.cjs`: regression for equal size, dark core, readable number and independent current/selection.
- `docs/health-current-checkpoint.md`: this report.

## Verification

- Lint, typecheck and production build passed.
- Automated tests: **94/94 passed**.
- Mobile browser checks: **14/14 passed**, covering 320/360/375/390/430px, all ten visible non-overlapping targets, fifty taps, keyboard/details behavior, current/selection, fixed camera, offscreen pause, GPU cleanup, effects OFF, reduced motion and WebGL loss. No unexpected JavaScript/WebGL/hydration errors.
- Read-only actual-app capture: seven original records, writes disabled, current 03 and selected 04 at all five widths.
- Desktop 1440/1024px deterministic screenshots remain byte-identical to the earlier baseline.
- All 21 protected business/data/Hero/dependency files remain hash-identical. No database/migration, production-data, push or deployment operation occurred.

## Actual before/after screenshots

Directory: `tmp/health-verification/current-token/`.

- Before: `local-mobile-320.png`, `local-mobile-375.png`, `local-mobile-390.png`, `local-mobile-430.png`.
- After: matching files under `after/`.
- Actual-app status and desktop comparison: `after/local-preview-results.json`.

Open http://localhost:3000/health in a phone-width viewport and scroll to THE JOURNEY. Browser verification used Chrome mobile emulation; physical iOS Safari was not tested.
