#!/usr/bin/env node

/**
 * verify-all.mjs — cinematic-fast-web-v2.0
 *
 * Ejecuta los scripts de verificación de las skills hermanas v2 y resume el resultado.
 *
 * QUÉ HACE:  lanzar cada script, mostrar su salida real y clasificar el paso por código de salida.
 * QUÉ NO HACE: no mide Lighthouse (usar `npx lhci autorun`), no interpreta ni suaviza resultados,
 *              y no considera aprobado un paso cuyo script o parámetro falta.
 *
 * Estados por paso:
 *   OK            el script corrió y salió con código 0
 *   FALLA         el script corrió y salió con código distinto de 0
 *   NO EJECUTADO  falta el script en la skill hermana, o el script salió con código 3 (herramienta externa
 *                 ausente, por ejemplo Playwright sin instalar)
 *   OMITIDO       falta el parámetro que ese paso necesita
 * Código de salida: 0 solo si no hay FALLA, NO EJECUTADO ni OMITIDO. Si no, 1.
 *
 * Uso:
 *   node verify-all.mjs --dist dist --frames public/frames --url http://localhost:4321 \
 *        --pairs "#111111/#ffffff,#ffffff/#8e2b24"
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.resolve(here, '..', '..');
const SKILLS = {
  cinematic: path.join(skillsRoot, 'cinematic-fast-web-v2.0'),
  performance: path.join(skillsRoot, 'web-performance-design-v2.0'),
  discoverability: path.join(skillsRoot, 'web-discoverability-v2.0'),
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { out[key] = next; i++; } else { out[key] = true; }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const results = [];

function runStep(name, scriptPath, scriptArgs, needs) {
  console.log(`\n=== ${name} ===`);
  if (needs && !needs.value) {
    console.log(`OMITIDO: falta el parámetro ${needs.flag}`);
    results.push({ name, status: 'OMITIDO', detail: `falta ${needs.flag}` });
    return;
  }
  if (!fs.existsSync(scriptPath)) {
    const rel = path.relative(skillsRoot, scriptPath);
    console.log(`NO EJECUTADO: no existe ${rel}`);
    results.push({ name, status: 'NO EJECUTADO', detail: `falta ${rel}` });
    return;
  }
  const r = spawnSync(process.execPath, [scriptPath, ...scriptArgs], { encoding: 'utf-8' });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  // Convención de las skills v2: código 3 = herramienta externa ausente (p. ej. Playwright sin instalar).
  if (r.status === 3) {
    results.push({ name, status: 'NO EJECUTADO', detail: 'herramienta ausente (ver mensaje arriba)' });
    return;
  }
  const ok = r.status === 0;
  results.push({ name, status: ok ? 'OK' : 'FALLA', detail: `código ${r.status}` });
}

// 1. Vigencia de las guías de las tres skills (script de la skill de performance)
const freshness = path.join(SKILLS.performance, 'scripts', 'check-freshness.mjs');
for (const [label, dir] of [
  ['Vigencia: cinematic-fast-web-v2.0', SKILLS.cinematic],
  ['Vigencia: web-performance-design-v2.0', SKILLS.performance],
  ['Vigencia: web-discoverability-v2.0', SKILLS.discoverability],
]) {
  if (!fs.existsSync(dir)) {
    console.log(`\n=== ${label} ===\nNO EJECUTADO: no existe ${path.relative(skillsRoot, dir)}`);
    results.push({ name: label, status: 'NO EJECUTADO', detail: `falta ${path.relative(skillsRoot, dir)}` });
  } else {
    runStep(label, freshness, [dir]);
  }
}

// 2. SEO / AEO / GEO sobre el build
runStep('SEO / AEO / GEO (check-seo)', path.join(SKILLS.discoverability, 'scripts', 'check-seo.mjs'),
  [String(args.dist ?? '')], { flag: '--dist', value: args.dist });

// 3. Presupuesto de peso (crítico + diferido)
runStep('Presupuesto de peso (check-budget)', path.join(SKILLS.performance, 'scripts', 'check-budget.mjs'),
  [String(args.dist ?? '')], { flag: '--dist', value: args.dist });

// 4. Peso de la secuencia de frames o video
const frameArgs = [String(args.frames ?? '')];
if (args.stride) frameArgs.push('--stride', String(args.stride));
runStep('Secuencia de frames (check-frames)', path.join(SKILLS.performance, 'scripts', 'check-frames.mjs'),
  frameArgs, { flag: '--frames', value: args.frames });

// 5. Contraste de la paleta
const pairs = typeof args.pairs === 'string' ? args.pairs.split(',').map((s) => s.trim()).filter(Boolean) : [];
runStep('Contraste WCAG (contrast)', path.join(SKILLS.performance, 'scripts', 'contrast.mjs'),
  pairs, { flag: '--pairs', value: pairs.length ? pairs : null });

// 6. Fluidez de scroll (requiere el sitio sirviéndose)
runStep('Fluidez de scroll (measure-scroll)', path.join(SKILLS.performance, 'scripts', 'measure-scroll.mjs'),
  ['--url', String(args.url ?? ''), '--profile', String(args.profile ?? 'mobile')], { flag: '--url', value: args.url });

// Resumen
console.log('\n================ RESUMEN ================');
const pad = (s, n) => s.padEnd(n, ' ');
for (const r of results) console.log(`${pad(r.status, 13)} ${pad(r.name, 42)} ${r.detail}`);
const count = (s) => results.filter((r) => r.status === s).length;
const bad = count('FALLA') + count('NO EJECUTADO') + count('OMITIDO');
console.log(`\nOK: ${count('OK')} · FALLA: ${count('FALLA')} · NO EJECUTADO: ${count('NO EJECUTADO')} · OMITIDO: ${count('OMITIDO')}`);
console.log('Lighthouse NO se mide aquí: ejecutar `npx lhci autorun --config=lighthouserc.json` y reportar su salida real.');
if (bad > 0) {
  console.log('\nResultado: NO verificado por completo. No declarar cumplimiento.');
  process.exit(1);
}
console.log('\nResultado: todos los pasos ejecutados pasaron (falta Lighthouse).');
process.exit(0);

