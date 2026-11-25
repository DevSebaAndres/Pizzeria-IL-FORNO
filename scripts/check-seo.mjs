#!/usr/bin/env node
// scripts/check-seo.mjs — auditor estático de SEO/AEO/GEO sobre un build estático (sin dependencias).
// El presupuesto de performance (JS/CSS/imágenes/fuentes) lo audita check-budget.mjs (skill web-performance-design).
// Uso: node scripts/check-seo.mjs [carpeta-dist=dist]
// Sale con código 1 si hay errores. No reemplaza a Lighthouse ni al Rich Results Test.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
if (!existsSync(dist)) { console.error(`No existe ${dist}. Ejecuta "npm run build" primero.`); process.exit(2); }

const errors = [], warns = [];
const err = (p, m) => errors.push(`✖ ${p}: ${m}`);
const warn = (p, m) => warns.push(`⚠ ${p}: ${m}`);

const walk = (d) => readdirSync(d).flatMap((n) => {
  const f = join(d, n);
  return statSync(f).isDirectory() ? walk(f) : [f];
});
const files = walk(dist);
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const norm = (s) => decode(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const stripBlocks = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

// ---------- páginas HTML ----------
const pages = files.filter((f) => extname(f) === '.html');
for (const f of pages) {
  const p = relative(dist, f);
  if (/(^|\/)404\.html$/.test(p)) continue;
  const html = readFileSync(f, 'utf8');

  if (!/<html[^>]*\slang=["'][a-zA-Z-]+["']/.test(html)) err(p, 'falta <html lang>');
  if (!/<meta[^>]+name=["']viewport["']/.test(html)) err(p, 'falta meta viewport');
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (!title) err(p, 'falta <title>'); else if (decode(title).trim().length > 65) warn(p, `title de ${decode(title).trim().length} caracteres (> ~60)`);
  const desc = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1];
  if (!desc) err(p, 'falta meta description'); else if (decode(desc).length > 160) warn(p, `description de ${decode(desc).length} caracteres (> ~155)`);
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
  if (!canon) err(p, 'falta canonical'); else if (!/^https:\/\//.test(canon)) err(p, `canonical no absoluta/HTTPS: ${canon}`);
  if (/TODO/.test(html)) err(p, 'quedan marcadores TODO sin reemplazar');
  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']*)["']/i)?.[1];
  if (ogUrl && canon && ogUrl !== canon) err(p, `og:url (${ogUrl}) ≠ canonical (${canon}): deben ser idénticos`);

  // Semántica de landmarks (guía técnica Sep 2026)
  const mains = (html.match(/<main[\s>]/gi) ?? []).length;
  if (mains !== 1) err(p, `se esperaba 1 <main> y hay ${mains}`);
  const navs = (html.match(/<nav[\s>]/gi) ?? []).length;
  if (navs > 2) warn(p, `${navs} <nav> (máx. recomendado: 2, principal + breadcrumb)`);
  for (const m of html.matchAll(/<section\b([^>]*)>/gi)) {
    if (!/\saria-label(ledby)?=/.test(m[1])) { warn(p, '<section> sin aria-labelledby/aria-label (cada sección necesita heading asociado)'); break; }
  }
  if (/role=["']button["']/.test(html)) warn(p, 'role="button" detectado: usar <button> nativo');
  const inputs = [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)].filter((m) => !/type=["'](hidden|submit|button)["']/i.test(m[2]));
  if (inputs.length && !/<label\b/i.test(html) && !inputs.every((m) => /aria-label=/.test(m[2]))) warn(p, 'campos de formulario sin <label> asociado');

  // Jerarquía de headings
  const heads = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => +m[1]);
  const h1 = heads.filter((h) => h === 1).length;
  if (h1 !== 1) err(p, `se esperaba 1 <h1> y hay ${h1}`);
  for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) { warn(p, `salto de heading h${heads[i - 1]} → h${heads[i]}`); break; }

  // Imágenes
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const t = m[0];
    if (!/\salt=/.test(t)) err(p, `<img> sin alt: ${t.slice(0, 80)}…`);
  }

  // Enlaces
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    if (!/\shref=/.test(m[1])) warn(p, `<a> sin href (no rastreable): ${m[0].slice(0, 70)}…`);
    if (/^\s*(click here|haz clic aqu[ií]|aqu[ií]|ver m[aá]s|leer m[aá]s)\s*$/i.test(norm(m[2]))) warn(p, `ancla genérica: "${norm(m[2])}"`);
  }

  // Microdata duplicando JSON-LD
  if (/\sitemscope\b/.test(html)) warn(p, 'microdata (itemscope) presente: usar solo JSON-LD para evitar duplicación');

  // JSON-LD
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  if (!blocks.length) err(p, 'sin JSON-LD');
  const nodes = [];
  blocks.forEach((b, i) => {
    try {
      const j = JSON.parse(b);
      nodes.push(...(j['@graph'] ?? (Array.isArray(j) ? j : [j])));
    } catch (e) { err(p, `JSON-LD #${i + 1} inválido: ${e.message}`); }
  });
  if (blocks.length > 1) warn(p, `${blocks.length} bloques JSON-LD: preferible un único @graph`);
  const ids = nodes.map((n) => n['@id']).filter(Boolean);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) err(p, `@id duplicados en JSON-LD: ${[...new Set(dup)].join(', ')}`);
  const types = nodes.flatMap((n) => [].concat(n['@type'] ?? []));
  for (const n of nodes) {
    if (n.aggregateRating || n.review) err(p, `JSON-LD de "${n.name ?? n['@type']}" incluye aggregateRating/review propios (no permitido como autopromoción)`);
  }
  for (const b of blocks) {
    for (const m of b.matchAll(/"(latitude|longitude)"\s*:\s*"?(-?\d+(?:\.(\d+))?)"?/g)) {
      const dec = (m[3] ?? '').length;
      if (dec < 4) err(p, `geo.${m[1]} con ${dec} decimales: usar coordenadas reales (≥ 5 decimales)`);
      else if (dec < 5) warn(p, `geo.${m[1]} con ${dec} decimales: Google pide ≥ 5 (un 0 final se omite al serializar; confirmar el valor)`);
    }
  }
  const biz = nodes.find((n) => n.telephone || n.address);
  if (biz?.name && /(barat[oa]|24\s?hs?|cerca de m[ií]|econ[oó]mic[oa]|urgencias?\b)/i.test(biz.name)) warn(p, `name del negocio con keywords ("${biz.name}"): usar el nombre real`);
  if (biz && !biz.address) warn(p, 'LocalBusiness sin address (requerido por Google junto con name)');
  if (!biz) warn(p, 'sin entidad con telephone/address (NAP) en JSON-LD');

  // FAQ 1:1
  const faq = nodes.find((n) => [].concat(n['@type']).includes('FAQPage'));
  const visible = norm(stripBlocks(html));
  if (faq) {
    const qs = faq.mainEntity ?? [];
    const summaries = [...html.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>/gi)].map((m) => norm(m[1]));
    if (qs.length < 5) warn(p, `FAQ con ${qs.length} preguntas (recomendado: 5 a 8)`);
    if (qs.length > 8) warn(p, `FAQ con ${qs.length} preguntas (recomendado: 5 a 8; calidad > cantidad)`);
    for (const q of qs) {
      const qn = norm(q.name);
      if (!summaries.includes(qn)) err(p, `pregunta del JSON-LD sin <summary> visible idéntico: "${q.name}"`);
      const an = norm(q.acceptedAnswer?.text ?? '');
      if (!an || !visible.includes(an)) err(p, `respuesta del JSON-LD no coincide con el texto visible: "${q.name}"`);
      const words = an.split(' ').filter(Boolean).length;
      if (words >= 50) warn(p, `respuesta FAQ de ${words} palabras (< 50 recomendado): "${q.name}"`);
    }
    if (summaries.length !== qs.length) warn(p, `FAQ visible (${summaries.length} <summary>) ≠ JSON-LD (${qs.length} preguntas)`);
    if (!/<details/.test(html)) warn(p, 'FAQ sin <details>/<summary> nativos');
  }
  console.log(`· ${p}  [tipos JSON-LD: ${[...new Set(types)].join(', ') || '—'}]`);
}
if (!pages.length) err('dist', 'no se encontraron páginas HTML');

