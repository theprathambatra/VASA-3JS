# VASA 3D perfume bottle

[**Open the live Three.js scene**](https://theprathambatra.github.io/VASA-3JS/)

[**Open the VASA icon model**](https://theprathambatra.github.io/VASA-3JS/icon.html)

An interactive, procedural reconstruction of the VASA *The Sweetest Stranger* 50 ml perfume bottle from three product photographs and a close-up of the cap top. Drag to rotate, scroll to zoom, switch between front, side, and back, start the turntable, or lift the cap.

## Run or edit

`index.html` opens the viewer when WebGL is available and shows a still preview when it is disabled. Download `VASA_The_Sweetest_Stranger_3D.html` to run the self-contained scene offline.

The editable TypeScript lives in `src/`. Run `npm install` and `npm run build` to regenerate the viewer and entry page from `index.template.html` and `index.fallback.html`. `createVasaBottleModel()` returns a named `THREE.Group` and cap pivot that can be used in another browser-based Three.js application.

The icon study lives in `icon.html`, generated from `icon.template.html`. `createVasaIconModel()` in `src/createVasaIconModel.ts` returns a named `THREE.Group`, the mesh, and its face and edge materials. The mark is an extruded Three.js `Shape` with three transparent cutouts. Its traced profile is editable in `src/vasaIconOutline.ts`. It uses no raster image at runtime. Use a local server or open the generated HTML file to preview either scene offline.

## Model notes

The bottle uses procedural geometry and generated canvas textures. A crop of the supplied cap-top photo is embedded in the standalone viewer as the engraved wood surface; the other original photos are not loaded by the site. Proportions and depth are visual estimates, the fine printed artwork is approximated, and the concealed atomizer is inferred. See [reconstruction-notes.md](reconstruction-notes.md) for the component inventory and review scope.

Inspired by the [img2threejs](https://github.com/img2threejs/img2threejs) procedural workflow. Three.js is included in the bundled HTML under its MIT license; see [LICENSE-three.txt](LICENSE-three.txt).

The logo provides only a front view. The icon silhouette follows that image; the 0.14 world-unit extrusion and metallic edge finish are interpretations, not measured product geometry.
