---
name: web-discoverability
description: SEO técnico, AEO y GEO en una sola skill, para que un sitio sea encontrado por Google y citable por buscadores con IA (ChatGPT Search, Perplexity, Gemini, AI Overviews, Claude). Aplica Google Search Essentials, estructura HTML semántica, datos estructurados JSON-LD (LocalBusiness/Organization, Service, FAQPage), FAQ, copy con arco narrativo de 11 pasos y frase de entidad, cobertura geográfica, robots.txt para rastreadores de IA, sitemap, llms.txt y auditoría automática del build. Usar al escribir o corregir contenido, marcado e indexabilidad de una landing o sitio (local o no), al auditar un sitio existente, o cuando el usuario mencione SEO, SEO local, AEO, GEO, JSON-LD, schema, FAQ, canonical, sitemap, robots.txt, Search Console, "que Google me encuentre" o "que la IA me recomiende". No cubre diseño visual ni velocidad de carga (ver web-performance-design).
---

# Web Discoverability — SEO + AEO + GEO

Hace que un sitio sea **rastreable, indexable, comprensible y citable**. SEO, AEO y GEO se tratan como una sola disciplina porque comparten los mismos activos (HTML estático, JSON-LD, FAQ, `robots.txt`, datos del negocio). Separarlos produce marcado duplicado y reglas contradictorias.

## Alcance

| Esta skill cubre | Otra skill cubre |
|---|---|
| Guía de Google (rastreo, indexación, snippets, mobile-first, spam) | Stack, Lighthouse, Core Web Vitals, imágenes, fuentes → `web-performance-design` |
| HTML semántico: headings, landmarks, enlaces, FAQ | Diseño visual, UX/UI, animaciones, contraste → `web-performance-design` |
| JSON-LD, NAP, cobertura geográfica, frase de entidad | Entrevista creativa, blueprint y ensamblado de un sitio completo → `cinematic-fast-web` |
| `robots.txt`, sitemap, `llms.txt`, rastreadores de IA | |

## Cuándo usar

- Construir la capa de contenido/marcado de un sitio nuevo (normalmente invocada por `cinematic-fast-web`).
- **Auditar o arreglar un sitio existente** (WordPress, Wix, a medida): ver modo Auditar.
- Escribir el copy de una landing local o de servicios con estructura AEO.
- Revisar JSON-LD, FAQ, canonical, robots, sitemap o accesibilidad de rastreadores de IA.

## Modos

### Modo Construir
1. **Datos:** si no están, hacer la entrevista de `references/intake-datos.md`. Nunca inventar NAP, años, garantías, calificaciones ni tiempos.
2. **Fuente única:** crear `src/data/business.ts` (template `business.example.ts`). De ahí salen el HTML, el footer, el link de WhatsApp, el JSON-LD y la FAQ.
3. **Redactar** con `references/aeo-geo.md`: frase de entidad (25–40 palabras), arco de 11 pasos, cobertura geográfica, FAQ de 5 a 8 preguntas.
4. **Marcar** con `schema.ts` (un único `@graph` en `<head>`) y `FAQ.astro` (`<details>` nativos, 1:1 con el JSON-LD).
5. **Rastreo:** `robots.txt`, sitemap, canonical, `llms.txt` opcional (`references/google-seo.md`).
6. **Verificar:** `node scripts/check-seo.mjs dist` hasta 0 errores. Pasos post-deploy en `references/google-seo.md` §10.

### Modo Auditar (sitio existente, sin build propio)
1. Obtener el HTML real de cada página clave (`web_fetch`, o `curl -sL`) **tal como lo recibe un bot**: sin ejecutar JS. Si el contenido principal no está en ese HTML, es el hallazgo nº 1.
2. Recorrer el checklist de `references/google-seo.md` (head, headings, landmarks, enlaces, canonical, mobile-first, datos estructurados, spam).
3. Extraer y validar el JSON-LD: tipos, campos requeridos, paridad con el contenido visible, duplicados, `aggregateRating` propio, `geo`, NAP.
4. Revisar `robots.txt` y sitemap; probar acceso de rastreadores de IA: `curl -A "OAI-SearchBot" -I https://dominio/` (debe dar 200; un 403 indica bloqueo de CDN/WAF).
5. Entregar un informe priorizado: **Crítico** (impide indexar o citar), **Alto**, **Medio**, **Bajo**, con la corrección concreta de cada ítem. Si se pide arreglarlo, aplicar los cambios sobre el sitio del usuario, no sobre uno nuevo.
6. Si hay un build estático local, correr `check-seo.mjs` sobre él.

## Reglas innegociables

