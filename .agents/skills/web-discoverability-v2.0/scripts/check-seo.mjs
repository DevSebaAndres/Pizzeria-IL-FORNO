#!/usr/bin/env node

/**
 * check-seo.mjs — web-discoverability-v2.0
 *
 * Auditor estático profundo de SEO técnico, AEO y GEO sobre el build (sin dependencias externas).
 *
 * QUÉ VERIFICA
 *   1. Metadatos de <head>: <html lang>, <title>, <meta name="description">, <link rel="canonical"> absoluto
 *      y coincidencia exacta byte a byte entre `og:url` y `canonical`.
 *   2. Landmarks y semántica: exactamente 1 <main>, presencia de <header>/<nav> y <footer>, y que cada
 *      <section> tenga un heading (<h1..h6>) o `aria-labelledby`/`aria-label`.
 *   3. Jerarquía de headings: exactamente 1 <h1> con texto real, secuencia sin saltos (p. ej. h1 → h3),
 *      y que el <h1> no tenga clases de ocultación/animación (.fade-up, .reveal, data-gsap-init, opacity:0).
 *   4. Scrollytelling e islas (v2.0): toda <section> con <canvas> o [data-frame-seq] debe incluir un <img>
 *      (primer frame LCP) y texto narrativo real en el HTML.
 *   5. Imágenes y enlaces: atributo `alt` y dimensiones `width`/`height` en todo <img>; enlaces <a> con `href`
 *      real (no `#` ni `javascript:`).
 *   6. Cero microdata duplicado (`itemscope`/`itemtype`) y cero marcadores `TODO_` o `TODO-DOMINIO` sin reemplazar.
 *   7. JSON-LD (@graph):
 *      - Bloque único en la página, sintaxis JSON válida y `@id` sin duplicados.
 *      - Prohibición de `aggregateRating` o `review` autopromocionales en el negocio/organización.
 *      - `geo` (`GeoCoordinates`) con ≥ 5 decimales en `latitude` y `longitude`.
 *      - Nodos `Product` con `name`, `description`, `image` y `offers` válidos (`price`, `priceCurrency`, `availability`).
 *      - Paridad 1:1 exacta entre las preguntas/respuestas visibles (<details>/<summary> + <p>) y `FAQPage.mainEntity`
 *        (`name` y `acceptedAnswer.text`), cantidad de preguntas (5 a 8) y longitud de respuesta (< 50 palabras).
 *
 * QUÉ NO VERIFICA
 *   - No ejecuta JavaScript ni valida contra el esquema completo de Schema.org en red (usar validator.schema.org).
 *   - No comprueba respuestas HTTP del CDN/WAF ante bots de IA (probar con `curl -A "OAI-SearchBot" -I <url>`).
 *
 * USO
 *   node scripts/check-seo.mjs <directorio-dist|archivo.html>
 * CÓDIGOS DE SALIDA
 *   0 sin errores · 1 uno o más errores · 2 entrada inválida o sin archivos HTML
 */

import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(target)) {
  console.error(`ERROR: no existe la ruta a auditar: ${target}\nEjecutar primero "npm run build" o indicar un archivo .html.`);
  process.exit(2);
}

const htmlFiles = [];
const isDir = fs.statSync(target).isDirectory();
if (isDir) {
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  };
  walk(target);
} else if (target.endsWith('.html')) {
  htmlFiles.push(target);
}

if (htmlFiles.length === 0) {
  console.error(`ERROR: no se encontraron archivos .html en ${target}`);
  process.exit(2);
}

const stripTags = (s) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[1] ?? m[2] ?? '') : null;
};
const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

console.log(`\n🔍 Auditoría SEO / AEO / GEO v2.0 — ${target}`);
console.log(`Archivos HTML a evaluar: ${htmlFiles.length}\n`);

let totalErrors = 0;
let totalWarnings = 0;

