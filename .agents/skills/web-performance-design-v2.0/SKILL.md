---
name: "web-performance-design-v2.0"
description: Capa visual, de movimiento y de performance para sitios cinematográficos con scrollytelling, secuencias de frames, GSAP/ScrollTrigger e islas React sobre Astro + Tailwind v4, manteniendo Core Web Vitals en verde y PageSpeed móvil 90+. Cubre presupuesto de carga en dos niveles (crítico y diferido), niveles de movimiento M0–M3, secuencias de frames en canvas o video atado al scroll, patrones de GSAP, islas React, accesibilidad del movimiento (reduced-motion), sistema visual, UX/UI y medición de fluidez de scroll. Usar al construir o rediseñar la capa visual de un sitio con animación avanzada, al optimizar un sitio cinematográfico existente, o cuando el usuario mencione scrollytelling, secuencia de frames, canvas, GSAP, ScrollTrigger, React, LCP, CLS, INP, TBT, 60 FPS, PageSpeed o Core Web Vitals en un sitio con efectos. NO usar para un sitio ultrarrápido sin animación avanzada ni JS propio (ver web-performance-design v1). No cubre contenido SEO/AEO ni JSON-LD (ver web-discoverability-v2.0).
---

# Web Performance Design v2.0 — cine con presupuesto

Construye interfaces cinematográficas **sin pagar el costo habitual en velocidad**. Respecto de la v1, JavaScript, canvas, GSAP y React **están permitidos**, pero cada pieza tiene un nivel de movimiento, un presupuesto, un momento de carga y una versión sin movimiento. Si un efecto cuesta más de lo que el presupuesto permite, se simplifica el efecto o se baja de nivel; nunca se sube el presupuesto para acomodarlo.

Esta skill es **dueña** de: presupuesto crítico/diferido, Core Web Vitals, scrollytelling, secuencias de frames, GSAP, islas React, accesibilidad del movimiento, sistema visual, UX/UI y hosting. Las decisiones de stack y el vocabulario de niveles M0–M3 los define `cinematic-fast-web-v2.0` (`references/matriz-stack.md`).

## Alcance

| Esta skill cubre | Otra skill cubre |
|---|---|
| Presupuesto crítico/diferido, Core Web Vitals, hosting y caché | Copy AEO, JSON-LD, FAQ, robots, sitemap, canonical → `web-discoverability-v2.0` |
| Scrollytelling, secuencias de frames, GSAP, islas React | Entrevista, blueprint, elección de stack y fases → `cinematic-fast-web-v2.0` |
| Sistema visual, UX/UI, accesibilidad y contraste, `prefers-reduced-motion` | Texto del scrollytelling en el HTML inicial, schema de producto → `web-discoverability-v2.0` |
| Medición de fluidez de scroll y peso de secuencias | |

## Niveles de movimiento (resumen operativo)

Usar el **nivel más bajo** que logre el efecto. Detalle y selección: `cinematic-fast-web-v2.0/references/matriz-stack.md`.

| Nivel | Qué es | JS que suma | Dónde se carga | Referencia |
|---|---|---|---|---|
| **M0** | CSS: transiciones, keyframes, `animation-timeline` | 0 KB | — | `references/sistema-visual.md` §2 |
| **M1** | JS vanilla: `IntersectionObserver`, `requestAnimationFrame`, secuencia de frames | ≲ 3 KB propio (criterio de la skill) | Script diferido o módulo tras el LCP | `references/frame-sequence.md`, `scrollytelling.md` |
| **M2** | GSAP core + ScrollTrigger (+ SplitText si hace falta) | del orden de 30–40 KB gzip (◐, medir) | `import()` dinámico tras el LCP o al entrar en viewport; un solo chunk compartido | `references/gsap-patterns.md` |
| **M3** | Isla React con `client:visible` o `client:idle` | React + componente (medir) | Al entrar en viewport o en idle | `references/react-islands.md` |

## Modo Construir

1. **Scaffold** según `cinematic-fast-web-v2.0/templates/` (Astro, Tailwind v4, React si hay M3). Verificar versiones al instalar; no fijarlas de memoria.
2. **Tokens de diseño:** si hay diseño aprobado (Stitch, Figma, `DESIGN.md`), los tokens salen de ahí; la skill solo impone límites (≤ 2 familias, íconos SVG inline, sin fuentes remotas). Si no hay, usar `templates/global.css`.
3. **LCP primero:** definir el elemento LCP y su versión sin JS (`references/stack-performance.md` §4). Recién después montar la escena animada.
4. **Escenas:** por cada escena del blueprint, aplicar el patrón de su nivel (`scrollytelling.md`, `frame-sequence.md`, `gsap-patterns.md`, `react-islands.md`) y la versión móvil y sin movimiento (`motion-a11y.md`).
5. **Secciones y UX:** `references/sistema-visual.md` y `references/ux-ui.md`.
6. **Hosting y cabeceras:** `templates/_headers` (incluye caché inmutable para frames y fuentes).
7. **Verificar** (abajo).

