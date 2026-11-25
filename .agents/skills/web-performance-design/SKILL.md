---
name: web-performance-design
description: Diseño y desarrollo de sitios y landing pages visualmente impactantes (estilo cinematográfico/editorial) con alta performance, usando Astro + Tailwind v4 + CSS moderno (cero JS por defecto) para alcanzar 90+ en Lighthouse/PageSpeed móvil y Core Web Vitals en verde. Cubre stack, presupuesto de carga, fuentes, imágenes, animaciones de scroll sin JavaScript pesado, sticky stacks, dashboards animados, convenciones de UX/UI, accesibilidad y contraste WCAG AA. Usar al construir o rediseñar la capa visual de un sitio, al optimizar la velocidad de un sitio existente, o cuando el usuario mencione PageSpeed, Lighthouse, Core Web Vitals, LCP, CLS, TBT, INP, "web bonita y rápida", landing cinematográfica, pixel perfect, animaciones, UX, UI, contraste o accesibilidad. No cubre contenido SEO/AEO ni JSON-LD (ver web-discoverability).
---

# Web Performance Design — belleza con presupuesto

Construye interfaces espectaculares **sin pagar el costo habitual en velocidad**. El espectáculo se logra con composición, tipografía, color, SVG y CSS (`transform`/`opacity`), no con JavaScript. Si un efecto cuesta más de lo que el presupuesto permite, se simplifica el efecto, nunca el presupuesto.

## Alcance

| Esta skill cubre | Otra skill cubre |
|---|---|
| Stack, presupuesto, Core Web Vitals, hosting y caché | Copy, JSON-LD, FAQ, robots, sitemap, canonical → `web-discoverability` |
| Sistema visual: hero, dashboard, manifiesto, sticky stack, planes, footer | Entrevista creativa y ensamblado de un sitio completo → `cinematic-fast-web` |
| UX/UI: jerarquía, CTA, formularios, móvil | |
| Accesibilidad y contraste, `prefers-reduced-motion` | |

## Cuándo usar

- Construir o rediseñar la capa visual/UX de un sitio con alta exigencia estética **y** de velocidad.
- **Optimizar un sitio existente** que puntúa mal en PageSpeed: ver modo Optimizar.
- Revisar contraste, accesibilidad y experiencia móvil.

## Modos

### Modo Construir
1. **Scaffold:** `npm create astro@latest`, plugin `@tailwindcss/vite` (Tailwind v4). Verificar versiones al instalar; no fijarlas de memoria. (`references/stack-performance.md` §1)
2. **Sistema de diseño:** 4 colores de marca como tokens, 2 familias de fuentes autoalojadas, radios y espaciado (`templates/global.css`).
3. **Secciones:** construir cada una con `references/sistema-visual.md` (hero con el LCP protegido, dashboard en CSS, manifiesto, sticky stack, planes/newsletter, footer).
4. **UX/UI:** aplicar `references/ux-ui.md` (un CTA primario por pantalla, formularios, móvil primero, confianza).
5. **Hosting y cabeceras:** `templates/_headers`, CDN estático, caché inmutable para assets con hash.
6. **Verificar** (abajo).

### Modo Optimizar (sitio existente)
1. Medir primero: Lighthouse móvil (3 corridas, mediana) y, si hay tráfico, datos de campo en PageSpeed Insights/Search Console. Registrar el estado inicial.
2. Diagnosticar con la tabla de `references/stack-performance.md` §10 (LCP, TBT, CLS y su causa típica).
3. Aplicar los arreglos de mayor impacto primero: elemento LCP, imágenes (formato, `srcset`, dimensiones), fuentes, JS de terceros, CSS no usado.
4. Re-medir y reportar antes/después. Si un arreglo exige cambiar de plataforma, decirlo y dar la alternativa incremental.

## Verificación (no se entrega sin esto)

```bash
npm run build
node scripts/check-budget.mjs dist          # JS/CSS/imágenes/fuentes, LCP, CLS básicos
node scripts/contrast.mjs "#texto/#fondo" "#texto2/#acento" …   # cada par de la paleta, AA
npx astro preview &                         # servir dist
npx lhci autorun --config=lighthouserc.json # Lighthouse móvil, 3 corridas
```

Criterio: Performance ≥ 90 móvil (objetivo 95+), Accessibility/Best Practices/SEO ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms. Si no se cumple: identificar el audit que falla, simplificar el recurso o efecto responsable y repetir. Si no hay red o Chrome para ejecutar Lighthouse, decirlo explícitamente, entregar el resultado de `check-budget.mjs` y los comandos pendientes; **no afirmar scores que no se midieron**.

