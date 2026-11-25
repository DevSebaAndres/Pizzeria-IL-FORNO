# Checklist técnico de Google v2.0 (Search Essentials + Scrollytelling e Islas)

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Fuente: documentación de Google Search Central (Search Essentials) + guía técnica de Syntropy verificada contra fuentes, ampliada en v2.0 para cubrir escenas con `<canvas>`, GSAP e islas React.

## Contenido

1. Cómo funciona la Búsqueda frente a sitios con animación y JS
2. `<head>` obligatorio por página
3. Estructura semántica, escenas de scrollytelling e islas React
4. Rastreo e indexación
5. Mobile-first en experiencias inmersivas
6. Datos estructurados (`LocalBusiness`, `Organization`, `Service`, `Product`/`Offer`, `FAQPage`)
7. Imágenes, secuencias de frames y video
8. Multi-idioma
9. Políticas de spam a evitar
10. Search Console y pasos post-deploy

## 1. Cómo funciona la Búsqueda frente a sitios con animación y JS

Tres etapas: **rastreo** (Googlebot descarga HTML y recursos), **indexación** (procesa el HTML inicial y pone en cola el renderizado de JavaScript) y **servicio** (resultados estándar, AI Overviews y AI Mode).

Regla clave en v2.0: aunque Googlebot ejecuta JavaScript en una segunda fase, **todo el contenido textual, enlaces, encabezados y datos estructurados deben venir ya renderizados en el HTML inicial (SSG/SSR)**. Así:
- Google indexa en la primera pasada sin depender de la cola de renderizado.
- Los rastreadores de búsqueda con IA que no ejecutan JS (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, ◐) reciben el 100 % del contenido.
- El usuario con `prefers-reduced-motion: reduce` o red lenta lee la página completa desde el primer instante.

## 2. `<head>` obligatorio por página

```html
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion');</script>
  <title>[Servicio o Producto] | [Negocio]</title>          <!-- único, ≤ ~60 car., sin TODO_ -->
  <meta name="description" content="…">                     <!-- única, 140–160 car., propuesta + CTA -->
  <link rel="canonical" href="https://dominio.com/ruta/">   <!-- absoluta, autorreferente -->
  <meta property="og:title|description|type|url|image|locale"> <!-- og:url byte a byte igual al canonical -->
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script type="application/ld+json">…</script>
</head>
```

- Un solo `<title>` y una sola meta description por URL.
- `og:url` debe coincidir carácter por carácter con `canonical`.
- Prohibido dejar marcadores `TODO_` en `<title>`, `description`, `canonical` o JSON-LD.

## 3. Estructura semántica, escenas de scrollytelling e islas React

- **Headings:** exactamente un `<h1>` por página; `<h2>` y `<h3>` secuenciales (sin saltar de `<h1>` a `<h3>`). El `<h1>` nunca se oculta con `opacity: 0` ni se fragmenta en decenas de `<span>` con `SplitText`.
- **Landmarks:** exactamente 1 `<main>`, `<header>`, `<nav>` y `<footer>`. Cada `<section>` debe tener un heading (`<h2>`) o `aria-labelledby`.
- **Escenas de scrollytelling (`<canvas>` / secuencias de frames):**
  - Un `<canvas>` es opaco para los buscadores. Toda escena con `<canvas>` **debe** incluir dentro de su `<section>` una lista semántica `<ol class="seq-chapters">` con los capítulos narrativos (`<h3>` + `<p>`) en HTML real y el primer frame como `<img data-first-frame alt="…">`.
  - Si se usa `SplitText` en un `<h2>` o `<h3>` (nivel M2), el elemento padre debe conservar `aria-label` con la frase íntegra y los fragmentos internos deben llevar `aria-hidden="true"`.
- **Islas React (nivel M3 — Catálogo y Configurador):**
  - El catálogo de modelos/productos se pre-renderiza en HTML estático con `<article>`, `<h3>`, especificaciones en texto y enlaces `<a href="/modelos/...">` rastreables.
  - Prohibido usar `client:only` en bloques con contenido que deba posicionarse.
  - Los enlaces de navegación nunca son `<div onClick>` ni `<a href="#">`.

## 4. Rastreo e indexación

- `robots.txt` en la raíz con `Sitemap: https://dominio.com/sitemap-index.xml`.
- **No bloquear** `/_astro/`, `/frames/`, `/fonts/`, archivos `.js`, `.css` ni imágenes: Googlebot necesita acceder a ellos para renderizar y evaluar la experiencia móvil.
- Páginas 404 reales y redirecciones 301 limpias.

## 5. Mobile-first en experiencias inmersivas

