#!/usr/bin/env node
// scripts/check-budget.mjs — presupuesto de performance sobre un build estático (sin dependencias).
// Uso: node scripts/check-budget.mjs [carpeta-dist=dist]
// Complementa a Lighthouse (que mide el resultado); esto detecta las causas típicas antes de medir.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = process.argv[2] ?? 'dist';
if (!existsSync(dist)) { console.error(`No existe ${dist}. Ejecuta "npm run build" primero.`); process.exit(2); }

const BUDGET = { jsKB: 70, cssKB: 30, htmlKB: 30, imgKB: 200, fontFiles: 2 };
const errors = [], warns = [];
const err = (p, m) => errors.push(`✖ ${p}: ${m}`);
const warn = (p, m) => warns.push(`⚠ ${p}: ${m}`);
const walk = (d) => readdirSync(d).flatMap((n) => { const f = join(d, n); return statSync(f).isDirectory() ? walk(f) : [f]; });
const files = walk(dist);
const gz = (buf) => gzipSync(buf).length;

const pages = files.filter((f) => extname(f) === '.html');
let inlineJs = 0;
for (const f of pages) {
  const p = relative(dist, f);
  if (/(^|\/)404\.html$/.test(p)) continue;
  const html = readFileSync(f, 'utf8');

  const htmlKB = gz(Buffer.from(html)) / 1024;
  if (htmlKB > BUDGET.htmlKB) warn(p, `HTML ${htmlKB.toFixed(1)} KB gzip > ${BUDGET.htmlKB} KB`);

  // Imágenes
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  imgs.forEach((t, i) => {
    const src = t.match(/\ssrc=["']([^"']+)["']/)?.[1] ?? '';
    if (/\.(jpe?g|png|gif)(\?|$)/i.test(src) && !/apple-touch|favicon|logo/i.test(src)) warn(p, `imagen en formato heredado (${src}): preferir WebP/AVIF`);
    if (!/\swidth=/.test(t) || !/\sheight=/.test(t)) warn(p, `<img> sin width/height (riesgo de CLS): ${t.slice(0, 80)}…`);
    if (i === 0) {
      // La primera imagen del documento suele ser el LCP
      if (/loading=["']lazy["']/.test(t)) warn(p, 'la primera <img> tiene loading="lazy": si es el LCP, debe ser eager');
      if (!/fetchpriority=["']high["']/.test(t)) warn(p, 'la primera <img> no tiene fetchpriority="high" (verificar si es el elemento LCP)');
    }
  });

  // Recursos externos
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) err(p, 'usa Google Fonts remotas: autoalojar WOFF2');
  for (const m of html.matchAll(/<script\b[^>]*\ssrc=["'](https?:\/\/[^"']+)["']/gi)) warn(p, `script de terceros en carga inicial: ${m[1]}`);
  for (const m of html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](https?:\/\/[^"']+)["']/gi)) warn(p, `CSS de terceros bloqueante: ${m[1]}`);
  const preloadFonts = (html.match(/<link\b[^>]*rel=["']preload["'][^>]*as=["']font["']/gi) ?? []).length;
  if (preloadFonts > BUDGET.fontFiles) warn(p, `${preloadFonts} fuentes precargadas (máx. recomendado: ${BUDGET.fontFiles})`);

  // Scripts inline (excluye JSON-LD)
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/application\/ld\+json/.test(m[1])) continue;
    inlineJs += Buffer.byteLength(m[2]);
  }
  // Animación de entrada en el H1 (mata el LCP)
  if (/<h1\b[^>]*class=["'][^"']*\b(fade-up|reveal)\b/.test(html)) err(p, 'el <h1> usa .fade-up/.reveal: el elemento LCP no debe animarse ni arrancar invisible');
}
if (!pages.length) err('dist', 'no se encontraron páginas HTML');

// ---------- recursos ----------
const sum = (exts) => files.filter((f) => exts.includes(extname(f))).reduce((a, f) => a + gz(readFileSync(f)), 0);
const jsKB = (sum(['.js', '.mjs']) + inlineJs) / 1024;
const cssKB = sum(['.css']) / 1024;
if (jsKB > BUDGET.jsKB) err('JS', `${jsKB.toFixed(1)} KB gzip > ${BUDGET.jsKB} KB (cota superior de carga inicial)`);
if (cssKB > BUDGET.cssKB) err('CSS', `${cssKB.toFixed(1)} KB gzip > ${BUDGET.cssKB} KB`);
for (const f of files.filter((f) => ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(extname(f)))) {
  const kb = statSync(f).size / 1024;
  if (kb > BUDGET.imgKB) warn(relative(dist, f), `imagen de ${kb.toFixed(0)} KB (> ${BUDGET.imgKB} KB); verificar que no sea LCP o recomprimir`);
}
const fonts = files.filter((f) => ['.woff2', '.woff', '.ttf', '.otf'].includes(extname(f)));
if (fonts.some((f) => /\.(ttf|otf)$/.test(f))) warn('fuentes', 'hay TTF/OTF: usar WOFF2');

console.log(`JS ≈ ${jsKB.toFixed(1)} KB gzip · CSS ≈ ${cssKB.toFixed(1)} KB gzip · páginas: ${pages.length}`);
warns.forEach((w) => console.log(w));
errors.forEach((e) => console.log(e));
console.log(`\n${errors.length} errores, ${warns.length} avisos.`);
process.exit(errors.length ? 1 : 0);
