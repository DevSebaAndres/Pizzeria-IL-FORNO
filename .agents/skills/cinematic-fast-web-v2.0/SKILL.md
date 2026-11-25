---
name: "cinematic-fast-web-v2.0"
description: Coordina la construcción de sitios y landings cinematográficos CON scrollytelling, secuencias de frames, animaciones avanzadas (GSAP/ScrollTrigger) e islas React/Tailwind, manteniendo Core Web Vitals en verde, PageSpeed móvil 90+ y estructura SEO/AEO/GEO (Google Search Essentials, ChatGPT Search, Perplexity, Gemini, AI Overviews, Claude). Usar cuando el pedido incluya scrollytelling, hero con secuencia de frames o video atado al scroll, animaciones ligadas al scroll, GSAP, React, canvas, "web inmersiva", "tipo Apple/Awwwards", configurador o showroom interactivo, o catálogo/producto con efectos cinematográficos, y además deba rankear y ser citable por IA. NO usar si el pedido es un sitio ultrarrápido sin animación avanzada ni JS propio (landing estática, "cero JS"): para eso está cinematic-fast-web (v1). Trabaja junto con web-performance-design-v2.0 y web-discoverability-v2.0.
---

# Cinematic Fast Web v2.0 — cine con presupuesto

Coordina las tres skills v2. Esta es la versión para proyectos donde **el efecto cinematográfico es parte del producto** y por eso se permite JavaScript, siempre ganándose su lugar con un presupuesto, un momento de carga y una medición.

| | `cinematic-fast-web` (v1) | `cinematic-fast-web-v2.0` (esta) |
|---|---|---|
| Objetivo | Sitio ultrarrápido, el espectáculo sale de CSS | Sitio cinematográfico con scrollytelling, optimizado |
| JS | 0 KB por defecto, GSAP/React como excepción | Permitido por niveles M0–M3, presupuesto crítico + diferido |
| Hero | Imagen estática, H1 protegido | Imagen/H1 como LCP + secuencia de frames o video atado al scroll |
| Stack | Astro + CSS | Astro + islas React (por defecto) o Next.js SSG, + GSAP si el nivel lo exige |
| Se mide | Lighthouse, presupuesto | Lighthouse + presupuesto + **fluidez del scroll** + peso de la secuencia |

Las tres skills v2 (`cinematic-fast-web-v2.0`, `web-performance-design-v2.0`, `web-discoverability-v2.0`) **se usan juntas y se versionan juntas**. No mezclar una skill v2 con una v1 en el mismo proyecto: los números de presupuesto y las reglas de movimiento difieren.

## Principio rector

Cuando dos objetivos chocan, gana el de la izquierda:

**1. Contenido indexable en el HTML inicial → 2. Performance medida (Core Web Vitals, presupuesto y fluidez de scroll) → 3. Espectáculo.**

Cambio respecto a la v1: el espectáculo **ya no se limita a CSS**. Puede usar JS, canvas, GSAP y React, pero cada pieza declara su nivel de movimiento, su costo y su alternativa sin movimiento. Si un efecto cuesta más de lo que el presupuesto permite, se simplifica el efecto, nunca el presupuesto.

## Niveles de movimiento (vocabulario común de las tres skills)

Usar siempre el **nivel más bajo** que logre el efecto pedido. Los números y patrones de cada nivel viven en `web-performance-design-v2.0`; aquí solo la regla de elección.

| Nivel | Qué es | Cuándo |
|---|---|---|
| **M0** | CSS puro: transiciones, keyframes, `animation-timeline` | Revelados, parallax simple, sticky stack, hover |
| **M1** | JS vanilla diminuto: `IntersectionObserver`, `requestAnimationFrame` | Estados por scroll, secuencia de frames sencilla, contadores |
| **M2** | GSAP core + ScrollTrigger, `import()` dinámico tras el LCP | Timelines encadenados, pin, scrub complejo, SplitText |
| **M3** | Isla React (`client:visible` / `client:idle`) | Estado complejo: configurador, filtros, carrito |

Regla de escalado: subir de nivel solo si el nivel inferior no puede lograr el efecto, y anotar la razón en el blueprint.

## Cuándo usar

Proyectos web premium, de marca, producto o catálogo que deban (a) impactar con scrollytelling y animación, (b) cargar rápido y pasar Core Web Vitals, (c) indexar bien en Google y (d) ser legibles y citables por motores de IA. Si el usuario solo quiere copy local sin construir el sitio, usar `web-discoverability-v2.0` por sí sola.

## Flujo de trabajo

### Fase 0 — Clasificar el proyecto
Decidir y registrar tres cosas (se confirman en la entrevista):
- **Modo de contenido:** local (zona física, NAP), general (marca, SaaS, profesional) o **producto** (catálogo, fichas, compra o descarga; activa `Product`/`Offer`).
- **Intensidad de movimiento objetivo:** sutil, media o inmersiva (define el nivel máximo permitido).
- **Stack:** aplicar `references/matriz-stack.md`.

