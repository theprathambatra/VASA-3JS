import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

const result = await build({ entryPoints: ['src/main.ts'], bundle: true,
  format: 'iife', target: 'es2020', write: false, legalComments: 'inline' });
const template = await readFile('index.template.html', 'utf8');
const javascript = result.outputFiles[0].text.replaceAll('</script', '<\\/script');
const html = template.replace('/* BUNDLED_SCENE */', javascript);
await writeFile('VASA_The_Sweetest_Stranger_3D.html', html);
await writeFile('index.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0; url=./VASA_The_Sweetest_Stranger_3D.html">
<title>VASA 3D perfume bottle</title></head>
<body><a href="./VASA_The_Sweetest_Stranger_3D.html">Open the VASA 3D scene</a></body></html>
`);
console.log('Built offline HTML scene and GitHub Pages entry page');
