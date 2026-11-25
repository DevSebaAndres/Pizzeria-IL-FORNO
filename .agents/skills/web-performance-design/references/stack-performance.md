# Stack y performance (objetivo: Lighthouse móvil ≥ 90, idealmente 95+)

> **Última verificación:** 2026-10-21 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

## Contenido

1. Stack
2. Cómo se calcula el score (y qué priorizar)
3. Presupuesto
4. LCP · TBT · CLS: reglas concretas
5. Fuentes
6. Imágenes y video
7. JavaScript e islas
8. Terceros (pixels, analytics, chat)
9. Hosting, caché y cabeceras
10. Diagnóstico rápido

## 1. Stack

| Capa | Elección | Motivo |
|---|---|---|
| Framework | **Astro** (última estable; correr `npm create astro@latest`) | Salida HTML estática, 0 JS por defecto, islas opcionales, optimización de imágenes integrada |
| Estilos | **Tailwind CSS v4** vía plugin `@tailwindcss/vite` (CSS-first con `@theme`). No usar `@astrojs/tailwind` (obsoleto para v4) | Solo se emite el CSS usado; tokens de marca en CSS |
| Animación | **CSS** (transiciones, keyframes, scroll-driven animations como mejora progresiva) + `IntersectionObserver` inline | Sin costo de bundle ni de main thread |
| Iconos | SVG inline o `astro-icon`/Lucide importando solo los íconos usados | Evitar paquetes completos |
| Interactividad compleja | Isla (`client:visible`/`client:idle`) en Preact o React, solo si hace falta (form multi-paso, calculadora) | Aísla el costo de hidratación |
| GSAP | **Excepción**, no default. Solo si un efecto es inviable en CSS; `import()` dinámico al entrar en viewport, solo core + ScrollTrigger | Protege TBT |
| Hosting | CDN estático (Cloudflare Pages, Netlify, Vercel) con Brotli y HTTP/2-3 | TTFB bajo = LCP bajo |

Verificar versiones al scaffoldear (`npm create astro@latest`, `npm view astro version`); no fijar versiones de memoria.

## 2. Cómo se calcula el score

Lighthouse (v10 a v12) pondera: **TBT 30 %**, **LCP 25 %**, **CLS 25 %**, FCP 10 %, Speed Index 10 %. Eso significa:

- 55 % del score depende de lo que cuesta JS (TBT) y de cuánto tarda el elemento más grande en pintarse (LCP).
- La emulación móvil de Lighthouse es CPU lenta + red 4G simulada: lo que va fluido en tu laptop puede penalizar.
- Google *rankea* con datos de campo de Core Web Vitals (LCP, INP, CLS), no con el score de laboratorio. El score es la mejor señal de laboratorio disponible; INP no se mide en laboratorio y TBT es su aproximación.

Umbrales "bueno": LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1 (percentil 75 en campo).

## 3. Presupuesto (por página, carga inicial)

| Recurso | Límite |
|---|---|
| HTML (comprimido) | ≤ 30 KB |
| CSS total | ≤ 30 KB gzip (inline el crítico si < ~10 KB) |
| JS total | ≤ 70 KB gzip (objetivo real: < 15 KB) |
| Imagen LCP | ≤ 120 KB (AVIF/WebP), ≤ ~1600 px de ancho máximo |
| Fuentes | ≤ 2 archivos WOFF2 críticos (~ 30–50 KB total) |
| Peticiones a otros dominios en carga inicial | 0 (idealmente) |
| Peso total transferido (above-the-fold) | ≤ 500 KB |

## 4. LCP · TBT · CLS

