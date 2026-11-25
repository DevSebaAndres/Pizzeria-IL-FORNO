#!/usr/bin/env node

/**
 * check-budget.mjs — web-performance-design-v2.0
 *
 * Auditor estático del presupuesto de peso de un build (sin dependencias).
 *
 * QUÉ VERIFICA
 *   - HTML y CSS (gzip) contra su tope.
 *   - JS en DOS niveles:
 *       CRÍTICO  = scripts que el HTML carga o ejecuta al inicio: <script src>, <link rel="modulepreload">,
 *                  scripts inline, más los módulos que esos archivos importan de forma ESTÁTICA (recursivo).
 *       DIFERIDO = el resto de los .js del build (chunks de islas, GSAP, import() dinámico).
 *   - Scripts, hojas de estilo y preloads de OTROS ORÍGENES en el HTML (bloquean el render).
 *   - Fuentes (cantidad y peso) e imágenes grandes fuera de carpetas de secuencia (aviso).
 *
 * QUÉ NO VERIFICA (limitaciones)
 *   - No ejecuta la página: no ve lo que un script inserte en runtime ni el orden real de carga.
 *   - "Diferido" es la suma de todos los .js que no son críticos en ninguna página; en sitios de varias
 *     páginas sobrestima lo que carga cada una. Confirmar con el panel Network de Chrome.
 *   - No mide LCP, CLS ni Lighthouse. No mide secuencias de frames (usar check-frames.mjs).
 *
 * Los umbrales son criterios propios de la skill (ver references/stack-performance.md §3), no normas.
 *
 * USO
 *   node scripts/check-budget.mjs <dist> [--critical-js-kb 15] [--deferred-js-kb 120] [--html-kb 30]
 *        [--css-kb 30] [--lcp-image-kb 120] [--json]
 * CÓDIGOS DE SALIDA
 *   0 todo dentro de presupuesto · 1 presupuesto excedido o violación · 2 entrada inválida
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    const k = argv[i].slice(2);
    if (k === 'json') flags.json = true;
    else { flags[k] = argv[i + 1]; i++; }
  } else positional.push(argv[i]);
}

const LIMITS = {
  htmlKb: Number(flags['html-kb'] ?? 30),
  cssKb: Number(flags['css-kb'] ?? 30),
  criticalJsKb: Number(flags['critical-js-kb'] ?? 15),
  deferredJsKb: Number(flags['deferred-js-kb'] ?? 120),
  lcpImageKb: Number(flags['lcp-image-kb'] ?? 120),
};

const dist = path.resolve(positional[0] ?? 'dist');
if (!fs.existsSync(dist) || !fs.statSync(dist).isDirectory()) {
  console.error(`ERROR: no existe el directorio de build: ${dist}\nEjecutar primero "npm run build".`);
  process.exit(2);
}

const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const kb = (n) => n / 1024;
const fmt = (n) => `${kb(n).toFixed(1)} KB`;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
if (htmlFiles.length === 0) {
  console.error(`ERROR: no hay archivos .html en ${dist}. ¿Es el directorio de salida del build?`);
  process.exit(2);
}

const isExternal = (u) => /^(https?:)?\/\//i.test(u);
const attr = (s, name) => (s.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i')) || [])[1];

function resolveLocal(ref, fromFile) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return null;
  const p = clean.startsWith('/') ? path.join(dist, clean) : path.resolve(path.dirname(fromFile), clean);
  return fs.existsSync(p) ? p : null;
}

// Módulos importados de forma estática por un .js (import ... from "x.js" / import "x.js"); no incluye import()
function staticImports(jsFile) {
  const src = fs.readFileSync(jsFile, 'utf-8');
  const out = new Set();
  const re = /(?:\bfrom\s*|\bimport\s*)["']([^"']+\.js)["']/g;
  let m;
  while ((m = re.exec(src))) {
    if (isExternal(m[1])) continue;
    const p = resolveLocal(m[1], jsFile);
    if (p) out.add(p);
  }
  return out;
}

function collectCritical(entry, seen) {
  if (seen.has(entry)) return;
  seen.add(entry);
  for (const dep of staticImports(entry)) collectCritical(dep, seen);
}

let htmlGzMax = 0;
let inlineMax = 0;
const criticalFiles = new Set();
const perPageCritical = [];
const violations = [];
const warnings = [];

for (const html of htmlFiles) {
  const text = fs.readFileSync(html, 'utf-8');
  const rel = path.relative(dist, html);
  htmlGzMax = Math.max(htmlGzMax, gz(Buffer.from(text)));

  const pageFiles = new Set();
  let pageInline = 0;

  for (const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    const type = attr(attrs, 'type') || '';
    if (/json|importmap|speculationrules/i.test(type)) continue;
    const src = attr(attrs, 'src');
    if (src) {
      if (isExternal(src)) { violations.push(`${rel}: script de otro origen: ${src}`); continue; }
      const p = resolveLocal(src, html);
      if (p) collectCritical(p, pageFiles);
    } else if (m[2].trim()) {
      pageInline += gz(Buffer.from(m[2]));
    }
  }

  for (const m of text.matchAll(/<link\b([^>]*)>/gi)) {
    const rel_ = (attr(m[1], 'rel') || '').toLowerCase();
    const href = attr(m[1], 'href');
    if (!href) continue;
    if (rel_.includes('modulepreload') && !isExternal(href)) {
      const p = resolveLocal(href, html);
      if (p) collectCritical(p, pageFiles);
    }
    if (isExternal(href)) {
      if (rel_.includes('stylesheet')) violations.push(`${rel}: hoja de estilos de otro origen: ${href}`);
      else if (rel_.includes('preconnect') || rel_.includes('dns-prefetch')) warnings.push(`${rel}: preconnect a otro origen (¿se usa en el primer render?): ${href}`);
      else if (rel_.includes('preload')) warnings.push(`${rel}: preload de otro origen: ${href}`);
    }
  }
  for (const m of text.matchAll(/<img\b([^>]*)>/gi)) {
    const src = attr(m[1], 'src');
    if (src && isExternal(src)) warnings.push(`${rel}: imagen de otro origen (hotlink): ${src.slice(0, 90)}`);
  }

  let pageCriticalGz = pageInline;
  for (const f of pageFiles) { criticalFiles.add(f); pageCriticalGz += gz(fs.readFileSync(f)); }
  inlineMax = Math.max(inlineMax, pageInline);
  perPageCritical.push({ page: rel, gz: pageCriticalGz });
}

const jsFiles = files.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
let criticalMax = 0;
for (const p of perPageCritical) criticalMax = Math.max(criticalMax, p.gz);
let deferredGz = 0;
const deferredList = [];
for (const f of jsFiles) {
  if (criticalFiles.has(f)) continue;
  const size = gz(fs.readFileSync(f));
  deferredGz += size;
  deferredList.push({ file: path.relative(dist, f), gz: size });
}
deferredList.sort((a, b) => b.gz - a.gz);

const cssGz = files.filter((f) => f.endsWith('.css')).reduce((s, f) => s + gz(fs.readFileSync(f)), 0);

const fonts = files.filter((f) => /\.(woff2?|ttf|otf)$/i.test(f)).map((f) => ({ file: path.relative(dist, f), size: fs.statSync(f).size }));
const fontsTotal = fonts.reduce((s, f) => s + f.size, 0);

const seqDir = /[\\/](frames|sequence|seq|secuencia)[\\/]/i;
const bigImages = files
  .filter((f) => /\.(avif|webp|jpe?g|png)$/i.test(f) && !seqDir.test(f))
  .map((f) => ({ file: path.relative(dist, f), size: fs.statSync(f).size }))
  .filter((i) => kb(i.size) > LIMITS.lcpImageKb)
  .sort((a, b) => b.size - a.size);
const seqFiles = files.filter((f) => seqDir.test(f) && /\.(avif|webp|jpe?g|png)$/i.test(f));

const rows = [
  { name: 'HTML (gzip, página más pesada)', value: htmlGzMax, limit: LIMITS.htmlKb },
  { name: 'CSS total (gzip)', value: cssGz, limit: LIMITS.cssKb },
  { name: 'JS CRÍTICO (gzip, página más pesada)', value: criticalMax, limit: LIMITS.criticalJsKb },
  { name: 'JS DIFERIDO (gzip, total)', value: deferredGz, limit: LIMITS.deferredJsKb },
];

const result = { dist, rows: [], violations, warnings };
console.log(`\nPresupuesto de peso v2 — ${dist}`);
console.log(`Páginas analizadas: ${htmlFiles.length} · archivos JS: ${jsFiles.length} (críticos: ${criticalFiles.size})\n`);
let failed = false;
for (const r of rows) {
  const ok = kb(r.value) <= r.limit;
  if (!ok) failed = true;
  result.rows.push({ name: r.name, kb: +kb(r.value).toFixed(1), limitKb: r.limit, ok });
  console.log(`${ok ? 'OK    ' : 'EXCEDE'} ${r.name.padEnd(40)} ${fmt(r.value).padStart(10)}  (tope ${r.limit} KB)`);
}
if (inlineMax > 0) console.log(`       (de lo crítico, JS inline: ${fmt(inlineMax)} en la página con más inline)`);

if (deferredList.length) {
  console.log('\nMayores chunks diferidos:');
  for (const d of deferredList.slice(0, 5)) console.log(`  ${fmt(d.gz).padStart(10)}  ${d.file}`);
}

console.log(`\nFuentes: ${fonts.length} archivo(s), ${fmt(fontsTotal)}`);
if (fonts.length > 2 || kb(fontsTotal) > 50) warnings.push(`fuentes: ${fonts.length} archivos / ${fmt(fontsTotal)} (guía: ≤ 2 WOFF2 críticos, ~30–50 KB). Puede haber fuentes no críticas; revisar cuáles se precargan.`);

if (bigImages.length) {
  for (const i of bigImages.slice(0, 8)) warnings.push(`imagen > ${LIMITS.lcpImageKb} KB fuera de secuencias: ${i.file} (${fmt(i.size)}). Si es la imagen LCP, excede el tope.`);
}
if (seqFiles.length) console.log(`Secuencia detectada: ${seqFiles.length} imágenes en carpetas frames/sequence → verificar con check-frames.mjs (no se evalúan aquí).`);

if (violations.length) {
  failed = true;
  console.log('\nVIOLACIONES (otros orígenes en la carga inicial):');
  for (const v of violations) console.log(`  - ${v}`);
}
if (warnings.length) {
  console.log('\nAVISOS:');
  for (const w of warnings) console.log(`  - ${w}`);
}

console.log(failed
  ? '\nRESULTADO: presupuesto EXCEDIDO o con violaciones. No declarar cumplimiento.'
  : '\nRESULTADO: dentro del presupuesto estático. (No mide LCP/CLS ni fluidez: ver Lighthouse y measure-scroll.mjs.)');
if (flags.json) console.log(JSON.stringify({ ...result, failed }, null, 2));
process.exit(failed ? 1 : 0);

