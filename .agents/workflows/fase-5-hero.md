# Fase 5.1 — Construcción: de Stitch a Astro (Hero primero) · pipeline fase 2

**Objetivo:** reproducir el diseño de Stitch con HTML semántico, CSS ligero y presupuesto de performance.

> **Cuándo se usa Stitch y cuándo la skill decide el diseño:** Si hay diseño de Stitch aprobado, **Stitch define la composición visual** (layout, jerarquía, estilo) y las skills imponen las reglas técnicas. Si no hay diseño, `web-performance-design` aplica su sistema visual por defecto (hero, dashboard, manifiesto, sticky stack, planes, footer).

Activa web-performance-design (dentro de cinematic-fast-web).

Contexto: el diseño aprobado está en design/stitch/ (capturas, DESIGN.md y HTML exportado) y puedes consultarlo también por el MCP de Stitch. El contenido aprobado está en docs/contenido.md y los datos en src/data/business.ts.

IMPORTANTE: el HTML de Stitch es REFERENCIA VISUAL. No lo copies como código de producción.

Tarea (solo el scaffold y el HERO):
1. Haz el scaffold con Astro y Tailwind v4 siguiendo references/stack-performance.md. Verifica las versiones al instalar; no las fijes de memoria.
2. Traduce DESIGN.md a tokens en src/styles/global.css (@theme): 4 colores de marca, máximo 2 familias tipográficas autoalojadas, radios y espaciado. Mide con scripts/contrast.mjs cada par de colores texto/fondo y texto/acento y muéstrame los ratios; si alguno falla AA, propón el ajuste más pequeño.
3. Construye src/layouts/BaseLayout.astro (template de cinematic-fast-web) y el hero a partir del diseño: H1 con servicio y lugar, frase de entidad visible, CTA como <a href>, navegación semántica.
4. Reemplaza cualquier cosa del HTML de Stitch que viole las reglas de web-performance-design. En particular, si aparece:
   - script CDN de Tailwind, fuentes remotas o imágenes por URL externa: sustitúyelos por Tailwind compilado, fuentes autoalojadas en WOFF2 (subset latin, una sola precargada) e imágenes locales AVIF/WebP con width/height;
   - JavaScript para animar: conviértelo a CSS (transform/opacity) como mejora progresiva con prefers-reduced-motion;
   - <div> con role="button" o enlaces sin href: usa elementos nativos.
5. El elemento LCP (H1 o imagen del hero) no puede arrancar invisible ni animado.
6. Ejecuta npm run build, node scripts/check-budget.mjs dist y, si hay Chrome disponible, Lighthouse móvil sobre el preview. Muéstrame la salida real.
7. Entrégame una tabla "Elemento de Stitch → Implementación → Cambios por performance/accesibilidad".

Detente al terminar el hero y espera mi aprobación antes de construir el resto.