## Modo Optimizar (sitio cinematográfico existente)

1. Medir primero: Lighthouse móvil (3 corridas, mediana), `check-budget.mjs`, `check-frames.mjs` y `measure-scroll.mjs`. Registrar el estado inicial.
2. Diagnosticar con la tabla de `references/stack-performance.md` §10 (incluye síntomas de scrollytelling: scroll con tirones, memoria alta, LCP tardío por frames).
3. Aplicar primero lo de mayor impacto: elemento LCP, peso de la secuencia, JS crítico, fuentes, terceros. Después bajar escenas de nivel (M2 → M1 → M0) donde sea posible.
4. Re-medir y reportar antes/después. Si un arreglo exige cambiar de plataforma, decirlo y dar la alternativa incremental.

## Verificación (no se entrega sin esto)

```bash
npm run build
node scripts/check-budget.mjs dist                       # JS crítico/diferido, CSS, HTML, fuentes, orígenes externos
node scripts/check-frames.mjs public/frames              # peso y cantidad de la secuencia (--profile mobile para la versión móvil)
node scripts/contrast.mjs "#texto/#fondo" "#texto2/#acento" …
npx astro preview                                        # servir dist
node scripts/measure-scroll.mjs --url http://localhost:4321 --profile mobile   # fluidez de scroll
npx lhci autorun --config=lighthouserc.json              # Lighthouse móvil, 3 corridas
```

Criterio: Performance ≥ 90 móvil (objetivo 95+), Accessibility/Best Practices/SEO ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms, **y** `measure-scroll.mjs` dentro de sus umbrales. Si no hay red, Chrome o Playwright, decirlo explícitamente, entregar lo medido y los comandos pendientes; **no afirmar scores ni fluidez que no se midieron**. Los umbrales de los scripts propios (presupuestos, frames, scroll) son criterios de la skill, no normas oficiales: se ajustan con el criterio del proyecto y se registra el cambio.

## Reglas innegociables

1. **Contenido crítico en el HTML inicial** (SSG/SSR). Ningún texto crítico depende de JS. React se permite; el HTML del servidor ya contiene el contenido.
2. **Presupuesto de dos niveles:** JS **crítico** (corre antes del LCP) y **diferido** (tras el LCP o al entrar en viewport). Valores en `references/stack-performance.md` §3; los comprueba `check-budget.mjs`.
3. **El LCP nunca depende de JS ni arranca invisible.** Es un `<img>` (o el H1) pintado en el primer frame. Un `<canvas>` no es candidato a LCP (◐): la secuencia se monta encima de la imagen inicial, tras el LCP.
4. **Estados ocultos solo bajo `html.js-motion`** (clase puesta por el script inline de `BaseLayout.astro`, solo si hay JS y no hay `reduced-motion`). Sin esa clase todo el contenido se ve completo. Nada de `opacity: 0` en CSS global ni sobre el LCP.
5. **Cada escena tiene versión móvil y versión sin movimiento** (`reduced-motion`): 3–5 imágenes clave con su texto, en altura normal. Es entregable, no extra.
6. **Secuencias de frames con plan:** cantidad y resolución por breakpoint, formato AVIF/WebP, carga progresiva, y comprobación con `check-frames.mjs`. Se controla también la **memoria decodificada**, no solo los bytes transferidos (`frame-sequence.md` §4).
7. **Animar `transform` y `opacity`.** Excepción: `backdrop-filter` en un elemento pequeño y **estático**, nunca animado ni sobre un canvas que cambia por frame. Sin `filter` animado; sin animar propiedades que reflowean.
8. **Listeners de scroll permitidos con condiciones:** `passive`, trabajo dentro de `requestAnimationFrame`, sin leer layout en el bucle, activos solo mientras la sección es visible (`IntersectionObserver` los enciende y apaga).
9. **GSAP solo en M2**, con `import()` dinámico, un único chunk compartido, `gsap.matchMedia()` para `reduced-motion` y breakpoints, y limpieza al desmontar. Nunca dos sistemas de animación sobre el mismo elemento.
10. **Máximo 2 familias tipográficas** autoalojadas en WOFF2 (1 precargada); íconos SVG inline; imágenes locales y optimizadas; sin hotlinking; sin CDN de Tailwind.
11. **Terceros fuera del camino crítico**, medidos con y sin ellos.
12. **Accesibilidad medida, no supuesta:** contraste AA con `contrast.mjs`, foco visible, objetivos táctiles ≥ 44 px, semántica nativa, y el scroll nunca se secuestra sin salida (teclado, anclas y `reduced-motion` siguen funcionando).
13. **Fluidez de scroll medida** con `measure-scroll.mjs` en CPU ralentizada. Lighthouse no mide fluidez; un score alto no la garantiza.
14. **No prometer un score.** Se promete un presupuesto y una medición; el resultado depende del hosting, del contenido y de la corrida.