1. **El contenido crítico vive en el HTML inicial.** Los rastreadores de IA medidos no ejecutan JavaScript; Google sí, pero con retraso. Sin renderizado cliente para texto, FAQ ni enlaces.
2. **Un `<h1>`, headings secuenciales, un `<main>`, secciones con heading, enlaces `<a href>`, anclas descriptivas, `lang` correcto, `alt` en imágenes.**
3. **JSON-LD una sola vez**, en `<head>`, generado desde `business.ts`, idéntico a lo visible. Sin microdata duplicado. `name` real sin keywords; `geo` con ≥ 5 decimales; sin `aggregateRating` ni reseñas propias.
4. **FAQ de 5 a 8 preguntas**, `<details>/<summary>`, respuesta idéntica a `acceptedAnswer.text`, < 50 palabras, autocontenible. Los resultados enriquecidos de FAQ se eliminaron el 7 de mayo de 2026: se mantiene por utilidad al usuario, sin prometer efecto en Google.
5. **No inventar datos** ni claims: todo valor factual viene del cliente.
6. **No bloquear CSS, JS ni imágenes**; `robots.txt` no desindexa (para eso, `noindex`). Verificar que el CDN/WAF no bloquee rastreadores de IA.
7. **No prometer ranking ni citación.** Google indica que no hay marcado ni archivo especial que garantice aparecer en sus funciones de IA; se maximiza elegibilidad y claridad.
8. **Validar con las herramientas vigentes:** validator.schema.org para sintaxis; Rich Results Test solo para tipos con resultado enriquecido (no FAQ).

## Protocolo de vigencia (las reglas cambian)

Cada guía de `references/` lleva su **fecha de última verificación**, un plazo de revalidación y, al final, una tabla de **fuentes** con el estado de cada afirmación (✔ leída en la fuente primaria, ◐ solo en fuentes secundarias, ○ no recuperada).

1. Al empezar un trabajo, ejecutar `node scripts/check-freshness.mjs .` (desde la carpeta de la skill). Si alguna guía figura **vencida**, revalidar antes de aplicarla.
2. Antes de aplicar una regla marcada ◐ u ○ y sensible al tiempo, **confirmarla en la fuente primaria enlazada** si hay búsqueda web disponible. Si cambió, aplicar lo vigente y decírselo al usuario.
3. Sin búsqueda web: aplicar la guía y decir explícitamente "regla no reverificada hoy". No presentar como vigente algo que no se pudo confirmar.
4. Tras revalidar, actualizar en la guía la fecha de `Última verificación` y el estado de la fila; no cambiar la fecha sin haber confirmado.

**Reglas especialmente volátiles aquí:** qué resultados enriquecidos mantiene o retira Google, requisitos de las funciones de IA de Google, nombres y comportamiento de los rastreadores de IA (OpenAI, Anthropic, Perplexity, Apple), y si los motores usan `llms.txt`.

## Templates y destinos

| Template | Ruta en el proyecto Astro | Función |
|---|---|---|
| `templates/business.example.ts` | `src/data/business.ts` | Fuente única de NAP, servicios, zonas y FAQ |
| `templates/schema.ts` | `src/lib/schema.ts` | Genera el `@graph` JSON-LD |
| `templates/FAQ.astro` | `src/components/FAQ.astro` | FAQ visible 1:1 con el JSON-LD |
| `templates/robots.txt` | `public/robots.txt` | Permisos de rastreo, incl. IA |
| `templates/llms.txt` | `public/llms.txt` | Opcional; no es factor de ranking |

Estos templates asumen Astro. Para otro stack, conservar la lógica (fuente única → HTML + JSON-LD + FAQ) y portar el código. El `<head>` completo (title, canonical, og, JSON-LD) lo ensambla `BaseLayout.astro` de `cinematic-fast-web`.

## Relación con las otras skills

- Para **construir el sitio visual** o **mejorar su velocidad**, usar `web-performance-design`. Los comandos de auditoría de performance (`check-budget.mjs`, Lighthouse) viven allí.
- Para **un sitio completo desde cero**, empezar por `cinematic-fast-web`, que coordina ambas.
- Si el sitio es lento o pesado por razones de contenido (imágenes enormes, widgets), señalarlo en el informe y derivarlo a `web-performance-design`.

## Archivos de la skill

- `references/google-seo.md` — checklist técnico de Google (head, estructura, rastreo, mobile-first, datos estructurados, spam, Search Console). Incluye fuentes y estado de verificación.
- `references/aeo-geo.md` — frase de entidad, arco de 11 pasos, cobertura, FAQ, JSON-LD, crawlers de IA, `llms.txt`, redacción.
- `references/intake-datos.md` — entrevista de datos reales (bloques 9 y 10).
- `templates/` — `business.example.ts`, `schema.ts`, `FAQ.astro`, `robots.txt`, `llms.txt`.
- `scripts/check-seo.mjs` — auditor estático de SEO/AEO/GEO sobre el build (sin dependencias).
- `scripts/check-freshness.mjs` — avisa qué guías superaron su plazo de revalidación.
