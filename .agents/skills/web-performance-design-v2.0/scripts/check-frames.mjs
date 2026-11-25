#!/usr/bin/env node

/**
 * check-frames.mjs — web-performance-design-v2.0
 *
 * Audita una secuencia de frames (scrollytelling) o un directorio de imágenes de escena. Sin dependencias.
 *
 * QUÉ VERIFICA
 *   - Cantidad de frames, peso total, peso medio y máximo.
 *   - Peso del LOTE INICIAL (1 de cada N frames, N = --stride), que es lo que se pide primero con carga progresiva.
 *   - Formato (AVIF/WebP vs JPG/PNG), dimensiones (si se pueden leer) y consistencia entre frames.
 *   - Numeración sin huecos (frame_0001, frame_0002, …).
 *   - Memoria DECODIFICADA estimada si todos los frames estuvieran en memoria (ancho × alto × 4 bytes).
 *
 * QUÉ NO VERIFICA
 *   - No mide la fluidez ni el tiempo de decodificación (usar measure-scroll.mjs).
 *   - No lee dimensiones de formatos que no sean WebP, AVIF, PNG o JPEG; en ese caso lo avisa.
 *
 * Perfiles (criterios propios de la skill, ver references/frame-sequence.md §3; se pueden sobrescribir):
 *   desktop: ≤ 240 frames · total ≤ 8 MB · medio ≤ 60 KB · lote inicial ≤ 500 KB
 *   mobile : ≤ 120 frames · total ≤ 3 MB · medio ≤ 40 KB · lote inicial ≤ 300 KB
 *
 * USO
 *   node scripts/check-frames.mjs <directorio> [--profile desktop|mobile] [--stride 4]
 *        [--max-frames N] [--max-total-mb N] [--max-avg-kb N] [--max-initial-kb N] [--max-decoded-mb N]
 * CÓDIGOS DE SALIDA
 *   0 dentro de los topes · 1 algún tope excedido · 2 entrada inválida
 */

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { flags[argv[i].slice(2)] = argv[i + 1]; i++; } else positional.push(argv[i]);
}

const PROFILES = {
  desktop: { frames: 240, totalMb: 8, avgKb: 60, initialKb: 500 },
  mobile: { frames: 120, totalMb: 3, avgKb: 40, initialKb: 300 },
};
const profileName = flags.profile ?? 'desktop';
if (!PROFILES[profileName]) { console.error(`ERROR: perfil desconocido "${profileName}" (usar desktop o mobile)`); process.exit(2); }
const P = PROFILES[profileName];
const LIM = {
  frames: Number(flags['max-frames'] ?? P.frames),
  totalMb: Number(flags['max-total-mb'] ?? P.totalMb),
  avgKb: Number(flags['max-avg-kb'] ?? P.avgKb),
  initialKb: Number(flags['max-initial-kb'] ?? P.initialKb),
  decodedMb: flags['max-decoded-mb'] !== undefined ? Number(flags['max-decoded-mb']) : null,
};
const stride = Math.max(1, Number(flags.stride ?? 4));

const dir = path.resolve(positional[0] ?? '');
if (!positional[0] || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.error(`ERROR: indicar un directorio de frames existente. Recibido: ${positional[0] ?? '(nada)'}`);
  process.exit(2);
}

const IMG = /\.(avif|webp|jpe?g|png)$/i;
const files = fs.readdirSync(dir).filter((f) => IMG.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (files.length === 0) { console.error(`ERROR: no hay imágenes (avif/webp/jpg/png) en ${dir}`); process.exit(2); }

const kb = (n) => n / 1024;
const mb = (n) => n / 1024 / 1024;

function dimensions(file) {
  const buf = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  try {
    if (ext === '.png') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (ext === '.webp' && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const fourcc = buf.toString('ascii', 12, 16);
      if (fourcc === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (fourcc === 'VP8L') { const b = buf.readUInt32LE(21); return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
      if (fourcc === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    }
    if (ext === '.avif') {
      const i = buf.indexOf('ispe');
      if (i > 0) return { w: buf.readUInt32BE(i + 8), h: buf.readUInt32BE(i + 12) };
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      let o = 2;
      while (o < buf.length) {
        if (buf[o] !== 0xff) { o++; continue; }
        const m = buf[o + 1];
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) };
        o += 2 + buf.readUInt16BE(o + 2);
      }
    }
  } catch { /* formato no legible */ }
  return null;
}

const sizes = files.map((f) => fs.statSync(path.join(dir, f)).size);
const total = sizes.reduce((a, b) => a + b, 0);
const avg = total / files.length;
const max = Math.max(...sizes);
const initialIdx = files.map((_, i) => i).filter((i) => i % stride === 0 || i === files.length - 1);
const initial = initialIdx.reduce((s, i) => s + sizes[i], 0);

const exts = {};
for (const f of files) { const e = path.extname(f).toLowerCase(); exts[e] = (exts[e] || 0) + 1; }
const legacy = (exts['.jpg'] || 0) + (exts['.jpeg'] || 0) + (exts['.png'] || 0);

const dimCache = new Map();
const sample = [0, Math.floor(files.length / 2), files.length - 1];
for (const i of sample) dimCache.set(files[i], dimensions(path.join(dir, files[i])));
const dims = [...dimCache.values()].filter(Boolean);
const dimKey = (d) => `${d.w}×${d.h}`;
const uniqueDims = [...new Set(dims.map(dimKey))];
const decodedBytes = dims.length ? dims[0].w * dims[0].h * 4 * files.length : null;

// numeración
const gaps = [];
const nums = files.map((f) => { const m = f.match(/(\d+)(?=\.[a-z0-9]+$)/i); return m ? Number(m[1]) : null; });
if (nums.every((n) => n !== null)) {
  for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[i - 1] + 1) gaps.push(`${nums[i - 1]} → ${nums[i]}`);
}

console.log(`\nSecuencia: ${dir}`);
console.log(`Perfil: ${profileName} · lote inicial = 1 de cada ${stride} frames (${initialIdx.length} frames)\n`);

const checks = [
  { name: 'Cantidad de frames', value: files.length, shown: `${files.length}`, limit: LIM.frames, unit: '' },
  { name: 'Peso total', value: mb(total), shown: `${mb(total).toFixed(1)} MB`, limit: LIM.totalMb, unit: ' MB' },
  { name: 'Peso medio por frame', value: kb(avg), shown: `${kb(avg).toFixed(1)} KB`, limit: LIM.avgKb, unit: ' KB' },
  { name: 'Lote inicial', value: kb(initial), shown: `${kb(initial).toFixed(0)} KB`, limit: LIM.initialKb, unit: ' KB' },
];
if (LIM.decodedMb !== null && decodedBytes !== null) {
  checks.push({ name: 'Memoria decodificada (todos los frames)', value: mb(decodedBytes), shown: `${mb(decodedBytes).toFixed(0)} MB`, limit: LIM.decodedMb, unit: ' MB' });
}
let failed = false;
for (const c of checks) {
  const ok = c.value <= c.limit;
  if (!ok) failed = true;
  console.log(`${ok ? 'OK    ' : 'EXCEDE'} ${c.name.padEnd(42)} ${c.shown.padStart(10)}  (tope ${c.limit}${c.unit})`);
}
console.log(`\nMáximo por frame: ${kb(max).toFixed(1)} KB · Formatos: ${Object.entries(exts).map(([e, n]) => `${e} ×${n}`).join(', ')}`);

const notes = [];
if (legacy > 0) notes.push(`${legacy} frame(s) en JPG/PNG: preferir AVIF o WebP (menos peso).`);
if (dims.length === 0) notes.push('No se pudieron leer las dimensiones (formato no soportado por este script).');
else {
  console.log(`Dimensiones (muestra de ${dims.length}): ${uniqueDims.join(', ')}`);
  if (uniqueDims.length > 1) notes.push(`Los frames muestreados no tienen todas las mismas dimensiones (${uniqueDims.join(', ')}): el canvas se verá inconsistente.`);
  console.log(`Memoria decodificada si TODOS los frames estuvieran en memoria: ${mb(decodedBytes).toFixed(0)} MB → no mantenerlos todos decodificados (ver frame-sequence.md §4).`);
  if (mb(decodedBytes) > 256) notes.push(`Decodificados todos a la vez ocuparían ~${mb(decodedBytes).toFixed(0)} MB: usar ventana de frames (±N) o reducir resolución/cantidad.`);
}
if (gaps.length) notes.push(`Numeración con huecos: ${gaps.slice(0, 5).join(', ')}${gaps.length > 5 ? '…' : ''}`);
if (notes.length) { console.log('\nAVISOS:'); for (const n of notes) console.log(`  - ${n}`); }

console.log(failed
  ? '\nRESULTADO: la secuencia EXCEDE el plan de medios del perfil. Reducir cantidad, resolución o calidad, o usar carga progresiva / video.'
  : '\nRESULTADO: dentro de los topes de peso del perfil. (La fluidez se mide con measure-scroll.mjs.)');
process.exit(failed ? 1 : 0);

