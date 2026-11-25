# Fase 7 — QA y medición (Antigravity) · pipeline fase 4

**Objetivo:** Probar con instrumentos, no con impresiones.

Activa cinematic-fast-web (verificación conjunta).

Ejecuta, en este orden, y muéstrame la salida real de cada comando:
1. npm run build
2. node scripts/check-seo.mjs dist
3. node scripts/check-budget.mjs dist
4. node scripts/contrast.mjs con cada par texto/fondo de la paleta, incluidos hover, foco y texto sobre imágenes
5. npx astro preview y luego npx lhci autorun --config=lighthouserc.json (Lighthouse móvil, 3 corridas)

Después entrégame un informe en una tabla con: métrica, umbral, resultado medido, estado, causa probable y arreglo propuesto. Umbrales: Performance >= 90 móvil (objetivo 95+), Accessibility/Best Practices/SEO >= 95, LCP <= 2.5 s, CLS <= 0.1, TBT <= 200 ms.

Si algo falla: diagnostica el audit responsable, simplifica el recurso o efecto (nunca el presupuesto) y repite. Máximo 3 ciclos; si no se resuelve, detente y explícame la causa.
Si Chrome o la red no están disponibles, dilo expresamente, entrega lo medido y los comandos pendientes. No estimes ni declares scores no medidos.