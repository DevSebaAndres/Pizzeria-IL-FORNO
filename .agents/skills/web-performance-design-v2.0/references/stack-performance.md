# Stack y performance v2 (objetivo: Lighthouse móvil ≥ 90, idealmente 95+, con scrollytelling)

**Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Base heredada de la v1 (verificada el 2026-10-21). Cambios de la v2: presupuesto de JS en dos niveles, JS permitido por niveles M0–M3, reglas de scroll, LCP con secuencia de frames, y diagnóstico de síntomas de scrollytelling.

## Contenido

1. Stack
2. Cómo se calcula el score (y qué no mide)
3. Presupuesto (crítico y diferido)
4. LCP · TBT/INP · CLS
5. Fuentes
6. Imágenes y video
7. JavaScript: niveles, islas y chunks
8. Terceros
9. Hosting, caché y cabeceras
10. Diagnóstico rápido

## 1. Stack

| Capa | Elección | Motivo |
|---|---|---|
| Framework | **Astro** (última estable; `npm create astro@latest`) por defecto. **Next.js** (SSG/ISR) si el sitio es sobre todo aplicación; ver `cinematic-fast-web-v2.0/references/matriz-stack.md` | HTML pre-renderizado, JS solo donde se pide |
| Estilos | **Tailwind CSS v4** con `@tailwindcss/vite`. No `@astrojs/tailwind` (obsoleto para v4); no el script CDN | Solo se emite el CSS usado; tokens en CSS |
| Movimiento M0 | CSS: transiciones, keyframes, `animation-timeline` como mejora progresiva | 0 KB de JS |
| Movimiento M1 | JS vanilla: `IntersectionObserver`, `requestAnimationFrame`, canvas | Unos pocos KB propios |
| Movimiento M2 | **GSAP** core + ScrollTrigger (+ SplitText), `import()` dinámico | Timelines, pin y scrub complejos; licencia gratuita (◐) |
| Interactividad M3 | **React** como isla (`client:visible` / `client:idle`) | Aísla el costo de hidratación |
| Íconos | SVG inline o importación de íconos sueltos. Sin fuentes de íconos remotas | Evitar peticiones y paquetes completos |
| Hosting | CDN estático (Cloudflare Pages, Netlify, Vercel) con Brotli y HTTP/2-3 | TTFB bajo = LCP bajo |

Verificar versiones al scaffoldear (`npm view astro version`, etc.); no fijarlas de memoria.

## 2. Cómo se calcula el score (y qué no mide)

Lighthouse (v10 a v12) pondera: **TBT 30 %**, **LCP 25 %**, **CLS 25 %**, FCP 10 %, Speed Index 10 %.

- El 55 % del score depende de lo que cuesta el JS (TBT) y de cuánto tarda el elemento más grande en pintarse (LCP).
- La emulación móvil de Lighthouse usa CPU lenta y red 4G simulada.
- Google *rankea* con datos de campo de Core Web Vitals (LCP, INP, CLS), no con el score de laboratorio. INP no se mide en laboratorio y TBT es su aproximación.
- **Lighthouse no mide la fluidez del scroll ni el uso de memoria.** Un sitio con scrollytelling puede sacar 95 y tener un scrub con tirones. Por eso la v2 exige `measure-scroll.mjs` y `check-frames.mjs`.

Umbrales "bueno" (percentil 75 en campo): LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1.

## 3. Presupuesto (por página; criterios propios de la skill, ajustables por proyecto)

| Recurso | Límite | Qué cuenta |
|---|---|---|
| HTML (gzip) | ≤ 30 KB | Documento |
| CSS total (gzip) | ≤ 30 KB | Todos los `.css`; inline el crítico si < ~10 KB |
| **JS crítico (gzip)** | **≤ 15 KB** | Todo script que el HTML carga o ejecuta al inicio: `<script src>`, `modulepreload`, scripts inline |
| **JS diferido (gzip)** | **≤ 120 KB** | Todo el resto de los `.js` del build: chunks de islas, GSAP, app. Se cargan tras el LCP o al entrar en viewport |
| Imagen LCP | ≤ 120 KB (AVIF/WebP), ≤ ~1600 px de ancho máximo | Primer frame / imagen hero |
| Peso hasta el LCP | ≤ 500 KB | Lo que se pide antes de que el LCP pinte |
| Secuencia de frames | Ver `references/frame-sequence.md` §3 y `check-frames.mjs` | Se carga **después** del LCP |
| Fuentes | ≤ 2 archivos WOFF2 críticos (~30–50 KB) | |
| Scripts, estilos y fuentes de otros orígenes en la carga inicial | 0 | Los de terceros bloquean el render |

