# Conflictos entre v1 y v2.0, y cómo se resuelven

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 180 días

Registro compartido por las tres skills v2. Cada fila dice qué regla de la v1 cambia, por qué y **qué skill es dueña de la resolución** (la que debe implementarla). Si una fila figura como pendiente, la skill dueña todavía no la incorporó.

## A. Reglas que cambian de fondo

| # | Regla v1 | Problema con scrollytelling + React + GSAP | Resolución v2.0 | Dueña | Estado |
|---|---|---|---|---|---|
| V2-01 | "Sin SPA, sin renderizado cliente; React solo como isla excepcional" | React es parte del stack, pero renderizar contenido solo en el cliente deja el HTML vacío para bots de IA | Se prohíbe el **renderizado solo-cliente del contenido crítico**, no React. Astro + islas por defecto; Next.js SSG si el sitio es mayormente aplicación (`matriz-stack.md`, `react-islands.md`) | cinematic / performance | ✔ hecho |
| V2-02 | JS por defecto 0 KB; un solo tope de 70 KB gzip | React + GSAP superan el tope único | Presupuesto de **dos niveles**: crítico (≤ 15 KB gzip, antes del LCP) y diferido (≤ 120 KB gzip, tras el LCP / al entrar en viewport), medido con `check-budget.mjs` | performance | ✔ hecho |
| V2-03 | "GSAP solo como excepción" | GSAP es herramienta base del scrollytelling complejo | Se reemplaza por **niveles M0–M3**: el nivel más bajo que logre el efecto; GSAP es M2, con `import()` tras el LCP (`gsap-patterns.md`, `templates/gsap-scroll.js`) | cinematic / performance | ✔ hecho |
| V2-04 | "Evitar listeners de `scroll`; usar IntersectionObserver o CSS" | El scrub frame a frame necesita la posición de scroll en cada frame | Permitido con condiciones: listener `passive` o `ScrollTrigger`, trabajo en `requestAnimationFrame`, sin leer layout en el bucle, activo solo mientras la sección es visible (`scrollytelling.md`) | performance | ✔ hecho |
| V2-05 | "El LCP nunca arranca invisible ni animado" | El hero es una secuencia de frames | Se mantiene. Un `<canvas>` no es candidato a LCP (◐); el primer frame va como `<img fetchpriority="high">` y el canvas se monta encima tras el LCP (`FrameSequence.astro`) | cinematic / performance | ✔ hecho |
| V2-06 | Imagen LCP ≤ 120 KB, ≤ 500 KB above-the-fold, video ≤ 1.5 MB; sin guía de secuencias | Una secuencia de cientos de frames pesa decenas de MB | Plan de medios obligatorio en el blueprint y `check-frames.mjs`: menos frames, resolución por breakpoint, carga progresiva, ventana de decodificación, alternativa de video y versión móvil (`frame-sequence.md`) | cinematic / performance | ✔ hecho |
| V2-07 | `filter` y `backdrop-filter` prohibidos salvo la navbar | Los diseños con HUD translúcido usan `backdrop-blur` | Permitido en elementos pequeños y **estáticos**; nunca animado ni sobre un canvas grande que cambia por frame (`sistema-visual.md` §2) | performance | ✔ hecho |
| V2-08 | `prefers-reduced-motion`: el contenido queda visible | Una escena de 400–500 vh sin animación es scroll muerto | Versión alternativa obligatoria por escena: 3–5 imágenes clave (`.seq-stills`) con su texto en altura normal (`motion-a11y.md`, `FrameSequence.astro`) | cinematic / performance | ✔ hecho |
| V2-09 | "No partir letras en `<span>` con JS" | Los reveals de texto cinematográficos lo usan | Permitido en M2 si el texto original sigue accesible (`aria-label` en el contenedor, spans `aria-hidden`, como hace `SplitText`) y nunca en el H1 (`gsap-patterns.md` §6) | performance | ✔ hecho |
| V2-10 | "Contenido siempre visible sin JS" | Los estados `from` de GSAP ocultan texto si el JS falla o tarda | Clase `html.js-motion` puesta por un script inline de una línea; los estados ocultos solo existen bajo esa clase (`BaseLayout.astro`, `global.css`) | cinematic / performance | ✔ hecho |
| V2-11 | Verificación = Lighthouse + presupuesto | Lighthouse no mide fluidez de scroll; el producto pide 60 FPS | `measure-scroll.mjs` (intervalo entre frames y Long Animation Frames con scroll automatizado y CPU ralentizada) como paso obligatorio de la Fase 4; `verify-all.mjs` lo exige | cinematic / performance | ✔ hecho |
| V2-12 | Scroll nativo implícito | El scroll suave (Lenis u otro) puede secuestrar teclado y anclas | Prohibido secuestrar el scroll sin salida; teclado, anclas y `reduced-motion` deben seguir funcionando (`motion-a11y.md` §4, `ux-ui.md` §5) | performance | ✔ hecho |
| V2-13 | Sistema visual único: landing de servicios | Hay proyectos de producto/catálogo/configurador | Modo **producto** en Fase 0, entrevista y secciones de catálogo/configurador (`sistema-visual.md` §5); `Product`/`Offer` en schema (`web-discoverability-v2.0`) | cinematic / performance / discoverability | ✔ hecho |
| V2-14 | Tipografía fija Sans + Serif itálica; radios predefinidos; plantilla `global.css` con tokens propios | Un diseño aprobado (Stitch, Figma) usa otras fuentes y radios | El diseño aprobado (`DESIGN.md`) define tokens; la skill impone solo límites (≤ 2 familias WOFF2, íconos SVG inline, sin fuentes remotas; `sistema-visual.md` §1, `global.css`) | cinematic / performance | ✔ hecho |

