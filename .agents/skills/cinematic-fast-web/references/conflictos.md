# Conflictos entre las skills de origen y cómo se resuelven

Cada fila explica un cambio respecto a las skills originales. Si el usuario pide expresamente lo "viejo", advertir el costo antes de hacerlo.

| # | Skill origen | Qué decía | Problema | Resolución en esta skill |
|---|---|---|---|---|
| 1 | landing-cinematica | Vite + React 19 SPA | Contenido renderizado en cliente: HTML inicial vacío (malo para GEO/AEO), hidratación y bundle suben TBT y LCP | Astro (HTML estático). React solo como isla si un componente realmente lo necesita |
| 2 | landing-cinematica | GSAP + ScrollTrigger para todo | JS en main thread → TBT (30 % del score); animaciones que ocultan texto hasta que corre JS | CSS-first: scroll-driven animations (`animation-timeline`) como mejora progresiva, transiciones CSS y un `IntersectionObserver` inline. GSAP solo si algo no se puede hacer en CSS, cargado perezosamente |
| 3 | landing-cinematica | 4 familias de Google Fonts por `<link>` | Peticiones a terceros, bloqueo de render, CLS por swap | Máx. 2 familias autoalojadas WOFF2, 1 precargada, fallback con `size-adjust` |
| 4 | landing-cinematica | Imágenes Unsplash hotlinkeadas a 2600 px | LCP pesado, dependencia externa, sin AVIF/srcset | Descargar en build, `astro:assets` (AVIF/WebP, `srcset`, dimensiones) |
| 5 | landing-cinematica | Ruido SVG `feTurbulence` en `body` | Repintado costoso en móvil | Tile de ruido pre-renderizado (WebP ≤ 4 KB) como `background-image` en una capa fija con `pointer-events:none`, o prescindir |
| 6 | landing-cinematica | `blur(20px)` + scale en sticky stack | `filter` animado = capas GPU grandes, jank | Solo `transform` y `opacity` |
| 7 | landing-cinematica | Dashboard con JS que cicla texto | Texto no está en el HTML inicial; JS extra | Keyframes CSS con todo el texto en el DOM |
| 8 | local-seo-aeo | FAQ con microdata (`itemscope`) **y** JSON-LD | Duplicación de marcado; riesgo de inconsistencias | Solo JSON-LD; FAQ visible con `<details>` generada desde la misma fuente de datos |
| 9 | local-seo-aeo | JSON-LD al final del body | Válido, pero el criterio de la GEO skill (head) es más claro | JSON-LD en `<head>`, inyectado en build |
| 10 | local-seo-aeo | Badge "Respuesta < 5 min", "4.9★", "X años" como ejemplos | Riesgo de inventar claims; calificaciones propias en schema violan las políticas de datos estructurados de Google | Solo datos verificados provistos por el cliente; nunca `aggregateRating` autopromocional |
| 11 | local-seo-aeo | Hero con blockquote AEO tras el H1 | Compatible con el hero cinematográfico si se diseña bien | Se mantiene: H1 en 2 tipografías (Sans + Serif itálica con `<span>`), debajo la frase de entidad visible (no oculta) |
| 12 | geo-optimization | Lista `Google-Extended`, `Applebot`… todo con `Allow: /` | `Google-Extended` y `Applebot-Extended` son *tokens de control* de uso para entrenamiento, no rastreadores; AI Overviews/AI Mode dependen de Googlebot | Se documenta la diferencia en `aeo-geo.md`; se mantiene `Allow` explícito para auditoría |
| 13 | geo-optimization | Patrón "primera frase" de 20–30 palabras bajo H2/H3 solo en contenido largo | Choca en apariencia con la frase AEO del hero | Hero = frase AEO (25–40 palabras). Resto de H2 y FAQ = respuesta directa en la primera frase |
| 14 | guía de Google | Foco en SEO clásico y video schema | Útil pero no cubre performance ni IA | Se destila lo aplicable (`google-seo.md`); `VideoObject` solo si hay video real como contenido principal |
| 15 | Todas | `llms.txt` implícito en el plan previo | Google indica que no lo necesita para AI Overviews; su uso por otros LLMs no está confirmado | Opcional y barato (un archivo estático); no se vende como palanca de ranking |
| 16 | Guía técnica Syntropy (Sep 2026) | "Google eliminó FAQPage (mayo/junio 2026)" con fechas inconsistentes en el mismo documento | Fecha primaria: 7 de mayo de 2026 (rich results); junio (informe y Rich Results Test); agosto (API) | Corregido en `aeo-geo.md` y `google-seo.md`; el Rich Results Test ya no sirve para validar FAQ |
| 17 | Guía técnica Syntropy | Checklist: "¿Validado en Rich Results Test?" aplicado a todo el JSON-LD | Para FAQ ya no valida | Se valida con validator.schema.org; Rich Results Test solo para tipos con resultado enriquecido vigente |
| 18 | Guía técnica Syntropy | Contrastes de ejemplo (`#128C7E` = 5.0:1, `#0d6efd` = 4.7:1, `#1a1a2e` = 16.8:1) | Medidos: 4.14:1 (falla AA), 4.50:1, 17.06:1 | Se agrega `scripts/contrast.mjs`; la skill obliga a medir cada par de la paleta |
| 19 | Guía técnica Syntropy | "Pasajes autocontenibles = +40 % visibilidad (Princeton/KDD 2024)" | El paper midió citas, estadísticas y fuentes, no pasajes autocontenibles | La práctica se mantiene como buena redacción; se corrige la atribución y se agrega el uso de estadísticas/fuentes reales |
| 20 | Guía técnica Syntropy | "69 % de bots IA sin JavaScript" | Sin fuente primaria verificable; el estudio de referencia es Vercel/MERJ (dic. 2024) | Conclusión adoptada (HTML estático), cifra no citada |
| 21 | Guía técnica Syntropy | "Toda imagen DEBE ser .webp" | Excluye AVIF, que suele pesar menos | WebP **o** AVIF (y SVG para vectores); alternativa solo-WebP si el cliente lo exige |
| 22 | Guía técnica Syntropy | Vanilla HTML5 + CSS + JSON-LD | Compatible: Astro emite exactamente eso | Sin conflicto; el build es HTML estático sin JS por defecto |
| 23 | Guía técnica Syntropy | FAQ con `<h3>` dentro de `<summary>`, 5–8 preguntas, `geo` ≥ 5 decimales, `name` sin keywords, og:url = canonical, un solo `<main>`, `<section>` con heading | Todo correcto y verificable | Adoptado en templates, referencias y `check-seo.mjs` |
| 24 | Guía técnica Syntropy | Taxonomía de bots sin `Claude-SearchBot`, `Claude-User`, `Perplexity-User`, `Applebot` | Incompleta para citación | Se conserva la lista ampliada de `aeo-geo.md`; se incorpora que `ChatGPT-User` puede no respetar robots.txt |