Notas:
- La separación crítico/diferido la calcula `check-budget.mjs` leyendo los `<script>`, `modulepreload` e inline scripts del HTML (crítico) y sumando los demás `.js` (diferido). Es una aproximación estática: no ejecuta la página. Confirmar con el panel Network de Chrome en carga real.
- Los 120 KB diferidos están pensados como React (~45 KB, ◐) + GSAP y plugins (~30–40 KB, ◐) + código propio. Si el proyecto no usa React, el margen es mayor; no se gasta por defecto.
- Un chunk diferido grande que se descarga justo cuando empieza el scroll provoca tirones: precargarlo en idle (`requestIdleCallback`) antes de que la escena entre en viewport.

## 4. LCP · TBT/INP · CLS

### LCP
- Identificar el elemento LCP (hero `h1` o imagen) y diseñarlo para pintar en el primer frame.
- **Nunca** `opacity: 0` inicial, ni animación de entrada, ni `content-visibility: hidden` sobre él.
- Si es imagen: `<Image loading="eager" fetchpriority="high" />`, `sizes` exacto, sin lazy. Si fuera un fondo CSS, convertirlo a `<img>` o precargarla con `<link rel="preload" as="image" imagesrcset imagesizes fetchpriority="high">` (`heroPreload` en `BaseLayout.astro`).
- **Con secuencia de frames:** los candidatos a LCP son `<img>`, `<image>` en SVG, `<video>` (poster o primer frame), fondos con `url()` y bloques de texto; `<canvas>` no figura en esa lista (◐). Por tanto: el primer frame de la secuencia es un `<img>` real (el LCP); el `<canvas>` se monta encima **después** de que ese `<img>` pintó, y el H1 es texto real, no parte del canvas.
- No cargar los frames restantes hasta que el LCP haya pintado (evento `load` o `requestIdleCallback`); si compiten con el `<img>` LCP, lo retrasan.
- Overlay del hero con gradiente CSS, no con imagen extra.
- HTML pequeño y CSS crítico inline; sin `@import` de CSS; sin fuentes de terceros bloqueantes. Sitio estático en CDN; evitar redirecciones.

### TBT / INP
- Sin frameworks en el hilo principal para contenido estático.
- Dividir cualquier tarea > 50 ms; `defer` o `type="module"`; nada síncrono en `<head>` salvo el script `js-motion` de una línea.
- Handlers livianos.
- **Scroll:** los listeners de `scroll` están permitidos solo si cumplen **todo** esto: `{ passive: true }`; el trabajo ocurre dentro de `requestAnimationFrame` (el listener solo guarda el valor); no se lee layout (`getBoundingClientRect`, `offsetHeight`) dentro del bucle; y están activos solo mientras la sección es visible (un `IntersectionObserver` los registra y los quita). Si el efecto se puede hacer con `animation-timeline` (M0), se hace en CSS.
- Medir con el panel Performance de Chrome y con `measure-scroll.mjs` si el TBT o la fluidez empeoran.

### CLS
- Todo `<img>`/`<video>`/`<iframe>`/`<canvas>` con `width` y `height` (o `aspect-ratio`). El contenedor de una escena con canvas reserva su altura desde el HTML.
- Fuentes con `font-display: swap` y fallback ajustado con `size-adjust`, `ascent-override`, etc.
- Reservar espacio para banners, embeds y widgets.
- Hero con `min-height: 100svh` (no `100vh`). Con ScrollTrigger en móvil, evitar recalcular por los cambios de la barra del navegador (`ScrollTrigger.config({ ignoreMobileResize: true })`, ◐; ver `gsap-patterns.md`).
- Animar con `transform`, no con propiedades que reflowean.

## 5. Fuentes