## Protocolo de vigencia (las reglas cambian)

Cada guía de `references/` lleva fecha de última verificación, plazo de revalidación y tabla de fuentes con estado (✔ primaria leída, ◐ solo secundarias, ○ no recuperada).
1. Al empezar, ejecutar `node scripts/check-freshness.mjs .` desde esta carpeta. Si algo está vencido, revalidar antes de aplicarlo.
2. Una regla ◐ u ○ sensible al tiempo se confirma en la fuente primaria enlazada si hay búsqueda web; si no, decir "regla no reverificada hoy".
3. Tras revalidar, actualizar fecha y estado; no cambiar la fecha sin haber confirmado.

**Reglas especialmente volátiles aquí:** licencia y peso de GSAP y plugins, soporte de `animation-timeline` y de Long Animation Frames por navegador, qué cuenta como candidato a LCP, pesos y umbrales de Lighthouse, versiones de Astro, React y Tailwind.

## Templates y destinos

| Template | Ruta en el proyecto | Función |
|---|---|---|
| `templates/global.css` | `src/styles/global.css` | Tokens, fuentes autoalojadas, movimiento seguro bajo `.js-motion` |
| `templates/_headers` | `public/_headers` | Caché inmutable (assets, fuentes, frames) y seguridad |
| `templates/lighthouserc.json` | `lighthouserc.json` | Lighthouse CI móvil con umbrales |
| `templates/FrameSequence.astro` | `src/components/FrameSequence.astro` | Marcado de una escena con frames: `<img>` LCP, `<canvas>`, versión sin movimiento |
| `templates/frame-sequence.js` | `src/scripts/frame-sequence.js` | Motor M1: carga progresiva, dibujo en canvas, activación por visibilidad |
| `templates/gsap-scroll.js` | `src/scripts/gsap-scroll.js` | Cargador M2: `import()` dinámico, `matchMedia`, limpieza |

Reemplazar todos los marcadores `TODO` antes de publicar. Los patrones de movimiento son plantillas propias **no probadas en navegador**: validarlas visualmente en cada proyecto.

## Relación con las otras skills

- Texto, JSON-LD y FAQ los define `web-discoverability-v2.0`. Aquí solo se garantiza que se rendericen sin costo y que el texto del scrollytelling exista en el HTML aunque la escena sea un canvas.
- Para un sitio completo desde cero, empezar por `cinematic-fast-web-v2.0`, que coordina las tres y ejecuta `verify-all.mjs`.

## Archivos de la skill

- `references/stack-performance.md` — presupuesto crítico/diferido, Core Web Vitals, fuentes, imágenes, JS, terceros, hosting, diagnóstico.
- `references/scrollytelling.md` — estructura de escenas atadas al scroll, pin, capítulos, ciclo de vida, móvil.
- `references/frame-sequence.md` — secuencias de frames y alternativa de video; peso, memoria, carga progresiva.
- `references/gsap-patterns.md` — carga diferida, `matchMedia`, limpieza, SplitText, ScrollTrigger.
- `references/react-islands.md` — qué se hidrata, cuándo y cómo; Astro y Next.js.
- `references/motion-a11y.md` — versión sin movimiento, `js-motion`, teclado, pausa, vestibular.
- `references/sistema-visual.md` — sistema visual y secciones, con política de movimiento por niveles.
- `references/ux-ui.md` — convenciones de UX/UI, con UX del scrollytelling.
- `scripts/check-budget.mjs` — presupuesto del build en dos niveles.
- `scripts/check-frames.mjs` — peso, cantidad y consistencia de una secuencia de frames.
- `scripts/measure-scroll.mjs` — fluidez de scroll con Playwright (CPU ralentizada).
- `scripts/contrast.mjs` — contraste WCAG entre pares de colores.
- `scripts/check-freshness.mjs` — avisa qué guías superaron su plazo de revalidación.