## B. Higiene del paquete (discrepancias internas de la v1 que la v2 corrige)

| # | Problema en v1 | Resolución v2.0 | Dueña | Estado |
|---|---|---|---|---|
| V2-15 | Referencias duplicadas y divergentes dentro de `cinematic-fast-web/references/` (versiones viejas, sin fecha de vigencia) | **Un solo dueño por tema** (tabla "Contrato con las skills hermanas" del `SKILL.md`). La coordinadora no copia referencias de las hermanas: las enlaza | cinematic | ✔ hecho |
| V2-16 | Los scripts citados por los `SKILL.md` de v1 no existían y los creados después eran más simples que lo prometido | `verify-all.mjs` informa **NO EJECUTADO** cuando falta un script, una herramienta externa (código 3) o un parámetro, nunca lo cuenta como aprobado. Cada script v2 declara qué verifica y qué no | cinematic / performance / discoverability | ✔ hecho |
| V2-17 | Workflows de fase que apuntan a `docs/` y `design/stitch/` inexistentes | El flujo de fases v2 se rige por `cinematic-fast-web-v2.0/SKILL.md` y `master-prompt.md` verificando rutas existentes antes de ejecutar | cinematic | ✔ hecho |
| V2-18 | Dos marcos de proceso en paralelo (Scrum en `AGENTS.md` y fases en `master-prompt.md`) | `master-prompt.md` armoniza ambos: cada fase del pipeline técnico v2 constituye un ítem/incremento verificable del Sprint aprobable por el Product Owner | coordinador | ✔ hecho |
| V2-19 | `master-prompt.md` activa solo `cinematic-fast-web` (v1) | `master-prompt.md` actualizado con selector explícito de batería: **v2.0** (scrollytelling, React, GSAP, frames) vs **v1.0** (estático "cero JS"), sin mezclarlas | coordinador | ✔ hecho |
| V2-20 | Ambigüedad de activación: la descripción de v1 también dice "landing cinematográfica" | Las descripciones de las 3 skills v2 delimitan su alcance (scrollytelling, GSAP, React, frames, modo producto) y remiten a v1 para sitios sin animación avanzada | cinematic / performance / discoverability | ✔ hecho |

## C. Lo que no cambia

- Orden de prioridades: contenido indexable → performance → espectáculo.
- Un H1, un `<main>`, JSON-LD único desde `business.ts`, FAQ 1:1, sin `aggregateRating` propio, `robots.txt` + sitemap + canonical.
- No inventar datos del negocio; `TODO_` y preguntar.
- No afirmar scores sin medirlos; no prometer ranking ni citación.