- 2 familias máximo. Si hay diseño aprobado, las define el diseño; si no, una Sans variable + una Serif itálica. Tagline monoespaciado = pila del sistema.
- Autoalojar WOFF2 en `/public/fonts/` (Fontsource o google-webfonts-helper). Subset **latin** (cubre español); `latin-ext` solo si hace falta.
- Precargar **solo** el archivo de la fuente del H1.
- Si una variable pesa más que dos estáticas del mismo uso real, usar las estáticas.
- Tipografía fluida con `clamp()`.
- Íconos: SVG inline. **No** fuentes de íconos remotas (por ejemplo Material Symbols por `<link>`).

## 6. Imágenes y video

- Formatos: AVIF/WebP (nunca JPG/PNG para fotos; SVG para logos e íconos).
- `astro:assets` (`<Image>` / `<Picture>`): `formats={['avif','webp']}`, `widths` y `sizes` reales, `quality` 60–75.
- Todo lo que no es LCP: `loading="lazy"` y `decoding="async"`.
- Fondos de parallax: `<img>` en contenedor con `overflow:hidden`, no `background-attachment: fixed`.
- Fuentes remotas (Unsplash, imágenes generadas por herramientas): descargar a `src/assets/`, comprobar licencia, anotar crédito. No hotlinkear.
- **Secuencias de frames y video atado al scroll:** `references/frame-sequence.md`. El video de fondo decorativo sigue la regla v1: solo si aporta, `poster` optimizado, `preload="none"` o `metadata`, `muted playsinline`, cargar tras el LCP.
- Favicon: SVG + PNG 180 px. OG image 1200×630.

## 7. JavaScript: niveles, islas y chunks

- Por defecto, ningún `<script>` salvo el de `js-motion` (una línea) y los inline diminutos del sistema visual.
- **Subir de nivel solo con razón** (M0 → M1 → M2 → M3), y registrar la razón en el blueprint.
- **GSAP:** un único chunk compartido por todas las escenas (importar desde un solo módulo), cargado con `import()` al entrar la primera escena M2 en viewport o en idle. Registrar solo los plugins usados. Detalle en `gsap-patterns.md`.
- **Islas React:** `client:visible` para lo que está bajo el pliegue, `client:idle` para lo secundario; `client:load` casi nunca; `client:only` no se usa en contenido indexable. Detalle en `react-islands.md`.
- Un `<script>` de Astro se empaqueta y deduplica; mantenerlo sin dependencias salvo que sea un módulo de nivel declarado.
- Revisar `dist/_astro/*.js` tras cada build: `scripts/check-budget.mjs` separa crítico y diferido y falla si se supera.

## 8. Terceros

Los terceros suelen ser la razón nº 1 de un 60 en vez de un 95.
- GA4/GTM/Meta Pixel/chat: cargar tras la primera interacción (`pointerdown`, `scroll`, `keydown`) o en `requestIdleCallback`, con respaldo de ~4 s. Medir con y sin ellos.
- Considerar Partytown (Web Worker) o analítica liviana sin cookies.
- WhatsApp: enlace `https://wa.me/<tel>?text=<mensaje>`; no widgets flotantes con JS.
- Mapas: imagen estática con enlace, o `<iframe loading="lazy">` con `width/height`; nunca en el above-the-fold.
- Pasarelas de pago y reservas: cargar solo en la página o acción que las usa, no en la home.

## 9. Hosting, caché y cabeceras

- Assets con hash en `/_astro/`: `Cache-Control: public, max-age=31536000, immutable`.
- **Frames y fuentes:** nombres versionados (`/frames/v1/…`) con `immutable`; si se reemplazan, cambiar la versión. Ver `templates/_headers`.
- HTML: `public, max-age=0, must-revalidate`.
- HTTPS obligatorio, HSTS, Brotli. Los frames ya vienen comprimidos (AVIF/WebP): no esperar ganancia de Brotli sobre ellos.
- `<link rel="preconnect">` solo para un origen que realmente se use en el primer render; con recursos autoalojados, normalmente ninguno.
- En CDN/WAF, comprobar que no bloquea Googlebot ni crawlers de IA (`web-discoverability-v2.0`, `aeo-geo.md`).

## 10. Diagnóstico rápido

