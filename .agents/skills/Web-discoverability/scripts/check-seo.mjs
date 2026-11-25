#!/usr/bin/env node

/**
 * Auditor estático de SEO / AEO / GEO (sin dependencias)
 * Uso: node scripts/check-seo.mjs [directorio|archivo.html]
 */

import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(process.cwd(), 'dist');

console.log(`\n🔍 Auditoría SEO / AEO / GEO en: ${target}\n`);

let filesToAudit = [];

if (fs.existsSync(target)) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    const findHtml = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) {
          findHtml(full);
        } else if (item.endsWith('.html')) {
          filesToAudit.push(full);
        }
      }
    };
    findHtml(target);
  } else if (target.endsWith('.html')) {
    filesToAudit.push(target);
  }
}

if (filesToAudit.length === 0) {
  console.log(`⚠️  No se encontraron archivos HTML en: ${target}. (Asegúrate de haber corrido npm run build o apunta a un archivo .html existente).`);
  process.exit(0);
}

let totalErrors = 0;
let totalWarnings = 0;

for (const htmlFile of filesToAudit) {
  const relPath = path.relative(process.cwd(), htmlFile);
  console.log(`📄 Analizando: ${relPath}`);
  const html = fs.readFileSync(htmlFile, 'utf-8');

  // 1. Lang
  if (!html.match(/<html[^>]+lang=["'][a-zA-Z-]+["']/i)) {
    console.log('  ❌ Falta atributo lang en la etiqueta <html>');
    totalErrors++;
  }

  // 2. Headings (H1)
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length === 0) {
    console.log('  ❌ No se encontró ningún elemento <h1>');
    totalErrors++;
  } else if (h1Matches.length > 1) {
    console.log(`  ❌ Se encontraron múltiples <h1> (${h1Matches.length}). Debe haber exactamente 1.`);
    totalErrors++;
  } else {
    console.log('  ✅ Jerarquía H1: 1 único H1 encontrado.');
  }

  // 3. Landmarks
  const mainMatches = html.match(/<main[^>]*>/gi) || [];
  if (mainMatches.length !== 1) {
    console.log(`  ❌ Se requiere exactamente 1 landmark <main> (encontrados: ${mainMatches.length})`);
    totalErrors++;
  } else {
    console.log('  ✅ Landmark <main>: único y correcto.');
  }

  // 4. Meta tags: Title, Description, Canonical
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    console.log('  ❌ Falta etiqueta <title> con contenido');
    totalErrors++;
  } else {
    const titleLen = titleMatch[1].trim().length;
    if (titleLen > 65) {
      console.log(`  ⚠️  El título tiene ${titleLen} caracteres (recomendado: <= 60-65)`);
      totalWarnings++;
    } else {
      console.log(`  ✅ <title> presente (${titleLen} caracteres)`);
    }
  }

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  if (!descMatch) {
    console.log('  ❌ Falta meta description');
    totalErrors++;
  } else {
    const descLen = descMatch[1].length;
    if (descLen < 50 || descLen > 165) {
      console.log(`  ⚠️  Meta description longitud inusual: ${descLen} caracteres (recomendado: 150-160)`);
      totalWarnings++;
    } else {
      console.log(`  ✅ Meta description presente (${descLen} caracteres)`);
    }
  }

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']*)["']/i);
  if (!canonicalMatch) {
    console.log('  ❌ Falta <link rel="canonical">');
    totalErrors++;
  } else if (ogUrlMatch && canonicalMatch[1] !== ogUrlMatch[1]) {
    console.log(`  ⚠️  og:url (${ogUrlMatch[1]}) no es idéntico al canonical (${canonicalMatch[1]})`);
    totalWarnings++;
  }

  // 5. Imágenes sin alt
  const imgTags = html.match(/<img[^>]+>/gi) || [];
  let imgsWithoutAlt = 0;
  for (const img of imgTags) {
    if (!img.includes('alt=')) imgsWithoutAlt++;
  }
  if (imgsWithoutAlt > 0) {
    console.log(`  ❌ Hay ${imgsWithoutAlt} imágenes sin atributo alt`);
    totalErrors += imgsWithoutAlt;
  } else if (imgTags.length > 0) {
    console.log(`  ✅ Todas las imágenes (${imgTags.length}) cuentan con atributo alt.`);
  }

  // 6. JSON-LD
  const jsonLdScripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  if (jsonLdScripts.length === 0) {
    console.log('  ⚠️  No se encontró bloque JSON-LD');
    totalWarnings++;
  } else {
    let validJsonLd = 0;
    for (const tag of jsonLdScripts) {
      const jsonContent = tag.replace(/<\/?script[^>]*>/gi, '').trim();
      try {
        JSON.parse(jsonContent);
        validJsonLd++;
      } catch (err) {
        console.log(`  ❌ Error de sintaxis en JSON-LD: ${err.message}`);
        totalErrors++;
      }
    }
    if (validJsonLd > 0) {
      console.log(`  ✅ JSON-LD estructurado válido (${validJsonLd} bloque(s)).`);
    }
  }

  console.log('');
}

console.log('--------------------------------------------------');
console.log(`Resumen auditoría: ${totalErrors} errores, ${totalWarnings} advertencias.`);
if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log('✨ Auditoría superada con éxito.');
  process.exit(0);
}

