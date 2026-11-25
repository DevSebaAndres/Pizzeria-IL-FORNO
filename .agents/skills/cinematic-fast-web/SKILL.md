---
name: "cinematic-fast-web"
description: Construye sitios y landing pages visualmente cinematográficas (tipografía editorial, animaciones de scroll, sticky stacks, dashboards animados) que además cumplen Google Search Essentials, la estructura AEO/GEO para buscadores con IA (ChatGPT Search, Perplexity, Gemini, AI Overviews, Claude) y alcanzan 90+ en Lighthouse/PageSpeed móvil, usando Astro + Tailwind v4 + CSS moderno (cero JS por defecto). Usar SIEMPRE que el usuario pida una landing, web o sitio para un negocio (local o no) que deba verse premium Y posicionar o ser citado por IA, o mencione PageSpeed, Core Web Vitals, LCP, SEO técnico, AEO, GEO, JSON-LD, "web bonita y rápida", "pixel perfect" o "landing cinematográfica", aunque no nombre esta skill.
---

# Cinematic Fast Web — belleza + performance + SEO/AEO/GEO

Fusiona tres fuentes:

| Fuente | Qué aporta | Qué se cambia |
|---|---|---|
| Guía oficial de Google (Search Essentials) | Reglas de rastreo, indexación, snippets, datos estructurados, mobile-first, spam | Nada: es la base legal del sitio |
| `local-seo-aeo-landing-page-writer` + `geo-optimization` | Frase de entidad AEO, arco narrativo de 11 pasos, cobertura geográfica, FAQ semántica, JSON-LD, robots para crawlers de IA, HTML estático | Se elimina el microdata duplicado; se corrige la lista de crawlers; se generaliza a negocios no locales |
| Guía técnica "SEO Semántico & AEO" (Syntropy, sep. 2026) | Jerarquía HTML5 estricta, JSON-LD sin keyword stuffing, FAQ idéntica al JSON-LD, contraste AA, taxonomía de bots, `llms.txt`, checklist pre-deploy | Se verificó contra fuentes y se corrigieron datos erróneos (fechas de FAQ, contrastes, atribución del +40 %); ver `references/conflictos.md` filas 16–24 |
| `landing-cinematica` | Entrevista de 8 preguntas, sistema visual, secciones (hero, dashboard, manifiesto, sticky stack, planes, footer) | Se reemplaza el stack React SPA + GSAP + 4 fuentes de Google + imágenes hotlinkeadas por Astro + CSS-first (ver `references/conflictos.md`) |

## Principio rector

Cuando dos objetivos chocan, gana el de la izquierda:

**1. Contenido indexable en el HTML inicial → 2. Performance (Lighthouse móvil ≥ 90, Core Web Vitals en verde) → 3. Espectáculo visual.**

El espectáculo se logra con composición, tipografía, color, SVG y CSS (`transform`/`opacity`), no con JavaScript. Si un efecto cuesta más de lo que el presupuesto permite, se simplifica el efecto, nunca el presupuesto.

## Cuándo usar

Cualquier pedido de web/landing premium para un negocio, marca, profesional o servicio que deba (a) verse espectacular, (b) cargar rápido, (c) indexar bien en Google y (d) ser legible y citable por motores de IA. Si el usuario solo quiere copy local sin construir el sitio, usar `references/aeo-geo.md` por sí solo.

## Flujo de trabajo

### Fase 0 — Clasificar el proyecto
Decidir el **modo** (se confirma en la entrevista):
- **Modo local**: negocio con zona de servicio física (oficios, clínicas, estudios, gastronomía, estudios contables…). Activa NAP, cobertura geográfica, `LocalBusiness`, WhatsApp/llamada.
- **Modo general**: marca, SaaS, e-commerce chico, profesional online. Activa `Organization`/`WebSite`/`Service`/`Product` y CTA propio.

### Fase 1 — Entrevista (OBLIGATORIA, un solo mensaje)
No escribir código antes de tener respuestas. Presentar el bloque de `references/entrevista.md` tal cual (8 bloques creativos + 2 bloques de datos reales para SEO/AEO). Si el usuario ya respondió parte, no repetir esas preguntas.

### Fase 2 — Blueprint y confirmación
Completar internamente todas las variables; lo no especificado (paleta, imágenes, SVGs) se decide con coherencia de marca. Mostrar una tabla-resumen que incluya, además de lo visual: `title` (≤ 60 car.), meta description (≤ 155 car.), H1, frase de entidad AEO, tipos de schema, URLs objetivo y el **presupuesto de performance**. Preguntar si se construye. **Nunca inventar datos del negocio**: teléfono, dirección, años de trayectoria, calificaciones, garantías, tiempos de respuesta. Si faltan, dejar `TODO_` visible en el blueprint y pedirlos.

### Fase 3 — Construcción
Leer en este orden y aplicar:
1. `references/stack-performance.md` — stack, presupuesto, fuentes, imágenes, JS, terceros, hosting.
2. `references/sistema-visual.md` — cómo se construye cada sección cinematográfica de forma performante.
3. `references/aeo-geo.md` — copy, arco narrativo, FAQ, JSON-LD, robots/llms.
4. `references/google-seo.md` — checklist técnico de Google (head, canonical, sitemap, enlaces, mobile-first).
5. Copiar y adaptar `templates/` (layout, schema, FAQ, config, robots, headers, lighthouserc).