| Síntoma | Causa típica | Arreglo |
|---|---|---|
| LCP > 2.5 s | Imagen hero grande o lazy; frames compitiendo con el LCP; fuente bloqueante; H1 animado | AVIF + `fetchpriority`; diferir los frames hasta tras el LCP; preload de la fuente; quitar la animación del H1 |
| LCP alto con canvas en el hero | El LCP lo pinta tarde otro elemento porque el canvas no cuenta | Poner el primer frame como `<img>` real y el H1 como texto |
| TBT alto | JS de terceros, GSAP cargado al inicio, hidratación | Diferir con `import()`; bajar escenas de M2 a M1 o M0 |
| Scroll con tirones (aunque Lighthouse dé bien) | Trabajo pesado dentro del listener; lectura de layout en el bucle; frames decodificándose en el hilo principal; `backdrop-filter` sobre canvas | `measure-scroll.mjs`; mover a `rAF`; limitar la ventana de frames decodificados; quitar el desenfoque |
| Memoria alta o recarga de pestaña en móvil | Todos los frames decodificados en memoria | Ventana de frames (±N), menos frames o menor resolución en móvil, o video (`frame-sequence.md` §4) |
| Saltos al hacer scroll en móvil | Barra del navegador cambia el alto del viewport y se recalcula ScrollTrigger | `100svh` y `ignoreMobileResize` |
| CLS > 0.1 | Imágenes o canvas sin dimensiones; swap de fuentes; banners | `width/height`, contenedor con altura reservada, `size-adjust` |
| "Reduce unused JS" | Librería completa importada | Importar solo lo usado; registrar solo los plugins necesarios |
| "Avoid enormous network payloads" | Secuencia sin plan, imágenes sin optimizar | `check-frames.mjs`; menos frames; AVIF; carga progresiva |
| Score variable entre corridas | Ruido de laboratorio | `lhci` con 3+ corridas y mediana |

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria recuperada y leída · ◐ solo en fuentes secundarias o citada por ellas (revalidar en la primaria) · ○ conocimiento general, no recuperada hoy (verificar antes de depender de ello).
Regla de uso: si la regla es ◐ u ○, o si la guía superó su plazo, confirmarla en la fuente primaria antes de aplicarla y, si no se puede, decir "regla no reverificada hoy".

| Afirmación de esta guía | Estado | Fuente primaria / dónde confirmar |
|---|---|---|
| Pesos del score de Lighthouse: TBT 30 %, LCP 25 %, CLS 25 %, FCP 10 %, SI 10 % | ◐ | https://developer.chrome.com/docs/lighthouse/performance/performance-scoring |
| Umbrales CWV "bueno": LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (p75) | ○ | https://web.dev/articles/vitals |
| Candidatos a LCP: `<img>`, `<image>` en SVG, `<video>`, fondo con `url()`, bloques de texto; `<canvas>` no incluido | ◐ (resumen de búsqueda sobre web.dev, 2026-11-10) | https://web.dev/articles/lcp |
| GSAP y todos sus plugins son gratuitos, incluso uso comercial | ◐ (2026-11-10, secundarias) | https://gsap.com/pricing/ |
| Peso aproximado: GSAP core ~23–26 KB gzip, ScrollTrigger +~7–10 KB, plugins 5–12 KB c/u | ◐ (2026-11-10, secundarias) | https://bundlephobia.com/package/gsap — medir en el build real |
| `ScrollTrigger.config({ ignoreMobileResize: true })` evita recálculos por la barra del navegador móvil | ◐ (2026-11-10) | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ |
| Astro + Tailwind v4 con `@tailwindcss/vite` | ◐ | https://docs.astro.build y https://tailwindcss.com/docs |
| Peso de React + ReactDOM ~45 KB gzip | ○ | Medir con el build real (`npm view react-dom dist.unpackedSize` o bundle analyzer) |
| Presupuestos de esta guía (15 KB crítico, 120 KB diferido, 120 KB imagen LCP, 500 KB hasta LCP…) | ○ | Criterios propios de la skill, no normas oficiales: ajustar con medición del proyecto |
| Buenas prácticas de fuentes, imágenes, preload y caché | ○ | https://web.dev y documentación de Astro |

