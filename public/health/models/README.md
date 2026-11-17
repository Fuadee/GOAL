# Health 3D assets — current shoe handoff

The humanoid has been removed. The Hero now loads `goal-shoe.glb`, an optimized derivative of **Materials Variants Shoe**, © 2021 Shopify, under **CC BY 4.0**. Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe. See [SHOE-LICENSE.txt](SHOE-LICENSE.txt) for attribution and changes; the Hero links to it visibly.

The original 7,833,592-byte GLB is reduced to 1,537,180 bytes by keeping Midnight only and resizing its three embedded JPEG maps to 1024px. Original 22,700-triangle geometry and UVs are retained. `tests/health/prepare-shoe-asset.cjs` reproduces it using Sharp from the local tooling runtime, without adding app dependencies. Original SHA-256: `e1d7cb190382111e5a5b37b51e9a7f007f7eb2ab1b6185e0188e8d0a0d1265a7`.

`shoe-scene.ts` applies charcoal technical-fabric shading and lime sole/pull-tab accents using the original base-color, normal and ORM maps. `../shoe-poster.png` is a transparent static capture of the actual adapted GLB and platform, used only as fallback/loading art. `tests/health/shoe-capture.cjs` regenerates it with `GOAL_CAPTURE_POSTER=true`. No external model, texture or decoder requests are required at runtime.

## Optional medal replacement

The medal and checkpoints remain the original procedural meshes. `HEALTH_MODELS.medal` in `components/health/three/loaders.ts` remains an optional GLB slot, defaulting to `null`. A failed optional medal load retains the procedural medal. The obsolete `HEALTH_MODELS.runner` slot no longer exists.

The loader supports GLB and glTF, normalizes height/center and plays the first animation clip on the full tier. A replacement medal should have front +Z, up +Y and a presentable static pose. GLB is preferred because textures/buffers stay in one file.

| Asset | Recommended budget | Art requirements |
| --- | --- | --- |
| Current `goal-shoe.glb` | 22,700 triangles, one material, 1.54 MB | Real licensed shoe, original laces/sole/fabric detail, adapted charcoal/lime shading. |
| `medal.glb` | 2–5k triangles, 1–2 materials, ≤300 kB | Front-facing sculpted medal/trophy, centered origin, readable silhouette. |
| Optional `checkpoint.glb` | ≤500 triangles per checkpoint, shared material/geometry | Modular base with separable emissive ring; ten instances. This is an art recommendation, not a wired URL slot. |
| Optional track modules | ≤5k triangles total | Clean modular path aligned to the existing ten data checkpoints; no hardcoded achievement text. Requires adapting the procedural track factory. |

Use metallic/roughness PBR materials, packed ORM maps, 1K textures where possible (2K maximum for the runner), modest emissive accents, and avoid transmission, transparent layers, large bone counts and multiple skinned meshes. Keep the animation short and loopable. Provide source files and explicit usage rights with final art.

Draco is optional: serve the decoder JS/WASM locally, set `HEALTH_MODELS.dracoPath` to that directory, and export Draco-compressed geometry. No public CDN dependency is configured. Decoder resources are disposed after loading. KTX2/Meshopt loaders are not installed/configured; assets requiring them need a deliberate integration and testing pass. Plain GLB is the safest first handoff.

The shipped shoe GLB, texture appearance, continuous rotation and pointer/touch controls are browser-verified. Optional future medal/track replacements and Draco payloads still need separate validation.
