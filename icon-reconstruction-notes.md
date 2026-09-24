# VASA icon reconstruction

The reference is a 600 × 144 RGBA logo. The icon sits at about x = 32–142,
y = 8–136; the wordmark is excluded from this model. The reference is a flat
graphic, so the frontal outline is evidence and the side profile is an
interpretation.

## Shape and finish

- The calligraphic silhouette is one continuous `THREE.Shape`, with three
  narrow transparent cutouts across the upper ring and interior curl. The
  tapered lower flourish is part of the same piece.
- The outline and channels are stored as editable point arrays in
  `src/vasaIconOutline.ts`; the model never loads the reference PNG.
- A 0.14 world-unit extrusion gives the face a readable side view. Its bevel is
  0.0045 units so the fine tip and the narrow channels remain intact.
- The source's fully opaque icon pixels have a median RGB of (166, 125, 68).
  The front material starts from that color. Metal response and side color
  are inferred for the 3D study.

## Checks and limits

- The img2threejs image probe classified this source as conditional because
  its 144-pixel height cannot settle fine geometry or materials.
- The built `ExtrudeGeometry` has 2,584 triangles, no invalid vertex positions,
  and a measured bounding box of roughly 2.26 × 2.63 × 0.149 units, including
  the bevel.
- At the source resolution, a front-face triangle projection overlaps about
  88.7% of the reference alpha mask. Most mismatch lies along one-pixel edges
  and the hairline end of the flourish. This is a silhouette check, not a
  rendered color or lighting score.
- A single frontal graphic does not specify real-world thickness, the back
  finish, or edge lighting. Change `depth` in `createVasaIconModel()` if a
  flatter emblem is needed in the website.

The build follows img2threejs's procedural geometry approach: observe the
reference, measure the silhouette, express it as a code-defined Shape, add
material and an animation-ready Group, then compare its projected geometry
to the source. The repo's generic object generator was not used for this
logo because its primitives would erase the thin, identity-defining curves.