### Fase 1 — Entrevista (OBLIGATORIA, un solo mensaje)
No escribir código antes de las respuestas. Presentar el bloque de `references/entrevista-v2.md` tal cual. Si ya hay diseño aprobado (Stitch, Figma) o un `DESIGN.md`, **ese diseño manda sobre las preguntas de paleta y tipografía**; no repetirlas.

### Fase 2 — Blueprint y confirmación
Mostrar una tabla-resumen con: `title` (≤ 60 car.), meta description (≤ 155), H1, frase de entidad AEO, tipos de schema, URLs objetivo y además lo propio de v2:
1. **Stack elegido** y por qué (matriz).
2. **Mapa de movimiento:** cada sección con su nivel M0–M3 y la razón.
3. **Elemento LCP** de la página y confirmación de que no depende de JS.
4. **Plan de medios** de cada secuencia (frames o video): cantidad, resolución por breakpoint, formato, peso total, estrategia de carga.
5. **Versión móvil y `prefers-reduced-motion`** de cada escena (obligatoria, ver regla 5).
6. **Presupuesto crítico y diferido** (valores en `web-performance-design-v2.0`).
Preguntar si se construye. **Nunca inventar datos del negocio**: dejar `TODO_` visible y pedirlos.

### Fase 3 — Construcción
Leer en este orden y aplicar:
1. `web-performance-design-v2.0/references/stack-performance.md` — stack, presupuesto crítico/diferido, fuentes, imágenes, terceros.
2. `web-performance-design-v2.0/references/scrollytelling.md`, `frame-sequence.md`, `gsap-patterns.md`, `react-islands.md`, `motion-a11y.md` — según los niveles del blueprint.
3. `web-performance-design-v2.0/references/sistema-visual.md` y `ux-ui.md` — secciones y UX.
4. `web-discoverability-v2.0/references/aeo-geo.md` y `google-seo.md` — copy, schema, FAQ, rastreo.
5. Plantillas: `templates/` de esta skill (layout y config) más las de las skills hermanas.

Fuente única de verdad: `src/data/business.ts` (NAP, servicios, productos, zonas, FAQ, enlaces). De ahí salen el HTML visible, el JSON-LD y los enlaces. En modo producto, también el catálogo.

### Fase 4 — Verificación (no se entrega sin esto)
```bash
npm run build
node .agents/skills/cinematic-fast-web-v2.0/scripts/verify-all.mjs --dist dist --frames public/frames --url http://localhost:4321 --pairs "#texto/#fondo,#texto2/#acento"
npx lhci autorun --config=lighthouserc.json     # Lighthouse móvil, 3 corridas
```
`verify-all.mjs` ejecuta los scripts de las skills hermanas y devuelve, para cada paso, **OK, FALLA o NO EJECUTADO**. Un script ausente o un parámetro faltante nunca cuenta como aprobado. No imprime puntajes de Lighthouse: esos se miden con `lhci`.

Criterio: Performance ≥ 90 móvil (objetivo 95+), Accessibility/Best Practices/SEO ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms, y **scroll sin Long Animation Frames sostenidos** en la medición de `measure-scroll.mjs` con CPU ralentizada. Si no se cumple: diagnosticar el audit responsable, simplificar el efecto o bajar de nivel, repetir. Si no hay red o Chrome, decirlo explícitamente y entregar los comandos pendientes; no afirmar scores no medidos.

### Fase 5 — Entrega
1. Resumen de lo construido y árbol de archivos.
2. Resultados medidos (o qué falta medir).
3. Pasos manuales post-deploy: Search Console (dominio y sitemap), validator.schema.org, Google Business Profile con NAP idéntico (modo local), PageSpeed Insights sobre la URL real y revisión en un móvil de gama media real.
4. Ofrecer ajustes (movimiento, copy, secciones).

## Reglas innegociables