for (const file of htmlFiles) {
  const rel = isDir ? path.relative(target, file) : path.basename(file);
  const html = fs.readFileSync(file, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
  const errs = [];
  const warns = [];

  // 0. Marcadores TODO_ olvidados
  const todoMatch = html.match(/\bTODO[_-][A-Z0-9_-]*/i);
  if (todoMatch) errs.push(`Marcador sin reemplazar en el HTML final: "${todoMatch[0]}"`);

  // 1. <html lang>
  const htmlTag = (html.match(/<html\b[^>]*>/i) || [])[0] || '';
  const lang = attr(htmlTag, 'lang');
  if (!lang || !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(lang)) {
    errs.push('Falta atributo `lang` válido en <html> (ej. lang="es-AR")');
  }

  // 2. <title>, <meta description>, canonical y og:url
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? stripTags(titleMatch[1]) : '';
  if (!titleText) errs.push('Falta <title> con texto');
  else if (titleText.length > 65) warns.push(`<title> de ${titleText.length} caracteres (recomendado ≤ 60–65)`);

  let descText = null;
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if ((attr(m[0], 'name') || '').toLowerCase() === 'description') descText = attr(m[0], 'content');
  }
  if (!descText) errs.push('Falta <meta name="description">');
  else if (descText.length < 50 || descText.length > 165) {
    warns.push(`Meta description de ${descText.length} caracteres (recomendado 140–160)`);
  }

  let canonical = null;
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    if ((attr(m[0], 'rel') || '').toLowerCase() === 'canonical') canonical = attr(m[0], 'href');
  }
  let ogUrl = null;
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if ((attr(m[0], 'property') || '').toLowerCase() === 'og:url') ogUrl = attr(m[0], 'content');
  }
  if (!canonical || !/^https?:\/\//i.test(canonical)) {
    errs.push('Falta <link rel="canonical"> con URL absoluta (https://…)');
  } else if (!ogUrl) {
    errs.push('Falta <meta property="og:url">');
  } else if (ogUrl !== canonical) {
    errs.push(`og:url ("${ogUrl}") no es idéntico byte a byte al canonical ("${canonical}")`);
  }

  // 3. Landmarks
  const mains = html.match(/<main\b[^>]*>/gi) || [];
  if (mains.length !== 1) errs.push(`Se requiere exactamente 1 <main> (encontrados: ${mains.length})`);
  if (!/<(header|nav)\b[^>]*>/i.test(html)) warns.push('No se encontró <header> ni <nav>');
  if (!/<footer\b[^>]*>/i.test(html)) warns.push('No se encontró <footer>');

  // Secciones con heading o aria-labelledby/aria-label y escenas con canvas
  for (const secMatch of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)) {
    const secAttrs = secMatch[1];
    const secBody = secMatch[2];
    const secId = attr(`<section ${secAttrs}>`, 'id') || '(sin id)';
    const hasHeading = /<h[1-6]\b[^>]*>/i.test(secBody);
    const hasAria = attr(`<section ${secAttrs}>`, 'aria-labelledby') || attr(`<section ${secAttrs}>`, 'aria-label');
    if (!hasHeading && !hasAria) {
      errs.push(`<section id="${secId}"> no tiene heading (<h2..h6>) ni aria-labelledby`);
    }
    if (/<canvas\b/i.test(secBody) || /\bdata-frame-seq\b/i.test(secAttrs)) {
      if (!/<img\b/i.test(secBody)) {
        errs.push(`Escena con <canvas> en <section id="${secId}"> sin <img> inicial (LCP / alternativa sin JS)`);
      }
      if (stripTags(secBody).length < 40) {
        errs.push(`Escena con <canvas> en <section id="${secId}"> sin texto narrativo indexable en el HTML`);
      }
    }
  }

  // 4. Headings: 1 H1, orden secuencial, H1 protegido
  const headings = [...html.matchAll(/<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    level: Number(m[1][1]),
    attrs: m[2],
    text: stripTags(m[3]),
  }));
  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length !== 1) {
    errs.push(`Debe existir exactamente 1 <h1> (encontrados: ${h1s.length})`);
  } else {
    const h1 = h1s[0];
    if (!h1.text) errs.push('El <h1> está vacío');
    if (/\b(fade-up|reveal)\b/.test(h1.attrs) || /\bdata-gsap-init\b/.test(h1.attrs) || /opacity\s*:\s*0\b/i.test(h1.attrs)) {
      errs.push('El <h1> tiene atributos/clases de ocultación o animación inicial (viola regla de LCP e indexabilidad)');
    }
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      errs.push(`Salto en jerarquía de headings: de <h${headings[i - 1].level}> a <h${headings[i].level}> ("${headings[i].text.slice(0, 40)}")`);
    }
  }

  // 5. Imágenes y enlaces
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  let noAlt = 0;
  let noDim = 0;
  for (const tag of imgs) {
    if (attr(tag, 'alt') === null) noAlt++;
    if (attr(tag, 'width') === null || attr(tag, 'height') === null) noDim++;
  }
  if (noAlt > 0) errs.push(`${noAlt} imagen(es) <img> sin atributo alt`);
  if (noDim > 0) warns.push(`${noDim} imagen(es) <img> sin atributos width/height explícitos (riesgo de CLS)`);

  let badLinks = 0;
  for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], 'href');
    if (!href || href === '#' || /^javascript:/i.test(href)) badLinks++;
  }
  if (badLinks > 0) errs.push(`${badLinks} enlace(s) <a> sin href rastreable (vacío, "#" o "javascript:")`);

  // 6. Microdata duplicado
  if (/\bitemscope\b|\bitemtype\s*=/i.test(html)) {
    errs.push('Se detectó microdata (itemscope/itemtype) en el HTML: usar exclusivamente JSON-LD en <head>');
  }

  // 7. JSON-LD y paridad FAQ 1:1
  const ldBlocks = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (ldBlocks.length === 0) {
    errs.push('No se encontró bloque <script type="application/ld+json">');
  } else if (ldBlocks.length > 1) {
    errs.push(`Se encontraron ${ldBlocks.length} bloques JSON-LD (debe existir 1 único bloque con @graph en <head>)`);
  } else {
    const rawLd = ldBlocks[0][1].trim();
    try {
      const parsed = JSON.parse(rawLd);
      const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
      const ids = new Set();
      for (const n of nodes) {
        if (n && typeof n === 'object' && n['@id']) {
          if (ids.has(n['@id'])) errs.push(`@id duplicado en JSON-LD: ${n['@id']}`);
          ids.add(n['@id']);
        }
        if (n && (n.aggregateRating || n.review)) {
          errs.push(`Prohibido incluir aggregateRating o review autopromocional en JSON-LD (nodo ${n['@type'] || ''})`);
        }
        if (n && n.geo && typeof n.geo === 'object') {
          const latMatch = rawLd.match(/"latitude"\s*:\s*(-?\d+(?:\.(\d+))?)/);
          const lngMatch = rawLd.match(/"longitude"\s*:\s*(-?\d+(?:\.(\d+))?)/);
          const latDec = latMatch && latMatch[2] ? latMatch[2].length : 0;
          const lngDec = lngMatch && lngMatch[2] ? lngMatch[2].length : 0;
          if (latDec < 5 || lngDec < 5) {
            errs.push(`Coordenadas geo con menos de 5 decimales (lat: ${latDec}, lng: ${lngDec})`);
          }
        }
        if (n && n['@type'] === 'Product') {
          if (!n.name || !n.description || !n.image) {
            errs.push(`Nodo Product incompleto (requiere name, description e image): ${n['@id'] || n.name || '(sin nombre)'}`);
          }
          if (n.offers) {
            const offerList = Array.isArray(n.offers) ? n.offers : [n.offers];
            for (const off of offerList) {
              if (off.price === undefined || off.price === null || off.price === '' || !off.priceCurrency || !off.availability) {
                errs.push(`Offer incompleto en Product "${n.name}": requiere price numérico, priceCurrency y availability`);
              }
            }
          }
        }
      }

      const faqNode = nodes.find((n) => n && n['@type'] === 'FAQPage');
      if (faqNode && Array.isArray(faqNode.mainEntity)) {
        const ldFaqs = faqNode.mainEntity.map((q) => ({
          q: String(q.name ?? '').trim(),
          a: String(q.acceptedAnswer?.text ?? '').trim(),
        }));
        if (ldFaqs.length < 5 || ldFaqs.length > 8) {
          warns.push(`FAQPage tiene ${ldFaqs.length} preguntas (la guía establece entre 5 y 8)`);
        }
        for (const item of ldFaqs) {
          const wc = wordCount(item.a);
          if (wc >= 50) errs.push(`Respuesta de FAQ supera las 50 palabras (${wc} palabras): "${item.q.slice(0, 40)}…"`);
        }

        const htmlDetails = [...html.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>\s*<p\b[^>]*>([\s\S]*?)<\/p>\s*<\/details>/gi)].map((m) => ({
          q: stripTags(m[1]),
          a: stripTags(m[2]),
        }));
        if (htmlDetails.length !== ldFaqs.length) {
          errs.push(`Paridad FAQ rota: ${htmlDetails.length} <details> en HTML vs ${ldFaqs.length} preguntas en FAQPage JSON-LD`);
        } else {
          for (let i = 0; i < ldFaqs.length; i++) {
            if (htmlDetails[i].q !== ldFaqs[i].q || htmlDetails[i].a !== ldFaqs[i].a) {
              errs.push(`Paridad FAQ 1:1 rota en la pregunta #${i + 1} ("${ldFaqs[i].q.slice(0, 35)}"): el texto visible no es idéntico al JSON-LD`);
            }
          }
        }
      }
    } catch (e) {
      errs.push(`JSON-LD con sintaxis inválida: ${e.message}`);
    }
  }

  totalErrors += errs.length;
  totalWarnings += warns.length;

  console.log(`📄 ${rel}: ${errs.length === 0 ? '✅ OK' : `❌ ${errs.length} error(es)`}${warns.length ? ` · ⚠️ ${warns.length} aviso(s)` : ''}`);
  for (const e of errs) console.log(`   ❌ ${e}`);
  for (const w of warns) console.log(`   ⚠️  ${w}`);
}

if (isDir) {
  if (!fs.existsSync(path.join(target, 'robots.txt'))) {
    console.log('⚠️  Build: no se encontró robots.txt en la raíz del directorio de salida');
    totalWarnings++;
  }
  const hasSitemap = fs.existsSync(path.join(target, 'sitemap-index.xml'))
    || fs.existsSync(path.join(target, 'sitemap.xml'))
    || fs.existsSync(path.join(target, 'sitemap-0.xml'));
  if (!hasSitemap) {
    console.log('⚠️  Build: no se encontró sitemap-index.xml / sitemap.xml en el directorio de salida');
    totalWarnings++;
  }
}

console.log(`\nResumen check-seo v2.0: ${totalErrors} error(es) · ${totalWarnings} aviso(s).`);
if (totalErrors > 0) {
  console.log('RESULTADO: FALLA. Corregir los errores antes de declarar cumplimiento.');
  process.exit(1);
}
console.log('RESULTADO: OK.');
process.exit(0);