Fuente única de verdad: un archivo `src/data/business.ts` con NAP, servicios, zonas, FAQ y enlaces. De ahí salen el HTML visible, el JSON-LD y el link de WhatsApp. Así NAP y FAQ son idénticos en todos lados por construcción.

### Fase 4 — Verificación (no se entrega sin esto)
```bash
npm run build
node scripts/check-seo.mjs dist          # landmarks, headings, JSON-LD, FAQ 1:1, geo, og:url, imágenes, peso de JS
node scripts/contrast.mjs "#texto/#fondo" "#texto2/#acento" …   # cada par de la paleta, AA (4.5:1 / 3:1)
npx astro preview &                       # servir dist
npx lhci autorun --config=lighthouserc.json   # Lighthouse móvil, 3 corridas
```
Criterio: Performance ≥ 90 móvil (objetivo 95+), Accessibility/Best Practices/SEO ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms. Si no se cumple: diagnosticar el audit que falla, simplificar el efecto o recurso responsable, repetir. Si no hay red o Chrome para correr Lighthouse, decirlo explícitamente y entregar igual el resultado de `check-seo.mjs` y los comandos pendientes; no afirmar scores no medidos.

### Fase 5 — Entrega
1. Resumen de lo construido y árbol de archivos.
2. Resultados medidos (o qué falta medir).
3. Pasos manuales post-deploy: Search Console (verificar dominio, enviar sitemap), Rich Results Test / validator.schema.org, Google Business Profile con NAP idéntico, PageSpeed Insights sobre la URL real.
4. Ofrecer ajustes (colores, copy, secciones, más páginas).

## Reglas innegociables

1. **HTML estático/SSG.** Todo texto crítico, FAQ y enlaces están en el HTML inicial. Sin SPA, sin renderizado cliente para contenido.
2. **JS por defecto = 0 KB.** Interactividad solo vía islas (`client:visible`/`client:idle`) o scripts inline diminutos. Presupuesto total de JS inicial ≤ 70 KB gzip.
3. **El elemento LCP nunca arranca invisible ni animado.** El H1 o la imagen hero se pintan en el primer frame.
4. **Máximo 2 familias tipográficas** (Sans + Serif itálica), autoalojadas en WOFF2 subset, 1 sola precargada. El tagline "tipo código" usa stack monoespaciado del sistema.
5. **Imágenes locales y optimizadas** (AVIF/WebP, `srcset`, `width`/`height`). Prohibido hotlinkear Unsplash en producción: se descargan en build.
6. **Animar solo `transform` y `opacity`.** Sin `filter: blur` animado, sin animar `width/height/top/left`. Respetar `prefers-reduced-motion`.
7. **Un H1, jerarquía secuencial H2/H3, enlaces `<a href>` rastreables, `alt` descriptivo, `lang` correcto.**
8. **JSON-LD en `<head>`, una sola vez, generado desde `business.ts`, idéntico al contenido visible.** Sin microdata duplicado. Sin `aggregateRating` ni reseñas autopromocionales. `name` = nombre real sin keywords; `geo` con ≥ 5 decimales.
9. **FAQ de 5 a 8 preguntas con `<details>/<summary>` nativos**, texto de la respuesta idéntico al `acceptedAnswer.text`. Google eliminó los resultados enriquecidos de FAQ (7 mayo 2026): se mantiene por utilidad y por otros motores, sin prometer efecto.
10. **robots.txt + sitemap.xml + canonical** siempre; no bloquear CSS/JS/imágenes; verificar que el CDN/WAF no bloquee crawlers de IA.
11. **Terceros (GA4, Pixel, GTM, chat, widgets) fuera del camino crítico**: se cargan tras interacción o en idle, y se miden en Lighthouse antes de aceptarlos.
12. **Accesibilidad medida:** contraste AA verificado con `contrast.mjs` en cada par de colores, un solo `<main>`, `<section>` con heading, `<button>`/`<label>` nativos, imágenes WebP/AVIF con `alt`.
13. **No prometer ranking ni citación.** Google indica que no hay marcado ni archivo especial que garantice aparecer en funciones de IA; esta skill maximiza elegibilidad, claridad y velocidad.

## Archivos de la skill

- `references/entrevista.md` — bloque de preguntas de la Fase 1.
- `references/stack-performance.md` — decisiones técnicas y presupuesto.
- `references/sistema-visual.md` — secciones cinematográficas en CSS-first.
- `references/aeo-geo.md` — arco narrativo, FAQ, schema, crawlers de IA.
- `references/google-seo.md` — destilado de la guía oficial de Google.
- `references/conflictos.md` — qué se cambió de cada skill origen y por qué.
- `templates/` — `astro.config.mjs`, `BaseLayout.astro`, `FAQ.astro`, `schema.ts`, `business.example.ts`, `global.css`, `robots.txt`, `llms.txt` (opcional), `_headers`, `lighthouserc.json`.
- `scripts/check-seo.mjs` — auditor estático del build (sin dependencias).
- `scripts/contrast.mjs` — calculadora de contraste WCAG para la paleta.
