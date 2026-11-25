# Checklist técnico de Google (destilado de la guía oficial)

> **Última verificación:** 2026-10-21 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Fuente: documentación de Google Search Central (Search Essentials) + guía técnica de Syntropy (sep. 2026) verificada contra fuentes. Se conserva lo aplicable a un sitio/landing nuevo; la guía original detalla además video schema, hreflang móvil/desktop, migraciones y Search Console, que se activan solo cuando el proyecto los necesita.

## Contenido

1. Cómo funciona la Búsqueda
2. `<head>` obligatorio
3. Estructura de contenido y enlaces
4. Rastreo e indexación
5. Mobile-first
6. Datos estructurados
7. Imágenes y video
8. Multi-idioma
9. Políticas de spam a evitar
10. Search Console y pasos post-deploy

## 1. Cómo funciona

Tres etapas: **rastreo** (Googlebot descubre y descarga), **indexación** (analiza y almacena) y **servicio** (devuelve resultados). Para ranking y funciones de IA de Google, la página tiene que estar rastreable, indexada y ofrecer una buena experiencia. Con HTML estático, las dos primeras etapas son triviales: por eso se recomienda generar el sitio como HTML estático (ver la skill `web-performance-design`).

## 2. `<head>` obligatorio por página

```html
<html lang="es-AR">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>[Servicio] en [Ciudad] | [Negocio]</title>          <!-- único, ≤ ~60 car., keyword natural -->
<meta name="description" content="…">                     <!-- único, ≤ ~155 car., propuesta + CTA -->
<link rel="canonical" href="https://dominio.com/ruta/">   <!-- absoluta, self-referencing -->
<meta property="og:title|description|type|url|image|locale">   <!-- og:url byte a byte igual al canonical -->
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">…</script>
```
- Un solo `<title>` y una sola meta description por URL; la descripción es sugerencia (Google puede reescribirla).
- No usar `noindex` en páginas que deben rankear; `noindex` solo en agradecimientos, privadas, etc.
- No usar `meta keywords`.
- Meta críticos (`charset`, `viewport`, `title`, `description`, canonical) antes de cualquier script. El JSON-LD va en `<head>` por convención de esta skill (Google lo acepta en cualquier parte del documento).
- Fechas (`datePublished`/`dateModified`) solo si son reales y visibles; coherentes entre texto visible, `<time datetime>` y JSON-LD.

## 3. Estructura de contenido y enlaces

- Un `<h1>`; `<h2>`/`<h3>` secuenciales y descriptivos, nunca elegidos por estilo visual (la jerarquía sirve a usuarios y a los motores: el árbol de headings es el esquema con el que se arman "pasajes recuperables").
- Landmarks: exactamente 1 `<main>` (contenido único de la página); 1 `<nav>` principal (+1 de breadcrumb como máximo); `<header>`/`<footer>`; `<article>` solo si el contenido es autocontenible (una landing); `<aside>` para contacto fuera del flujo principal. Cada `<section>` con su heading o `aria-labelledby`.
- Semántica nativa antes que ARIA: `<h2>` y no `<div role="heading">`; `<button>` y no `<div role="button">`. ARIA complementa (`aria-label` en navegaciones, `aria-labelledby` en secciones), nunca reemplaza.
- Contenido útil, centrado en personas, con experiencia demostrable (E-E-A-T): quién es el negocio, datos reales, pruebas.
- URLs cortas, legibles, minúsculas, con guiones: `/servicios/destapacion-de-canerias/`.
- **Enlaces rastreables:** `<a href="…">`. No `routerLink`, no `onclick`, no `<span href>`.
- **Anclas descriptivas y con contexto;** evitar "clic aquí"; no encadenar muchos enlaces pegados.
- Navegación clara y enlaces internos entre servicios, zonas y contacto. Breadcrumbs (`BreadcrumbList`) en sitios con jerarquía.
- Páginas 404 reales (`404.html` con status 404), redirecciones 301 al cambiar URLs.

## 4. Rastreo e indexación

- `robots.txt` en la raíz: controla rastreo; incluir `Sitemap:`. No es mecanismo de desindexación.
- `sitemap.xml` (con `@astrojs/sitemap`): solo URLs canónicas, indexables, 200.
- Canonical en todas las páginas para evitar duplicados (variantes `www`/no-`www`, `http`/`https`, con/sin barra final: elegir una y redirigir el resto con 301).
- HTTPS en todo el sitio.
- CSS, JS e imágenes accesibles para Googlebot.
- JavaScript: si algo depende de JS para mostrar contenido, Google lo renderiza con cola y retraso; por eso el contenido crítico va ya en el HTML.

## 5. Mobile-first

Google indexa y rankea según la versión móvil. Con un único sitio responsive esto se cumple si:
- El contenido, datos estructurados, metadatos y enlaces son los mismos en móvil y desktop.
- No se oculta contenido importante en móvil ni se bloquean recursos.
- El texto es legible sin zoom y los objetivos táctiles tienen tamaño suficiente.

## 6. Datos estructurados