// ---------- robots / sitemap ----------
const robotsPath = join(dist, 'robots.txt');
if (!existsSync(robotsPath)) err('robots.txt', 'no existe');
else {
  const r = readFileSync(robotsPath, 'utf8');
  if (!/^Sitemap:/im.test(r)) err('robots.txt', 'falta línea Sitemap:');
  if (/User-agent:\s*\*\s*[\r\n]+(?:(?!User-agent)[^\r\n]*[\r\n]+)*?Disallow:\s*\/\s*$/im.test(r)) err('robots.txt', 'Disallow: / para todos los agentes');
  if (/TODO/.test(r)) err('robots.txt', 'contiene TODO');
  for (const bot of ['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot', 'Applebot', 'Googlebot']) {
    if (!new RegExp(`User-agent:\\s*${bot}`, 'i').test(r)) warn('robots.txt', `no menciona ${bot} (válido si "User-agent: *" permite todo; confirmar a propósito)`);
  }
}
if (!files.some((f) => /sitemap(-index|-0)?\.xml$/.test(f))) err('sitemap', 'no se generó sitemap*.xml');

// ---------- informe ----------
console.log(`\npáginas auditadas: ${pages.length}`);
warns.forEach((w) => console.log(w));
errors.forEach((e) => console.log(e));
console.log(`\n${errors.length} errores, ${warns.length} avisos.`);
process.exit(errors.length ? 1 : 0);
