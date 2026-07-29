# 🦞 Lobster Dog — Interactive 3D Viewer

Procedural Three.js reconstruction of a pixel-art West Highland White Terrier wearing a red lobster costume, generated with a staged, quality-gated img2threejs workflow.

## Live Demo

[GitHub Pages URL will be inserted after deployment]

## Reference and Scope

- **Reference image**: Pixel-art Westie in lobster costume (front-facing, orthographic)
- **Intended use**: Real-time browser showcase
- **Reconstruction type**: Procedural Three.js geometry and materials
- **Known hidden/inferred regions**: Back of costume (not visible), tail tip details (partially occluded), underside of limbs

## Implemented Features

- ✅ Front-facing reference-matched initial camera
- ✅ Orbit, zoom, reset camera, and auto-rotate controls
- ✅ Side-by-side comparison with reference image
- ✅ Reference image overlay toggle
- ✅ Named-part click picking with details panel
- ✅ Exploded view (adjustable with slider)
- ✅ Background presets (dark, light, grid)
- ✅ Responsive layout (desktop + mobile)
- ✅ Loading state and WebGL error handling

## Feature Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| Antennae & hood eyes | ✅ | Two curved antennae, stalk eyes with white sclera + black pupils |
| Dog face (fur, eyes, nose, tongue) | ✅ | White fluffy fur, black dot eyes, triangular nose, pink tongue |
| Segmented lobster torso | ✅ | 5 horizontal armor segments, center seam, 6 white spots |
| Pincer claws | ✅ | Upper/lower pincer per claw with specular highlights |
| Tail (partially occluded) | ✅ | Segmented tail extending below torso (inferred) |
| Lobster-style feet | ✅ | Red pointed feet |
| Back details | ❌ | Not visible in single reference image |

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Build Validation

- TypeScript compilation: ✅ Clean
- Vite build: ✅ 506.80 KB (Three.js bundled)
- Local preview: ✅ Serves correctly

## Pipeline

Generated via the staged img2threejs pipeline:
1. Image analysis & pre-spec assessment
2. Detail inventory (13 features identified)
3. Sculpt spec generation (3 materials, 11 macro/meso components)
4. Blockout pass (current stage)
5. [Pending] Structural, form, material, surface, lighting, interaction, optimization passes

## Attribution

Workflow based on the Apache-2.0 licensed [img2threejs](https://github.com/img2threejs/img2threejs) project.
Reference image provided by user.