- Formato recomendado: JSON-LD.
- Debe describir contenido visible; no bloquearlo con robots/`noindex`; no duplicarlo en la misma página.
- Solo propiedades y tipos soportados; incluir los campos requeridos de cada tipo. `LocalBusiness`: requeridos `name` y `address`; recomendados `geo` (≥ 5 decimales), `telephone`, `url`, `openingHoursSpecification`, `image`, `priceRange`.
- Mismo contenido y URLs en móvil y desktop.
- **FAQ:** los resultados enriquecidos de FAQ se eliminaron el 7 de mayo de 2026 (informe de Search Console y Rich Results Test para FAQ, retirados en junio; API, en agosto). `FAQPage` sigue siendo Schema.org válido y Google dice que no hace falta quitarlo, pero aquí no se justifica por Google. El FAQ visible sigue siendo contenido útil para personas.
- Validar con validator.schema.org (sintaxis) y Rich Results Test (tipos con resultado enriquecido vigente, no FAQ).
- Qué usa esta skill: `LocalBusiness`/`Organization`, `Service`, `FAQPage` (descriptivo), `WebSite`, `BreadcrumbList` (ver `aeo-geo.md`).
- `VideoObject`, `BroadcastEvent`, `Clip`, `SeekToAction`: solo si el sitio tiene video como contenido principal (necesita `name`, `thumbnailUrl`, `uploadDate`, y `contentUrl` o `embedUrl`); si no, omitir.

## 7. Imágenes y video

- `alt` descriptivo en toda imagen informativa (`alt=""` en decorativas), nombres de archivo con significado, dimensiones explícitas. Formato: **WebP o AVIF** (esta skill admite AVIF además del WebP que exige la guía técnica; SVG para logos/íconos).
- Imágenes con `<img>`/`<picture>` (no solo CSS `background`) si deben indexarse.
- Imagen de marca/logo con tamaño razonable y favicon accesible (Google lo muestra en resultados).
- Video: página dedicada o contexto claro, miniatura accesible, no esconder el contenido tras un clic que dependa de JS.

## 8. Multi-idioma

- Un idioma por URL; `hreflang` bidireccional (cada versión enlaza a todas, incluida ella misma) y `x-default` si aplica.
- Para sitios con un solo idioma, solo `lang` en `<html>` y `og:locale`.

## 9. Políticas de spam a evitar

Keyword stuffing, texto o enlaces ocultos, cloaking (contenido distinto para Googlebot y usuarios), compra/venta de enlaces, páginas puerta por ciudad, contenido autogenerado en masa sin valor, reseñas o calificaciones falsas, marcado estructurado engañoso.

## 10. Search Console y pasos post-deploy

1. Verificar el dominio en Search Console (propiedad de dominio por DNS) y enviar `sitemap-index.xml`.
2. Inspeccionar la URL principal ("Probar URL en vivo") y solicitar indexación.
3. Revisar informes de Indexación, Core Web Vitals y Mejoras (datos estructurados).
4. Alinear Google Business Profile (modo local): mismo NAP, categoría, horarios, enlace al sitio.
5. PageSpeed Insights sobre la URL pública (datos de laboratorio + campo si hay suficiente tráfico).
6. Revisar en 2–4 semanas: cobertura, consultas, CTR; ajustar títulos y descripciones.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria recuperada y leída el 2026-10-21 · ◐ confirmada el 2026-10-21 solo en fuentes secundarias o citada por ellas (revalidar en la primaria) · ○ conocimiento general o ruta conocida, **no recuperada** hoy (verificar antes de depender de ello).
Regla de uso: si la regla es ◐ u ○, o si la guía superó su plazo de revalidación, confirmarla en la fuente primaria antes de aplicarla (con búsqueda web, si está disponible) y, si no se puede, decir explícitamente "regla no reverificada hoy".

| Afirmación de esta guía | Estado | Fuente primaria / dónde confirmar |
|---|---|---|
| Para aparecer en AI Overviews / AI Mode no se requiere optimización específica; la página debe estar indexada y ser elegible para mostrarse con snippet; no hace falta schema especial | ✔ | https://developers.google.com/search/docs/appearance/ai-features |
| `LocalBusiness`: requeridos `name` y `address`; recomendado usar el subtipo más específico; `geo`, `telephone`, `openingHoursSpecification` recomendados | ◐ | https://developers.google.com/search/docs/appearance/structured-data/local-business (citada por varias fuentes; la página no se leyó entera hoy) |
| `geo` con al menos 5 decimales | ○ | La pide la documentación de `LocalBusiness` de Google (misma URL de arriba); confirmar el umbral vigente |
| Resultados enriquecidos de FAQ eliminados el 7 de mayo de 2026; informe de Search Console y Rich Results Test para FAQ retirados en junio; API en agosto | ◐ | Fuentes secundarias coinciden (p. ej. https://www.seostrategy.co.uk/learn/faq-schema-deprecation-2026-rich-result-vs-schema/). Confirmar en el registro de cambios oficial: https://developers.google.com/search/updates (ruta conocida, no recuperada hoy). Una fuente indica el 15 de junio como fecha de retiro de la documentación |
| Search Console incorporó un informe de rendimiento de IA generativa en junio de 2026 | ◐ | https://serpapi.com/blog/the-state-of-the-serp-in-the-age-of-ai/ (secundaria); confirmar en Search Console |
| Guía de inicio de SEO, canonical, robots, sitemap, mobile-first, políticas de spam | ○ | Documentación de Google Search Central: https://developers.google.com/search/docs (revisar la sección vigente de cada tema) |
| Accesibilidad: WCAG 2.2 AA | ○ | https://www.w3.org/TR/WCAG22/ |
