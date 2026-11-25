---
name: "web-discoverability-v2.0"
description: SEO técnico, AEO y GEO para sitios cinematográficos con scrollytelling, secuencias de frames en canvas, GSAP e islas React, garantizando que sean rastreables e indexables por Google (Search Essentials) y citables por buscadores con IA (ChatGPT Search, Perplexity, Gemini, AI Overviews, Claude). Cubre modos local, general y producto/catálogo, estructura semántica del scrollytelling en HTML estático, JSON-LD (@graph con LocalBusiness/Organization, Service, Product/Offer, FAQPage), FAQ 1:1, frase de entidad AEO, arco narrativo de 11 pasos adaptado a escenas, robots.txt para crawlers de IA, sitemap, llms.txt y auditoría profunda del build. Usar al escribir contenido, estructurar marcado o auditar la indexabilidad de un sitio con animaciones avanzadas o catálogo interactivo. NO usar para sitios estáticos sin scrollytelling ni JS propio (ver web-discoverability v1). No cubre diseño visual ni presupuesto de FPS/JS (ver web-performance-design-v2.0).
---

# Web Discoverability v2.0 — SEO + AEO + GEO en sitios con scrollytelling e islas

Hace que un sitio cinematográfico sea **rastreable, indexable, comprensible y citable** aunque utilice `<canvas>`, secuencias de frames, GSAP o islas React. Los rastreadores de IA medidos no ejecutan JavaScript y Google lo ejecuta con cola: por eso, en la v2.0 **toda escena visual o isla interactiva tiene su contraparte semántica completa en el HTML inicial**.

Esta skill es **dueña** de: copy AEO/GEO, frase de entidad, arco narrativo (modos `local`, `general` y `product`), texto indexable del scrollytelling y del catálogo en el HTML, JSON-LD (`@graph`), FAQ 1:1, `robots.txt`, `sitemap.xml`, `llms.txt` y `scripts/check-seo.mjs`.

## Alcance

| Esta skill cubre | Otra skill cubre |
|---|---|
| Google Search Essentials, rastreo, indexación, canonical, mobile-first, spam | Presupuesto crítico/diferido, LCP/CLS/TBT, fuentes, imágenes, caché → `web-performance-design-v2.0` |
| HTML semántico en escenas de scrollytelling (`<ol>` de capítulos) y catálogo SSR | Motores de secuencias de frames, GSAP, islas React y fluidez de scroll → `web-performance-design-v2.0` |
| Frase de entidad AEO, arco de 11 pasos (local, general y producto), cobertura | Entrevista completa, blueprint, matriz de stack y niveles M0–M3 → `cinematic-fast-web-v2.0` |
| JSON-LD (`LocalBusiness`/`Organization`, `Service`, `Product`/`Offer`, `FAQPage`), `robots.txt`, `llms.txt` | |

## Cuándo usar

- Construir la capa de contenido, copy y datos estructurados de un sitio cinematográfico nuevo (coordinada por `cinematic-fast-web-v2.0`).
- **Modo Producto / Catálogo:** estructurar catálogos de modelos o productos personalizables (como *Paint the Classics*, con variantes "El Lienzo" / "El Render") para que cada ficha, especificación y oferta sea indexable sin depender de que un bot interactúe con el configurador React.
- **Auditar o corregir un sitio interactivo existente** donde el contenido quedó atrapado dentro de un `<canvas>`, animaciones GSAP con `opacity: 0` o componentes de cliente.

## Modos de trabajo

### 1. Modo Construir (local · general · product)
1. **Datos reales:** reunir la información con `references/intake-datos.md` (o desde la entrevista de `cinematic-fast-web-v2.0`). Prohibido inventar NAP, precios, especificaciones mecánicas, años, garantías o calificaciones; lo pendiente se marca con `TODO_` y se consulta.
2. **Fuente única (`src/data/business.ts`):** usar `templates/business.example.ts`. De ahí salen el HTML visible, los capítulos del scrollytelling, el catálogo de productos/servicios, el JSON-LD y la FAQ.
3. **Redactar con `references/aeo-geo.md`:**
   - Frase de entidad AEO (25–40 palabras, factual, sin superlativos) visible debajo del H1.
   - Capítulos del scrollytelling redactados como pasajes autocontenibles dentro de `<ol class="seq-chapters">`.
   - Arco de 11 pasos adaptado al modo (`local`, `general` o `product`).
   - FAQ de 5 a 8 preguntas con respuestas `< 50` palabras, autocontenibles.
4. **Marcar con `templates/schema.ts` y `templates/FAQ.astro`:**
   - Un único `@graph` en `<head>` (incluyendo `Product` y `Offer`/`AggregateOffer` en modo `product`).
   - `<details><summary>` nativos con texto de respuesta **idéntico** carácter por carácter a `acceptedAnswer.text`.
5. **Rastreo:** `public/robots.txt`, sitemap (`@astrojs/sitemap`), canonical autorreferente y `public/llms.txt` opcional.
6. **Verificar:** `node scripts/check-seo.mjs dist` hasta obtener 0 errores y 0 marcadores `TODO_`.

