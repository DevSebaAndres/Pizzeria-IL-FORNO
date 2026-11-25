---
trigger: model_decision
description: Master Prompt v2.0 para proyectos web cinematográficos con scrollytelling, secuencia de frames en canvas/video, GSAP/ScrollTrigger e islas React sobre Astro + Tailwind v4.
---

# Master Prompt v2.0 — Sitios Cinematográficos con Scrollytelling, GSAP e Islas React

Para cualquier tarea de un proyecto bajo la **batería v2.0** (sitios cinematográficos con scrollytelling, secuencia de frames `<canvas>` o video scrub, GSAP/ScrollTrigger, islas React o catálogo/showroom interactivo):

- Activa **`cinematic-fast-web-v2.0`** para coordinar y construir el sitio de principio a fin (6 fases: Entrevista v2 → Copy + SEO/AEO/GEO → Diseño en Stitch → Implementación por niveles M0–M3 → Auditoría → Cierre).
- Usa **`web-discoverability-v2.0`** para SEO técnico (Google Search Essentials), AEO/GEO (frase de entidad en 3 modos `local`/`general`/`product`, capítulos scrollytelling citables en `<ol class="scrolly-steps">`, FAQ 1:1, `robots.txt`, `llms.txt`) y JSON-LD (`@graph` con `LocalBusiness` | `Organization`, `Service`, `Product`/`Offer` y `FAQPage`).
- Usa **`web-performance-design-v2.0`** para stack, presupuesto en dos niveles (`JS crítico ≤ 15 KB gzip` / `JS diferido ≤ 120 KB gzip`), niveles de movimiento M0–M3, secuencia de frames (`FrameSequence.astro` + `frame-sequence.js` con carga progresiva por stride y ventana deslizante), patrones GSAP/ScrollTrigger, islas React (`client:visible` / `client:idle`), accesibilidad del movimiento (`prefers-reduced-motion` con `.seq-stills` de 3–5 imágenes clave), sistema visual (`DESIGN.md` de Stitch con precedencia sobre paletas de referencia) y UX/UI.
- Antes de aplicar reglas de Google, schema, rastreadores de IA, presupuestos de performance o Lighthouse, ejecuta `check-freshness.mjs` en las 3 skills v2.0; si una guía está vencida, revalida en la fuente primaria o avisa `"regla no reverificada hoy"`.
- Nunca inventes datos del negocio, precios, stock, calificaciones (`aggregateRating`) ni métricas de capítulos: usa marcadores `TODO_` explícitos y pregúntame.
- Nunca dibujes texto narrativo, títulos, especificaciones ni CTAs dentro de un `<canvas>` o video: todo el contenido debe existir en HTML semántico real en el DOM inicial.
- No avances de fase sin mi aprobación explícita (y si en el repositorio rige `AGENTS.md`, alinea cada fase acordada como incremento verificable en `SPRINT.md`).
- No afirmes scores, fluidez (60 FPS), presupuestos ni cumplimiento sin ejecutar los scripts y mostrar su salida real completa.
- El HTML exportado desde Stitch es referencia visual, no código de producción; los tokens de `DESIGN.md` son la fuente de verdad visual.

---

## Comprobar que las skills v2.0 se detectan

Prompt de prueba:

```text
Lista las skills de la batería v2.0 disponibles en este proyecto (cinematic-fast-web-v2.0, web-performance-design-v2.0, web-discoverability-v2.0) y para cada una dime su nombre, cuándo se activa y qué scripts incluye. No ejecutes nada todavía.
```

**Esperado:** las tres skills v2.0 aparecen. Si no, revisar la carpeta y el `name`/`description` del `SKILL.md`.

## Chequeo de vigencia (v2.0)

```text
Ejecuta node .agents/skills/cinematic-fast-web-v2.0/scripts/verify-all.mjs (o check-freshness.mjs en las 3 skills v2.0) y muéstrame la salida completa. Si alguna guía está vencida, dime qué reglas dependen de ella antes de continuar.
```

## Auditoría integral antes de cerrar (v2.0)

```bash
node .agents/skills/cinematic-fast-web-v2.0/scripts/verify-all.mjs \
  --dist ./dist \
  --frames ./public/frames \
  --pairs "#1B2A41:#FBF6EA,#F5F3EC:#0E0F11" \
  --url http://localhost:4321

npx lhci autorun --config=lighthouserc.json
```

**Criterio de salida:** las 3 skills v2.0 detectadas, MCP de Stitch conectado (`DESIGN.md` sincronizado o plan manual definido) y las 14 referencias de la batería v2.0 vigentes (`0 vencidas`).

