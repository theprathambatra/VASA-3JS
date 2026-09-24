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
await writeFile('icon.html', iconTemplate.replace('/* BUNDLED_ICON_SCENE */', () => iconJavascript));
console.log('Built offline bottle and icon scenes, plus GitHub Pages entry page');