### LCP
- Identificar el elemento LCP (hero `h1` o imagen) y diseñarlo para pintar en el primer frame.
- **Nunca** `opacity: 0` inicial, ni animación de entrada, ni `content-visibility: hidden` sobre él.
- Si es imagen: `<Image loading="eager" fetchpriority="high" />`, `sizes` exacto, sin lazy. Si es un fondo CSS, convertirlo a `<img>` (el preload scanner la descubre antes) o precargarla con `<link rel="preload" as="image" imagesrcset imagesizes fetchpriority="high">`.
- Overlay del hero con gradiente CSS, no con imagen extra.
- HTML pequeño y CSS crítico inline; sin `@import` de CSS; sin fuentes de terceros bloqueantes.
- Evitar redirecciones y TTFB alto: sitio estático en CDN.

### TBT / INP
- Sin frameworks en el hilo principal para contenido estático.
- Dividir cualquier script > 50 ms; `defer`/`type="module"`; nada síncrono en `<head>`.
- Handlers livianos; evitar `scroll` listeners (usar `IntersectionObserver` o CSS).
- Medir con el panel Performance de Chrome si el TBT sube.

### CLS
- Todo `<img>`/`<video>`/`<iframe>` con `width` y `height` (o `aspect-ratio`).
- Fuentes con `font-display: swap` y fallback ajustado con `size-adjust`, `ascent-override`, etc., para que el swap no mueva el layout.
- Reservar espacio para banners (cookies), embeds y widgets; nada se inserta encima del contenido ya pintado.
- Hero con `min-height: 100svh` (no `100vh`, que salta con la barra del navegador móvil).
- Animar con `transform`, no con propiedades que reflowean.

## 5. Fuentes

- 2 familias máximo: una Sans variable + una Serif itálica. Tagline monoespaciado = `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` (sin descarga).
- Autoalojar WOFF2 en `/public/fonts/` (descargar desde Fontsource o google-webfonts-helper). Subset **latin** (cubre español: á é í ó ú ñ ü ¿ ¡). Incluir `latin-ext` solo si hace falta.
- Precargar **solo** el archivo de la fuente del H1: `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/…woff2">`.
- Serif itálica: cargarla con `font-display: swap`; si no es above-the-fold, no precargarla.
- Si una fuente variable pesa más que dos estáticas del mismo uso real, usar las estáticas.
- Tipografía fluida con `clamp()`; interlineado sin unidades.

## 6. Imágenes y video

- Formatos: AVIF/WebP (nunca JPG/PNG para fotos; SVG para logos e íconos). Si el cliente o un estándar interno exige solo WebP, usar `formats={['webp']}`.
- `astro:assets` (`<Image>` / `<Picture>`): `formats={['avif','webp']}`, `widths` y `sizes` reales, `quality` 60–75.
- Todo lo que no es LCP: `loading="lazy"` y `decoding="async"`.
- Fondos de parallax/manifiesto: `<img>` dentro de un contenedor con `overflow:hidden`, no `background-attachment: fixed` (rompe en móvil).
- Unsplash u otra fuente remota: descargar durante el desarrollo a `src/assets/`, comprobar licencia y anotar crédito. No hotlinkear.
- Video de fondo: solo si aporta; `poster` optimizado, `preload="none"` o `metadata`, `muted playsinline`, ≤ 1.5 MB, cargar tras LCP. Por defecto, imagen.
- Favicon: SVG + PNG 180 px (apple-touch-icon). OG image 1200×630.

## 7. JavaScript e islas

- Por defecto, ningún `<script>` salvo los inline diminutos del sistema visual (navbar y sticky stack, < 1 KB).
- Un `<script>` de Astro se empaqueta y deduplica; mantenerlo sin dependencias.
- Islas: `client:visible` para lo que está debajo del pliegue, `client:idle` para lo secundario; `client:load` casi nunca.
- Revisar `dist/_astro/*.js` tras cada build: `scripts/check-budget.mjs` suma el peso de JS y CSS y falla si se supera el presupuesto.

## 8. Terceros

Los terceros suelen ser la razón nº 1 de un 60 en vez de un 95.

- GA4/GTM/Meta Pixel/chat: cargar tras la primera interacción (`pointerdown`, `scroll`, `keydown`) o en `requestIdleCallback`, con un timeout de respaldo de ~4 s. Medir Lighthouse con y sin ellos y reportar la diferencia.
- Considerar Partytown (Web Worker) o analítica sin cookies liviana si el cliente lo acepta.
- WhatsApp: enlace `https://wa.me/<tel>?text=<mensaje codificado>`; **no** usar widgets flotantes con JS.
- Mapas: imagen estática con enlace a Google Maps o `<iframe loading="lazy">` con `width/height`; nunca en el above-the-fold.
- Reservas/formularios: formulario HTML nativo con `action` a un endpoint o enlace a servicio de agenda.

## 9. Hosting, caché y cabeceras

- Assets con hash en `/_astro/`: `Cache-Control: public, max-age=31536000, immutable`.
- HTML: `public, max-age=0, must-revalidate`.
- HTTPS obligatorio, HSTS, Brotli. Ver `templates/_headers`.
- `<link rel="preconnect">` solo para un origen que realmente se use en el primer render; con recursos autoalojados, normalmente ninguno.
- En CDN/WAF (p. ej. Cloudflare), comprobar que no bloquea crawlers de IA ni a Googlebot (ver `references/aeo-geo.md` §7 de la skill `web-discoverability`).

## 10. Diagnóstico rápido

| Síntoma en Lighthouse | Causa típica | Arreglo |
|---|---|---|
| LCP > 2.5 s | Imagen hero grande/lazy; fuente bloqueante; H1 animado | AVIF + `fetchpriority`, preload de fuente, quitar animación del H1 |
| TBT alto | JS de terceros, GSAP, hidratación | Diferir/eliminar; pasar a CSS |
| CLS > 0.1 | Imágenes sin dimensiones; swap de fuentes; banners | `width/height`, `size-adjust`, reservar espacio |
| "Reduce unused CSS/JS" | Librerías completas | Importar solo lo usado |
| "Avoid enormous network payloads" | Imágenes sin optimizar, video | Recomprimir, `srcset`, quitar video |
| Score variable entre corridas | Ruido de laboratorio | `lhci` con 3+ corridas y mediana |

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria recuperada y leída el 2026-10-21 · ◐ confirmada el 2026-10-21 solo en fuentes secundarias o citada por ellas (revalidar en la primaria) · ○ conocimiento general o ruta conocida, **no recuperada** hoy (verificar antes de depender de ello).
Regla de uso: si la regla es ◐ u ○, o si la guía superó su plazo de revalidación, confirmarla en la fuente primaria antes de aplicarla (con búsqueda web, si está disponible) y, si no se puede, decir explícitamente "regla no reverificada hoy".

| Afirmación de esta guía | Estado | Fuente primaria / dónde confirmar |
|---|---|---|
| Pesos del score de Lighthouse: TBT 30 %, LCP 25 %, CLS 25 %, FCP 10 %, Speed Index 10 % (Lighthouse 10 a 12) | ◐ | Página primaria: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring (la tabla de pesos no se leyó hoy; fuentes secundarias coinciden). Confirmar con la versión de Lighthouse instalada |
| Umbrales Core Web Vitals "bueno": LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (percentil 75) | ○ | https://web.dev/articles/vitals |
| Astro + Tailwind v4 con el plugin `@tailwindcss/vite` | ◐ | https://astro.build/blog/astro-520/ (integración de Tailwind 4); verificar versión y método vigentes en https://docs.astro.build al hacer el scaffold |
| Presupuestos de JS/CSS/imágenes de esta guía (70 KB, 30 KB, 120 KB…) | ○ | Son objetivos propios de la skill, no normas oficiales: ajustarlos con el criterio del proyecto |
| Buenas prácticas de fuentes, imágenes, preload y caché | ○ | https://web.dev (artículos de rendimiento) y documentación de Astro |
