# Fase 6 — Inyección técnica SEO/GEO (Antigravity) · pipeline fase 3

**Objetivo:** Marcado, rastreo y semántica, verificados con script.

Activa web-discoverability.

Tarea: completa la capa técnica del sitio y verifícala.
1. Genera el JSON-LD con templates/schema.ts desde business.ts, en un único @graph dentro del <head> (LocalBusiness o subtipo específico si el modo es local; Organization si es general; Service por servicio; WebSite; WebPage; FAQPage). Nada de microdata duplicado.
2. Revisa que el texto visible de la FAQ sea idéntico a acceptedAnswer.text.
3. Confirma name real (sin keywords), geo con 5 decimales como mínimo si se incluye, y que NO exista aggregateRating ni review propios.
4. Crea public/robots.txt y public/llms.txt (opcional) desde los templates, con la URL real del sitemap; confirma que el sitemap se genera.
5. Verifica title, meta description, canonical (y que og:url sea idéntica), lang, jerarquía de headings y landmarks.
6. Ejecuta node scripts/check-seo.mjs dist y muéstrame la salida completa. Corrige los errores y repite (máximo 3 ciclos). Los avisos explícalos uno por uno: cuáles aplicas y cuáles descartas y por qué.

No afirmes que algo "cumple" sin la salida del script. Si una regla de Google o de los rastreadores de IA está marcada ◐ u ○ en la guía y es sensible al tiempo, confírmala en la fuente primaria o dime "regla no reverificada hoy".