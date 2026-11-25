# Fase 5.2 — Resto de secciones · pipeline fase 2

**Objetivo:** Construir las demás secciones del diseño de Stitch con HTML semántico y CSS ligero.

Aprobado el hero. Construye ahora las demás secciones del diseño de Stitch en el orden de las pantallas: servicios, cómo funciona, manifiesto/diferenciales, cobertura, FAQ y cierre con footer.

Reglas:
- Usa web-performance-design (references/sistema-visual.md y ux-ui.md) como guía de implementación de efectos: sticky stack con position: sticky, dashboards animados con keyframes CSS, revelado con animation-timeline bajo @supports. Nada de GSAP salvo que algo sea imposible en CSS; si lo propones, justifícalo y mide su costo.
- La FAQ usa el componente templates/FAQ.astro con <details> y se alimenta de faqs en business.ts (misma fuente que el JSON-LD).
- Un solo <main>, un solo H1, cada <section> con heading o aria-labelledby, imágenes con alt, y ningún texto crítico renderizado por JavaScript.
- Todo texto sale de docs/contenido.md y business.ts; si algo falta, usa TODO_ y avísame.
- Cada 2 secciones ejecuta check-budget.mjs y muéstrame la salida.

Al final, entrégame la tabla "Elemento de Stitch → Implementación → Cambios" completa y la lista de cualquier diferencia respecto del diseño con su motivo.
