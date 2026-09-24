import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

const result = await build({ entryPoints: ['src/main.ts'], bundle: true,
  format: 'iife', target: 'es2020', write: false, legalComments: 'inline',
  loader: { '.webp': 'dataurl' } });
const template = await readFile('index.template.html', 'utf8');
const javascript = result.outputFiles[0].text.replaceAll('</script', '<\\/script');
const html = template.replace('/* BUNDLED_SCENE */', () => javascript);
await writeFile('VASA_The_Sweetest_Stranger_3D.html', html);
await writeFile('index.html', await readFile('index.fallback.html', 'utf8'));
const iconResult = await build({ entryPoints: ['src/iconMain.ts'], bundle: true,
  format: 'iife', target: 'es2020', write: false, minify: true, legalComments: 'inline' });
const iconTemplate = await readFile('icon.template.html', 'utf8');
const iconJavascript = iconResult.outputFiles[0].text.replaceAll('</script', '<\\/script');
const outlineResult = await build({ entryPoints: ['src/vasaIconOutline.ts'], bundle: true,
  platform: 'node', format: 'esm', write: false });
const outlineUrl = `data:text/javascript;base64,${Buffer.from(outlineResult.outputFiles[0].text).toString('base64')}`;
const { OUTER, GROOVE, INNER, SPIRAL } = await import(outlineUrl);
const iconPath = [OUTER, GROOVE, INNER, SPIRAL]
  .map(points => `M ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`).join(' ');
const fallback = `<div class="fallback" id="icon-fallback"><svg viewBox="24 0 125 144" role="img" aria-label="VASA icon front view" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vasa-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d7b477"/><stop offset=".48" stop-color="#a67d44"/><stop offset="1" stop-color="#80592c"/></linearGradient></defs><path d="${iconPath}" fill="url(#vasa-gold)" fill-rule="evenodd"/></svg></div>`;
const iconHtml = iconTemplate.replace('<!-- ICON_FALLBACK -->', () => fallback)
  .replace('/* BUNDLED_ICON_SCENE */', () => iconJavascript);
await writeFile('icon.html', iconHtml);
console.log('Built offline bottle and icon scenes, plus GitHub Pages entry page');
