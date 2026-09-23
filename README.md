# VASA 3D perfume bottle

[**Open the live Three.js scene**](https://theprathambatra.github.io/VASA-3JS/)

An interactive, procedural reconstruction of the VASA *The Sweetest Stranger* 50 ml perfume bottle from three product photographs. Drag to rotate, scroll to zoom, switch between front, side, and back, start the turntable, or lift the cap.

## Run or edit

`index.html` opens the viewer on GitHub Pages. Download `VASA_The_Sweetest_Stranger_3D.html` to run the self-contained scene offline.

The editable TypeScript lives in `src/`. Run `npm install` and `npm run build` to regenerate the viewer and entry page from `index.template.html`. `createVasaBottleModel()` returns a named `THREE.Group` and cap pivot that can be used in another browser-based Three.js application.

## Model notes

The bottle uses procedural geometry and generated canvas textures. The original photos are not loaded by the site. Proportions and depth are visual estimates, the fine printed artwork is approximated, and the concealed atomizer is inferred. See [reconstruction-notes.md](reconstruction-notes.md) for the component inventory and review scope.

Inspired by the [img2threejs](https://github.com/img2threejs/img2threejs) procedural workflow. Three.js is included in the bundled HTML under its MIT license; see [LICENSE-three.txt](LICENSE-three.txt).