## Reglas innegociables

1. **HTML estático/SSG** para todo contenido; JS por defecto = 0 KB. Interactividad vía islas (`client:visible`/`client:idle`) o scripts inline diminutos. Presupuesto de JS inicial ≤ 70 KB gzip.
2. **El elemento LCP nunca arranca invisible ni animado.** El H1 o la imagen del hero se pintan en el primer frame.
3. **Máximo 2 familias tipográficas**, autoalojadas en WOFF2 subset, 1 sola precargada. Tagline monoespaciado con la pila del sistema.
4. **Imágenes locales y optimizadas** (AVIF/WebP, `srcset`, `width`/`height`). Prohibido hotlinkear Unsplash en producción.
5. **Animar solo `transform` y `opacity`.** Sin `filter: blur` animado, sin animar propiedades que reflowean. Respetar `prefers-reduced-motion`; el contenido es visible sin animaciones.
6. **GSAP solo como excepción**, con `import()` dinámico al entrar en viewport.
7. **Terceros** (GA4, Pixel, GTM, chat) fuera del camino crítico: tras interacción o en idle; medir Lighthouse con y sin ellos.
8. **Accesibilidad medida, no supuesta:** contraste AA verificado con `contrast.mjs`, foco visible, objetivos táctiles ≥ 44 px, semántica nativa.
9. **No prometer un score.** Se promete un presupuesto y una medición; el resultado depende del hosting, del contenido y de la corrida.

## Protocolo de vigencia (las reglas cambian)

Cada guía de `references/` lleva su **fecha de última verificación**, un plazo de revalidación y, al final, una tabla de **fuentes** con el estado de cada afirmación (✔ leída en la fuente primaria, ◐ solo en fuentes secundarias, ○ no recuperada).

1. Al empezar un trabajo, ejecutar `node scripts/check-freshness.mjs .` (desde la carpeta de la skill). Si alguna guía figura **vencida**, revalidar antes de aplicarla.
2. Antes de aplicar una regla marcada ◐ u ○ y sensible al tiempo, **confirmarla en la fuente primaria enlazada** si hay búsqueda web disponible. Si cambió, aplicar lo vigente y decírselo al usuario.
3. Sin búsqueda web: aplicar la guía y decir explícitamente "regla no reverificada hoy". No presentar como vigente algo que no se pudo confirmar.
4. Tras revalidar, actualizar en la guía la fecha de `Última verificación` y el estado de la fila; no cambiar la fecha sin haber confirmado.

**Reglas especialmente volátiles aquí:** pesos y umbrales de Lighthouse, umbrales de Core Web Vitals, versiones y método de instalación de Astro y Tailwind, y compatibilidad de CSS moderno (`animation-timeline`).

## Templates y destinos

| Template | Ruta en el proyecto Astro | Función |
|---|---|---|
| `templates/astro.config.mjs` | `astro.config.mjs` | Astro estático + Tailwind v4 + sitemap |
| `templates/global.css` | `src/styles/global.css` | Tokens, fuentes autoalojadas, movimiento seguro, utilidades |
| `templates/_headers` | `public/_headers` | Caché y seguridad (Cloudflare Pages/Netlify) |
| `templates/lighthouserc.json` | `lighthouserc.json` | Lighthouse CI móvil con umbrales |

Reemplazar todos los marcadores `TODO` (colores, rutas de fuentes, métricas del fallback) antes de publicar.

## Relación con las otras skills

- El texto, el JSON-LD y la FAQ que se maquetan aquí los define `web-discoverability`. Esta skill solo garantiza que se rendericen sin costo: el H1 contiene servicio + lugar, la frase de entidad es visible, la FAQ usa `<details>`.
- Para un sitio completo desde cero, empezar por `cinematic-fast-web`, que coordina ambas y ensambla el `<head>`.

## Archivos de la skill

- `references/stack-performance.md` — stack, cálculo del score, presupuesto, LCP/TBT/CLS, fuentes, imágenes, JS, terceros, hosting, diagnóstico.
- `references/sistema-visual.md` — secciones cinematográficas en CSS-first y accesibilidad/contraste.
- `references/ux-ui.md` — convenciones de UX/UI: jerarquía, CTA, formularios, móvil, confianza, estados.
- `templates/` — `astro.config.mjs`, `global.css`, `_headers`, `lighthouserc.json`.
- `scripts/check-budget.mjs` — presupuesto de performance del build (sin dependencias).
- `scripts/contrast.mjs` — contraste WCAG entre pares de colores.
- `scripts/check-freshness.mjs` — avisa qué guías superaron su plazo de revalidación.