Google indexa la versión móvil:
- Incluso cuando en móvil la secuencia de frames sea más corta (`data-count-mobile`) o estática, **el texto de todos los capítulos, las fichas del catálogo, los enlaces y el JSON-LD deben ser idénticos en móvil y en desktop**.
- Prohibido eliminar secciones de texto o capítulos en móvil con `display: none` sin equivalente visible.

## 6. Datos estructurados

- Un único bloque `<script type="application/ld+json">` con `@graph` en `<head>`, generado desde `src/data/business.ts`. Cero microdata (`itemscope`/`itemprop`) duplicado.
- **Según el modo del proyecto:**
  - **Modo `local`:** subtipo específico de `LocalBusiness` (`name` real sin keywords, `address`, `telephone`, `url`, `openingHoursSpecification`, `priceRange`, `geo` con **≥ 5 decimales**).
  - **Modo `general`:** `Organization`, `WebSite`, `WebPage`, `Service`.
  - **Modo `product` (catálogo / e-commerce / coleccionismo):** `Organization` + `Product` por cada modelo o producto destacado en la página (o en su ficha), con `name`, `description`, `image`, `sku` (si existe), `brand` y `offers` (`Offer` con `price` numérico real, `priceCurrency` en ISO 4217 como `ARS` o `USD`, `availability` como `https://schema.org/InStock` y `url`). Si un mismo modelo tiene dos variantes con precio real (por ejemplo, versión "El Lienzo" y versión "El Render"), `offers` puede ser un arreglo de `Offer` o un `AggregateOffer` con `lowPrice`, `highPrice` y `offerCount`.
- **Prohibido incluir `aggregateRating` o `review` autopromocionales** sobre el propio negocio.
- **FAQ (`FAQPage`):** los resultados enriquecidos de FAQ fueron eliminados por Google el 7 de mayo de 2026 (◐). Se mantiene `FAQPage` en el `@graph` por claridad semántica para otros motores y agentes, exigiendo paridad 1:1 con los `<details>` visibles. Validar sintaxis en **validator.schema.org** (no usar Rich Results Test para evaluar FAQ).

## 7. Imágenes, secuencias de frames y video

- `alt` descriptivo en toda imagen informativa: el primer frame del hero (`<img data-first-frame>`), las imágenes clave del modo sin movimiento (`.seq-stills`), las tarjetas del catálogo y la imagen base del configurador.
- El `<canvas>` de la secuencia lleva `aria-hidden="true"` porque la descripción ya vive en el `<img>` inicial y en los capítulos `<ol>`.
- `VideoObject` en JSON-LD: **no** incluirlo para un video mudo que solo actúa como fondo o scrub decorativo; usar `VideoObject` únicamente si el video es contenido principal reproducible por sí mismo con título, miniatura y fecha real.

## 8. Multi-idioma

- Un idioma por URL; `lang` en `<html>` y `og:locale` coherentes. `hreflang` bidireccional si el sitio se publica en varios idiomas.

## 9. Políticas de spam a evitar

- **Cero texto oculto engañoso:** el texto de los capítulos de scrollytelling debe ser visible para el usuario al recorrer la escena (no esconder párrafos fuera del viewport ni detrás del `<canvas>` con `z-index: -1`).
- Cero keyword stuffing en `name` o en descripciones del JSON-LD, cero páginas puerta por ciudad inventada y cero reseñas o precios ficticios.

## 10. Search Console y pasos post-deploy

1. Verificar propiedad de dominio en Search Console y enviar `sitemap-index.xml`.
2. Usar "Inspección de URLs → Probar URL publicada" y revisar el **HTML renderizado** y la captura móvil para confirmar que el H1, el primer frame y los capítulos se ven sin bloqueos.
3. Revisar los informes de Datos estructurados (`Product`, `LocalBusiness`) y Core Web Vitals.
4. Validar el `@graph` completo en `https://validator.schema.org/`.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación de esta guía | Estado | Fuente primaria / dónde confirmar |
|---|---|---|
| Para aparecer en AI Overviews / AI Mode no se requiere marcado especial; la página debe estar indexada y ser elegible para snippet | ✔ | https://developers.google.com/search/docs/appearance/ai-features |
| `LocalBusiness`: requeridos `name` y `address`; recomendados `geo` (≥ 5 decimales), `telephone`, `openingHoursSpecification` | ◐ / ○ | https://developers.google.com/search/docs/appearance/structured-data/local-business |
| `Product` y `Offer`: requeridos `name` y `offers` (`price`, `priceCurrency`, `availability`) para fragmentos de producto | ○ | https://developers.google.com/search/docs/appearance/structured-data/product |
| Resultados enriquecidos de FAQ eliminados el 7 de mayo de 2026 | ◐ | https://developers.google.com/search/updates (confirmado en fuentes secundarias el 2026-10-21) |
| Guía de SEO con JavaScript, mobile-first, canonical, robots y políticas de spam | ○ | https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics |

