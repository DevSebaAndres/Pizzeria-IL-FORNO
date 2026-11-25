# Sistema visual cinematográfico v2 (tokens, secciones y movimiento M0–M3)

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 180 días · Fuentes y estado al final de este documento.

Define cómo construir las secciones de un sitio o plataforma cinematográfica respetando el presupuesto de performance. A diferencia de la v1 (que fijaba una única estética de radios grandes y Sans + Serif), en la v2 **cuando existe un diseño aprobado (`DESIGN.md` / Stitch / Figma), ese diseño manda sobre colores, tipografías, radios y composición**, y la skill impone las reglas técnicas.

## Contenido

1. Tokens y precedencia del diseño aprobado
2. Política de movimiento y superficies (`backdrop-filter`)
3. Navbar / HUD flotante
4. Hero (estático o con scrollytelling M1/M2)
5. Secciones de producto: Catálogo y Configurador / Showroom (M3)
6. Secciones editoriales: Dashboard, Manifiesto, Sticky stack
7. Planes / Conversión y Footer
8. Accesibilidad y contraste

## 1. Tokens y precedencia del diseño aprobado

- **Con diseño aprobado (`DESIGN.md` / Stitch):** traducir los colores, la escala tipográfica, los radios y el espaciado del diseño a variables en `@theme` (`src/styles/global.css`). Por ejemplo, si el diseño define modo dual (*Garage Mode* cálido `#FBF6EA`/`#1B2A41` + *Showroom Mode* oscuro `#0E0F11`/`#F5F3EC`), radios de `2px`/`6px`/`12px` y tipografías `Barlow Condensed` + `Outfit`, esos son los tokens del proyecto.
- **Sin diseño previo:** usar los valores por defecto de `templates/global.css` (4 roles de marca, 2 familias tipográficas, radios editoriales).
- **Límites técnicos innegociables (con o sin diseño):**
  - Máximo **2 familias tipográficas** descargadas (WOFF2 autoalojadas, subset `latin`, 1 sola precargada).
  - **Prohibido** cargar fuentes de íconos remotas (como Material Symbols por Google Fonts): todos los íconos se implementan como **SVG inline**.
  - Textura o grano: tile WebP/PNG ≤ 4 KB en pseudo-elemento fijo con `pointer-events: none` (nunca `feTurbulence` en vivo).
  - `html { scrollbar-gutter: stable }` para evitar CLS.

## 2. Política de movimiento y superficies (`backdrop-filter`)

- Seleccionar el nivel más bajo por sección (**M0 → M1 → M2 → M3**; ver `cinematic-fast-web-v2.0/references/matriz-stack.md`).
- Animar únicamente `transform` y `opacity`.
- **`backdrop-filter: blur(8px–12px)` permitido con condiciones:** solo en elementos **pequeños y estáticos** (navbar flotante, cápsulas del HUD o botones de hotspot de 44×44 px, máximo 2–3 en el viewport simultáneamente). **Prohibido** animar `backdrop-filter` o colocar un panel grande con `backdrop-filter` encima de un `<canvas>` mientras hace scrub frame a frame.
- **Sombras sobre vehículos o productos:** en lugar de `filter: drop-shadow(...)` dinámico en elementos que se animan, usar la sombra integrada en el asset o un gradiente radial estático debajo del objeto (`transform: scale(...)`).
- Todos los estados iniciales ocultos viven bajo `html.js-motion` (`references/motion-a11y.md`).

## 3. Navbar / HUD flotante

- `position: fixed; top: max(1rem, env(safe-area-inset-top)); z-index: 50`.
- Detección de scroll sin listener de `scroll`: centinela de 1 px observado con `IntersectionObserver`:
  ```html
  <div id="top-sentinel" style="position:absolute;top:50px;height:1px;width:1px"></div>
  <script is:inline>
    const nav = document.querySelector('[data-nav]');
    if (nav) new IntersectionObserver(([e]) => nav.classList.toggle('is-scrolled', !e.isIntersecting))
      .observe(document.getElementById('top-sentinel'));
  </script>
  ```
- Enlaces con `<a href="#seccion">` o rutas reales; menú móvil con `<details>` o botón con `aria-expanded`.

## 4. Hero (estático o con scrollytelling M1/M2)

Dos variantes según el blueprint:

1. **Hero con secuencia de frames o video atado al scroll (M1/M2):**
   - Usa `templates/FrameSequence.astro` + `templates/frame-sequence.js` (ver `references/frame-sequence.md`).
   - El **primer frame es un `<img fetchpriority="high" loading="eager">`**, que actúa como LCP inmediato. El `<canvas>` se superpone recién cuando el motor dibuja tras `window.load`.
   - El **H1** (con servicio/producto y lugar si aplica) y la **frase de entidad AEO** (25–40 palabras) están en HTML real en el primer pliegue, visibles sin esperar al JS.
2. **Hero cinematográfico estático (M0):**
   - `min-height: 100svh`, `<img fetchpriority="high">` con overlay en gradiente CSS, H1 sin animación de entrada y elementos secundarios con `.fade-up` bajo `prefers-reduced-motion: no-preference`.

## 5. Secciones de producto: Catálogo y Configurador / Showroom (M3)

Para plataformas de producto o coleccionismo (como *Paint the Classics*):

- **Explorador / Catálogo de modelos:**
  - Las tarjetas del catálogo se renderizan en HTML estático en build desde `src/data/business.ts` (o colección de Astro). Cada tarjeta es un `<article>` con imagen `loading="lazy"`, `width`/`height`, título `<h3>`, especificaciones en texto real y un `<a href>` rastreable.
  - Los filtros por década, país o categoría pueden resolverse en M1 (filtrado por atributos `data-*` en el DOM existente) o como isla M3 si combinan estado complejo.
- **Configurador / Modo Showroom ("El Lienzo" vs "El Render"):**
  - Marco de la sección y titulares en `.astro`; el visor interactivo (selector de colores históricos, acabado línea B/N vs render, fondos, ángulos y hotspots técnicos) se monta como **isla React (`client:visible`)** siguiendo `references/react-islands.md`.
  - Contenedor con relación de aspecto fija (`aspect-ratio: 16/9` o `min-height` definido) para CLS = 0 al hidratar.

## 6. Secciones editoriales: Dashboard, Manifiesto, Sticky stack

Cuando el proyecto incluya secciones de narrativa de marca o servicios:

- **Dashboard / Telemetría (M0):** tarjetas con `aspect-ratio` fijo y animaciones puramente CSS (`@keyframes` sobre `transform` y `clip-path`), con todo el texto en el DOM.
- **Manifiesto (M0/M2):** contraste tipográfico alto y parallax suave con `animation-timeline: view()` bajo `@supports` (o en M2 si requiere pin sincronizado).
- **Sticky stack (M0/M1):** tarjetas con `position: sticky; top: 0; height: 100svh` y `IntersectionObserver` ligero que alterna `.is-covered { transform: scale(.94); opacity: .6 }` sin `filter: blur`.

## 7. Planes / Conversión y Footer

- **Planes o modalidades de compra** (por ejemplo, descarga digital "El Lienzo" vs póster impreso "El Render"): precios y características en HTML real, coherentes 1:1 con los datos estructurados `Offer`/`Product` de `business.ts`.
- **Footer:** semántico (`<footer>`), enlaces rastreables, datos reales del negocio desde `business.ts` y política de privacidad.

## 8. Accesibilidad y contraste

- **Contraste WCAG 2.2 AA medido** con `node scripts/contrast.mjs "#texto/#fondo" …` en todos los pares de la paleta (incluyendo tanto el modo claro/Garage como el modo oscuro/Showroom si el diseño es dual):
  - Texto normal: ≥ **4.5:1**.
  - Texto grande (≥ 18pt / 24px regular o ≥ 14pt / 18.66px bold) y bordes/componentes funcionales de UI: ≥ **3.0:1**.
- Un único `<main>`, un único `<h1>`, cada `<section>` con heading o `aria-labelledby`, foco `:focus-visible` claro y objetivos táctiles ≥ 44×44 px.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| Umbrales WCAG 2.2 AA (4.5:1 texto normal, 3:1 texto grande y UI) | ○ | https://www.w3.org/TR/WCAG22/ |
| `animation-timeline: view()` Baseline 2026 | ◐ (2026-11-10, secundarias) | https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline |
| Regla de precedencia del `DESIGN.md` y límites de `backdrop-filter` | ○ | Criterios propios de la skill (`conflictos-v2.md` V2-07 y V2-14) |