### 2. Modo Auditar (sitio existente)
1. Descargar el HTML crudo sin ejecutar JS (`curl -sL`). Si el H1, los capítulos del scrollytelling o las fichas de productos no están en ese HTML, o están ocultos con `opacity: 0` inline/CSS global, es un hallazgo **Crítico**.
2. Recorrer `references/google-seo.md` y validar JSON-LD, paridad FAQ, `robots.txt` y acceso de bots de IA (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`).
3. Entregar informe priorizado (**Crítico**, **Alto**, **Medio**, **Bajo**) con la corrección exacta.

## Reglas innegociables

1. **Todo texto crítico y narrativo vive en el HTML inicial.** Un `<canvas>` o `<video>` de scrollytelling nunca contiene texto único: la narrativa va en elementos HTML semánticos (`<h1>`, `<h2>`, `<ol class="seq-chapters">`, `<p>`) superpuestos al escenario.
2. **Prohibido ocultar texto para motores sin JS.** Ningún titular, capítulo ni ficha puede tener `opacity: 0` o `visibility: hidden` en CSS global ni inline; los estados iniciales de animación viven exclusivamente bajo `html.js-motion` (`web-performance-design-v2.0`). El `<h1>` nunca se anima ni se parte con `SplitText`.
3. **Islas React (M3) con contenido pre-renderizado.** El catálogo de productos se renderiza en HTML estático con enlaces `<a href>` reales. El configurador interactivo (`client:visible`) pre-renderiza su estado inicial en el build y nunca usa `client:only` para contenido indexable.
4. **Jerarquía semántica estricta:** exactamente un `<h1>`, headings secuenciales (`h1` → `h2` → `h3`), exactamente un `<main>`, cada `<section>` con heading o `aria-labelledby`, `lang` válido, e imágenes con `alt`, `width` y `height` (incluyendo el `<img data-first-frame>` del scrollytelling y las imágenes `.seq-stills`).
5. **JSON-LD único en `<head>` generado desde `business.ts`:**
   - Paridad 1:1 con el contenido visible; cero microdata (`itemscope`) duplicado.
   - `name` real sin keyword stuffing; `geo` con **≥ 5 decimales** cuando aplique; prohibido incluir `aggregateRating` o `review` autopromocionales.
   - En modo `product`: cada `Product` incluye `name`, `description`, `image` y `offers` (`Offer` con `price`, `priceCurrency` ISO 4217 y `availability` de Schema.org) solo con precios reales.
6. **FAQ de 5 a 8 preguntas con `<details>/<summary>` nativos:** respuesta `< 50` palabras, autocontenible e idéntica a `acceptedAnswer.text`. (Google eliminó los resultados enriquecidos de FAQ el 7 de mayo de 2026: se incluye por utilidad para usuarios y lectura de motores de IA, sin prometer rich results en Google).
7. **Rastreo abierto para recursos y bots:** no bloquear `/_astro/`, `/frames/`, CSS, JS ni imágenes en `robots.txt`. Verificar que el CDN/WAF no bloquee con 403 a los rastreadores de búsqueda de IA.
8. **Cero datos inventados y cero promesas de ranking:** ningún archivo publicado puede contener marcadores `TODO_`. Se garantiza elegibilidad técnica y semántica, nunca una posición o citación.

## Protocolo de vigencia (las reglas cambian)

Cada guía de `references/` incluye su fecha de última verificación, plazo de revalidación y tabla de fuentes con estado (✔ primaria leída, ◐ solo secundarias, ○ no recuperada).
1. Al iniciar, ejecutar `node scripts/check-freshness.mjs .`. Si alguna guía está vencida, revalidarla antes de aplicarla.
2. Si una regla sensible al tiempo está marcada ◐ u ○, confirmarla en la fuente primaria con búsqueda web o advertir "regla no reverificada hoy".
3. Actualizar la fecha solo tras verificar la fuente primaria.

## Templates y destinos

| Template | Ruta en el proyecto | Función |
|---|---|---|
| `templates/business.example.ts` | `src/data/business.ts` | Fuente única: modos `local`/`general`/`product`, capítulos, servicios, productos y FAQ |
| `templates/schema.ts` | `src/lib/schema.ts` | Genera el `@graph` JSON-LD (incluye `Product`/`Offer` en modo producto) |
| `templates/FAQ.astro` | `src/components/FAQ.astro` | FAQ visible 1:1 con `FAQPage` del JSON-LD |
| `templates/robots.txt` | `public/robots.txt` | Permisos de rastreo para buscadores y agentes de IA |
| `templates/llms.txt` | `public/llms.txt` | Índice opcional en Markdown de secciones, productos y servicios |

## Archivos de la skill

- `references/google-seo.md` — checklist de Google Search Essentials adaptado a scrollytelling, islas y modo producto.
- `references/aeo-geo.md` — frase de entidad, arco narrativo en 3 modos, indexabilidad de escenas, FAQ, JSON-LD y crawlers de IA.
- `references/intake-datos.md` — relevamiento de datos reales (incluye catálogo/productos y capítulos narrativos).
- `templates/` — `business.example.ts`, `schema.ts`, `FAQ.astro`, `robots.txt`, `llms.txt`.
- `scripts/check-seo.mjs` — auditor profundo del build (landmarks, jerarquía de headings, H1 protegido, escenas con canvas, paridad FAQ 1:1, `geo` ≥ 5 decimales, `Product`/`Offer`, ausencia de `aggregateRating` y de `TODO_`).
- `scripts/check-freshness.mjs` — verificador de vigencia temporal de las guías.

