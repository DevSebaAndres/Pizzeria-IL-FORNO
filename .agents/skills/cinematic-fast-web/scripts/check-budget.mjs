#!/usr/bin/env node

/**
 * Auditor de presupuesto de rendimiento (Performance Budget)
 * Uso: node scripts/check-budget.mjs [dist]
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(process.cwd(), 'dist');

console.log(`\n⚡ Auditoría de Presupuesto de Rendimiento en: ${targetDir}\n`);

if (!fs.existsSync(targetDir)) {
  console.log(`⚠️  Directorio no encontrado: ${targetDir}. (Asegúrate de haber ejecutado npm run build primero).`);
  process.exit(0);
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = getAllFiles(targetDir);

let totalHtmlGzip = 0;
let totalCssGzip = 0;
let totalJsGzip = 0;
let totalFonts = 0;
let fontFiles = [];
let largeImages = [];

for (const file of files) {
  const content = fs.readFileSync(file);
  const size = content.length;
  const ext = path.extname(file).toLowerCase();

  if (ext === '.html') {
    const gz = zlib.gzipSync(content).length;
    totalHtmlGzip += gz;
  } else if (ext === '.css') {
    const gz = zlib.gzipSync(content).length;
    totalCssGzip += gz;
  } else if (ext === '.js') {
    const gz = zlib.gzipSync(content).length;
    totalJsGzip += gz;
  } else if (['.woff2', '.woff', '.ttf', '.otf'].includes(ext)) {
    totalFonts += size;
    fontFiles.push({ file: path.relative(targetDir, file), size: (size / 1024).toFixed(1) });
  } else if (['.webp', '.avif', '.jpg', '.jpeg', '.png'].includes(ext)) {
    if (size > 120 * 1024) {
      largeImages.push({ file: path.relative(targetDir, file), size: (size / 1024).toFixed(1) });
    }
  }
}

const htmlKb = (totalHtmlGzip / 1024).toFixed(1);
const cssKb = (totalCssGzip / 1024).toFixed(1);
const jsKb = (totalJsGzip / 1024).toFixed(1);
const fontKb = (totalFonts / 1024).toFixed(1);

console.log(`📊 Métricas del Build:`);
console.log(`- HTML (gzip): ${htmlKb} KB (Presupuesto: ≤ 30 KB) -> ${totalHtmlGzip <= 30 * 1024 ? '✅ OK' : '❌ Excedido'}`);
console.log(`- CSS total (gzip): ${cssKb} KB (Presupuesto: ≤ 30 KB) -> ${totalCssGzip <= 30 * 1024 ? '✅ OK' : '❌ Excedido'}`);
console.log(`- JS total (gzip): ${jsKb} KB (Presupuesto: ≤ 70 KB) -> ${totalJsGzip <= 70 * 1024 ? '✅ OK' : '❌ Excedido'}`);
console.log(`- Fuentes cargadas: ${fontFiles.length} archivos, total ${fontKb} KB (Presupuesto: ≤ 2 fuentes WOFF2 / ≤ 50 KB) -> ${fontFiles.length <= 2 && totalFonts <= 50 * 1024 ? '✅ OK' : fontFiles.length <= 3 ? '⚠️  Revisar' : '❌ Excedido'}`);

if (largeImages.length > 0) {
  console.log(`\n⚠️  Imágenes que superan el límite de 120 KB para LCP:`);
  for (const img of largeImages) {
    console.log(`  - ${img.file} (${img.size} KB)`);
  }
}

console.log('');
const passed = totalHtmlGzip <= 30 * 1024 && totalCssGzip <= 30 * 1024 && totalJsGzip <= 70 * 1024;
if (!passed) {
  console.log('❌ El build excede el presupuesto de rendimiento establecido.');
  process.exit(1);
} else {
  console.log('✨ Build dentro de los límites del presupuesto de rendimiento.');
  process.exit(0);
}