1. **Contenido crítico en el HTML inicial.** Texto, H1, FAQ, enlaces, fichas de producto y JSON-LD llegan pre-renderizados (SSG o SSR). Ningún texto crítico se genera solo en el cliente. React se permite, pero el HTML que entrega al servidor ya contiene el contenido.
2. **JS con presupuesto de dos niveles:** crítico (lo que corre antes del LCP, muy pequeño) y diferido (lo que se carga tras el LCP o al entrar en viewport). Valores en `web-performance-design-v2.0`.
3. **El LCP nunca depende de JS ni arranca invisible.** El LCP es un `<img>` (o el H1) pintado en el primer frame. Un `<canvas>` no es candidato a LCP (◐); la secuencia de frames se monta **encima** del `<img>` inicial, después del LCP.
4. **Estados ocultos solo bajo `html.js-motion`.** Un script inline de una línea (en `BaseLayout.astro`) añade esa clase solo si hay JS y no hay `prefers-reduced-motion: reduce`. Sin esa clase, todo el contenido se ve completo. Nada de `opacity: 0` en CSS global.
5. **Cada escena tiene versión sin movimiento y versión móvil**, definidas en el blueprint: con `reduced-motion`, la secuencia se reemplaza por 3–5 imágenes clave con su texto en altura normal; en móvil, una secuencia reducida o estática según el plan de medios.
6. **Los medios pesados tienen plan y se miden:** toda secuencia de frames o video pasa por `check-frames.mjs`. Prohibido subir cientos de frames a resolución completa sin estrategia de carga.
7. **Animar `transform` y `opacity`.** Las excepciones (`backdrop-filter` en un elemento pequeño y estático) están en `web-performance-design-v2.0`.
8. **Máximo 2 familias tipográficas** autoalojadas en WOFF2 (1 precargada), íconos como SVG inline (no fuentes de íconos remotas), sin CDN de Tailwind ni fuentes remotas. El HTML exportado de Stitch u otras herramientas es referencia visual, nunca código de producción.
9. **Terceros fuera del camino crítico** (GA4, Pixel, GTM, chat, pasarela): tras interacción o en idle, medidos con y sin ellos.
10. **JSON-LD** una sola vez, en `<head>`, generado desde `business.ts` e idéntico al contenido visible; sin `aggregateRating` propio; FAQ 1:1 con el JSON-LD; `robots.txt`, `sitemap.xml` y canonical siempre.
11. **Accesibilidad medida:** contraste AA verificado con `contrast.mjs`, un solo `<main>`, un solo H1, controles nativos, foco visible. El scroll nunca se secuestra sin salida: teclado, anclas y `reduced-motion` siguen funcionando.
12. **Medir antes de afirmar.** Prohibido declarar scores, fluidez o cumplimiento sin la salida real de los scripts. La fluidez de scroll (PRODUCT_GOAL pide 60 FPS) se mide con `measure-scroll.mjs`; Lighthouse no la cubre.
13. **No prometer ranking ni citación.** Google indica que no hay marcado ni archivo especial que garantice aparecer en sus funciones de IA; se maximiza elegibilidad, claridad y velocidad.

## Contrato con las skills hermanas

Para que las tres funcionen sin duplicados ni contradicciones, **cada tema tiene un único dueño**. Las otras skills lo enlazan y no lo copian.

| Tema | Dueña |
|---|---|
| Entrevista, blueprint, fases, stack, niveles M0–M3, registro de conflictos | `cinematic-fast-web-v2.0` |
| Presupuesto crítico/diferido, Core Web Vitals, scrollytelling, secuencias de frames, GSAP, islas React, accesibilidad de movimiento, sistema visual, UX/UI, hosting | `web-performance-design-v2.0` |
| Copy AEO, schema (incl. `Product`/`Offer`), FAQ, robots/sitemap/`llms.txt`, Google Search Essentials, contenido del scrollytelling en el HTML | `web-discoverability-v2.0` |

Archivos que cada hermana debe aportar (los referencia esta skill y `verify-all.mjs`):
- `web-performance-design-v2.0`: `references/` `stack-performance.md`, `scrollytelling.md`, `frame-sequence.md`, `gsap-patterns.md`, `react-islands.md`, `motion-a11y.md`, `sistema-visual.md`, `ux-ui.md`; `scripts/` `check-budget.mjs`, `check-frames.mjs`, `measure-scroll.mjs`, `contrast.mjs`, `check-freshness.mjs`; plantillas de CSS, cabeceras y Lighthouse.
- `web-discoverability-v2.0`: `references/` `google-seo.md`, `aeo-geo.md`, `intake-datos.md`; `scripts/` `check-seo.mjs`, `check-freshness.mjs`; plantillas `business`, `schema`, `FAQ`, `robots`, `llms`.

## Protocolo de vigencia (las reglas cambian)

Cada guía lleva fecha de última verificación, plazo de revalidación y tabla de fuentes con estado (✔ fuente primaria leída, ◐ solo secundarias, ○ no recuperada).
1. Al empezar, ejecutar `node scripts/check-freshness.mjs .` en cada skill v2. Si algo está vencido, revalidar antes de aplicarlo.
2. Una regla ◐ u ○ sensible al tiempo se confirma en la fuente primaria si hay búsqueda web; si no, decir "regla no reverificada hoy".
3. Tras revalidar, actualizar fecha y estado; no cambiar la fecha sin haber confirmado.

**Reglas especialmente volátiles aquí:** licencia y peso de GSAP y sus plugins, qué elementos cuentan como candidatos a LCP, soporte de `animation-timeline`, pesos de Lighthouse, versiones de Astro, React y Tailwind.

## Archivos de esta skill

- `references/entrevista-v2.md` — bloque de preguntas de la Fase 1 (incluye narrativa, medios, movimiento e interactividad).
- `references/matriz-stack.md` — elección de stack y de nivel de movimiento.
- `references/conflictos-v2.md` — qué cambió respecto de la v1 y por qué, con dueño de cada resolución.
- `templates/BaseLayout.astro` — `<head>` completo con `js-motion`, preload del hero y JSON-LD.
- `templates/astro.config.mjs` — Astro estático + Tailwind v4 + React + sitemap.
- `scripts/verify-all.mjs` — ejecuta los scripts de las skills hermanas y resume OK/FALLA/NO EJECUTADO.

