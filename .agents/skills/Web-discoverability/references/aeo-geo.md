# AEO + GEO: contenido, estructura y datos para buscadores con IA

> **Última verificación:** 2026-10-21 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Unifica `local-seo-aeo-landing-page-writer` (qué se escribe) y `geo-optimization` (cómo se inyecta y sirve) en una sola referencia. Reparto de responsabilidades:

- **Esta referencia / copy:** frase de entidad, arco narrativo, FAQ, cobertura.
- **Código:** JSON-LD generado una sola vez desde `business.ts` (`templates/schema.ts`), HTML estático, robots/sitemap.

## Contenido

1. Qué se sabe y qué no (honestidad sobre IA)
2. Frase de entidad AEO
3. Arco narrativo de 11 pasos (modo local y general)
4. Cobertura geográfica
5. FAQ semántica
6. JSON-LD
7. Crawlers de IA y robots.txt
8. llms.txt
9. Reglas de redacción

## 1. Qué se sabe y qué no

- **Google (AI Overviews / AI Mode):** indica que no hace falta marcado especial ni `llms.txt`; cuentan el contenido útil, rastreable e indexado y la experiencia de página. El marcado estructurado sigue siendo recomendado para entender el contenido, siempre que coincida con lo visible.
- **FAQ rich results: eliminados el 7 de mayo de 2026** (para todos los sitios; antes, desde 2023, solo gobierno/salud). En junio de 2026 se retiraron también el informe de Search Console y el soporte del Rich Results Test para FAQ; la API de Search Console, en agosto. `FAQPage` sigue siendo un tipo válido de Schema.org y Google indica que no hace falta quitarlo. Se mantiene aquí como marcado descriptivo de contenido visible para otros motores; **no** se promete ningún efecto en Google y no hay documentación pública de que algún motor de IA lo pondere.
- **Rastreadores de IA y JavaScript:** el estudio de Vercel/MERJ (dic. 2024) midió que `GPTBot`, `ClaudeBot` y `PerplexityBot` descargan archivos JS pero no los ejecutan; `Googlebot` sí renderiza. Algunas cifras que circulan (p. ej. "69 % de los bots") no tienen fuente primaria verificable, y hay un reporte aislado, sin confirmar, de que OpenAI habría empezado a renderizar en 2025. La conclusión práctica no cambia: **todo el contenido crítico va en el HTML estático**.
- **Evidencia de GEO:** el paper de Princeton/IIT Delhi (KDD 2024) midió mejoras de visibilidad de hasta ~40 % al agregar **citas textuales de fuentes, estadísticas y referencias a fuentes**. No midió "pasajes autocontenibles" como tal; esa práctica es razonable (un pasaje que depende del anterior no se puede citar) pero no está respaldada por ese paper.
- Nadie puede garantizar citación. El entregable es **elegibilidad y claridad**, no una promesa.

## 2. Frase de entidad AEO

Una frase declarativa, factual, de **25–40 palabras**, sin superlativos ni marketing, que responde: *¿qué es [negocio], qué hace exactamente y dónde/para quién?*

Plantilla modo local:
> [Negocio] es un servicio profesional de [rubro] en [ciudad], especializado en [servicio 1 y servicio 2] para [hogares/empresas], con cobertura en [zona 1, zona 2, zona 3] y atención [horario].

Plantilla modo general:
> [Marca] es [categoría] que ofrece [servicio/producto principal] a [público] en [país/región], con [dato diferencial verificable].

Va **visible**, inmediatamente tras el H1, en un `<blockquote class="aeo-entity">` o `<p>`. Estilizable (tamaño moderado, color atenuado) pero nunca oculta ni con `display:none`.

## 3. Arco narrativo de 11 pasos

Orden obligatorio; cada paso es una sección del sitio. Entre paréntesis, la sección equivalente del sistema visual de la skill `web-performance-design` cuando el sitio se construye con ella.

1. **Hero** (portada): H1 = servicio principal + ciudad/zona (local) o propuesta + categoría (general); frase de entidad; micro-badge de SLA **solo si es real**; CTA primario (WhatsApp con texto prellenado, o el CTA de marca) + CTA secundario (llamar); 3 pruebas reales (años, garantía escrita, calificación) **solo con datos provistos**.
2. **Problema**: la fricción típica del cliente en ese contexto (demoras, presupuestos que cambian, informalidad). (Manifiesto, parte "sector convencional".)
3. **Solución**: el negocio como respuesta confiable y transparente. (Manifiesto, contrapropuesta.)
4. **Servicios como beneficios medibles**: cada servicio con el resultado concreto para el cliente, no jerga técnica. (Sticky stack + dashboard.)
5. **Cobertura geográfica explícita** *(modo local)*: lista de barrios/zonas, ver §4.
6. **Bloque de conversión intermedio**: CTA secundario orientado a presupuesto rápido.
7. **Cómo funciona** (3 pasos): contactar → diagnóstico/presupuesto claro → servicio con garantía. Lista `<ol>`. (Puede mapearse al "protocolo semanal".)
8. **Por qué elegirnos**: comparación con alternativas informales, tabla HTML o lista (puntualidad, factura/garantía, presupuesto cerrado), con datos verificables.
9. **FAQ** (mín. 5), ver §5.
10. **Señales de confianza y NAP**: dirección, teléfono, horarios, enlace a Google Maps / perfil, certificaciones, garantías. Idéntico a Google Business Profile.
11. **Cierre de conversión**: mensaje de urgencia honesto + botón principal. (Planes/Newsletter + Footer.)

En **modo general**, el paso 5 se sustituye por "Casos, resultados o ámbito de servicio" y el 10 por "Datos de la organización y contacto".

## 4. Cobertura geográfica (ancla vectorial para consultas "cerca de mí" / "[barrio]")

```html
<section aria-labelledby="cobertura">
  <h2 id="cobertura">Zonas de atención en [Ciudad]</h2>
  <p>[Negocio] atiende en [Ciudad] y su área metropolitana, con presupuesto sin cargo en:</p>
  <ul>
    <li><strong>[Barrio/Zona]:</strong> [detalle o tiempo estimado real]</li>
    …
  </ul>
</section>
```
Solo zonas realmente atendidas. Nunca crear páginas con zonas inventadas ("doorway pages"): va contra las políticas de spam de Google. Si el negocio sirve varias ciudades con contenido genuinamente distinto, evaluar una página por ciudad con contenido único.

## 5. FAQ semántica

- **5 a 8 preguntas** por página (calidad > cantidad). Cubrir: cobertura exacta, tiempo de llegada/respuesta, precios/presupuestos, garantías/habilitaciones, atención fuera de horario/feriados (adaptar en modo general: alcance, plazos, precios, soporte, cancelación).
- Pregunta en forma de pregunta real de un cliente (Problema = Respuesta); respuesta real, sin keyword stuffing.
- Respuesta **< 50 palabras**, **autocontenible** (un bot puede citarla sin leer nada más), primera frase = respuesta directa, nombra `[Negocio]` y `[Ubicación]`. Con datos concretos cuando existan (rangos de precio reales, horarios, matrícula/habilitación).
- Render: `<details><summary>` nativos, **sin JS**. La pregunta puede ir como `<h3>` dentro de `<summary>` (válido en HTML) para que entre al árbol de headings; trade-off: algunos lectores de pantalla no exponen un heading dentro de un control desplegable, por eso `FAQ.astro` tiene `asHeading`.
- **Paridad estricta:** el `<p>` de cada respuesta es *idéntico* al `acceptedAnswer.text` del JSON-LD. Ambos se generan desde `faqs[]` (`templates/FAQ.astro` + `schema.ts`); `check-seo.mjs` lo verifica.
- Los bots sin JS leen el HTML, no solo el JSON-LD: el contenido de la FAQ debe estar en el DOM estático.

## 6. JSON-LD

Un solo bloque `<script type="application/ld+json">` con `@graph`, en el `<head>`, generado por `schema.ts` desde `business.ts`.

**Modo local**
- `LocalBusiness` o subtipo más específico (`Plumber`, `Electrician`, `Dentist`, `HVACBusiness`, `RoofingContractor`, `HairSalon`, `Restaurant`, `LegalService`, etc.). Campos: `@id`, `name`, `url`, `logo`, `image`, `telephone`, `priceRange`, `address` (`PostalAddress`), `geo` (`GeoCoordinates`), `openingHoursSpecification`, `areaServed`, `sameAs` (Google Maps, redes), `hasMap`.
- `Service` por servicio principal (`provider` → el `@id` del negocio, `areaServed`, `description`; `offers` solo con precios reales).
- `FAQPage`.
- `WebSite` + `WebPage` con `@id` consistentes. `BreadcrumbList` si hay jerarquía.

**Modo general**: `Organization` (o `Person` si es profesional independiente), `WebSite`, `Service`/`Product`, `FAQPage`.

**Requeridos y recomendados (Google, `LocalBusiness`)**: requeridos `@context`, `@type`, `name`, `address`. Recomendados: `geo`, `telephone`, `url`, `openingHoursSpecification`, `image` (idealmente 3 proporciones: 1:1, 4:3, 16:9), `priceRange`.

**Reglas**
- `name` = nombre real del negocio, **sin keywords** ("Electricista Barato 24hs" prohibido). La descripción es factual (años, habilitaciones verificables), no una lista de palabras clave. La ciudad se define una vez en `address`; `areaServed` usa `City` para la ciudad y `AdministrativeArea` para zonas/barrios.
- `@type` = el subtipo más específico de `LocalBusiness` que exista.
- `geo`: coordenadas reales con **≥ 5 decimales**.
- Todo lo marcado debe estar visible en la página y coincidir exacto (NAP, horarios, preguntas/respuestas). Si se publica `dateModified`/`datePublished`, la fecha debe coincidir en el texto visible, en `<time datetime>` y en el JSON-LD.
- No marcar contenido inexistente. No incluir `aggregateRating`/`review` propios sobre el propio negocio (Google no los admite como rich result y puede considerarlo marcado engañoso).
- `geo` solo con coordenadas reales; `openingHoursSpecification` con los horarios reales; `priceRange` real.
- Escapar `<` como `\u003c` al serializar (ya lo hace `BaseLayout.astro` de la skill `cinematic-fast-web`).
- Validar tras el deploy con **validator.schema.org** (sintaxis y tipos) y el Rich Results Test (para los tipos que aún tienen resultado enriquecido, p. ej. `LocalBusiness`/`Organization`). **El Rich Results Test ya no valida FAQ**: no usarlo como criterio de aprobación para `FAQPage`. `check-seo.mjs` comprueba parseo, tipos, `@id` duplicados, decimales de `geo` y paridad FAQ↔HTML.

## 7. Crawlers de IA y robots.txt

Distinguir tres tipos de agente:

| Tipo | Ejemplos | Ejecuta JS | Efecto de permitir |
|---|---|---|---|
| Rastreadores de **búsqueda/citación** | `OAI-SearchBot` (ChatGPT Search), `PerplexityBot`, `Claude-SearchBot`, `Googlebot` (alimenta Google Search, AI Overviews y AI Mode), `Applebot` (Siri/Spotlight) | Googlebot sí; los demás, según las mediciones disponibles, no | Necesarios para aparecer y ser citado |
| Agentes **a pedido del usuario** | `ChatGPT-User`, `Perplexity-User`, `Claude-User` | No (según mediciones) | Leen tu página cuando alguien pide a la IA que la consulte. Atención: como los dispara una persona, **robots.txt puede no aplicarles** |
| Rastreadores de **entrenamiento** / tokens de control | `GPTBot`, `ClaudeBot` (crawlers); `Google-Extended`, `Applebot-Extended` (**tokens**, no crawlers) | n/a para los tokens | Decisión del dueño del sitio. Bloquear los tokens **no afecta el ranking en Google Search** |

Política por defecto (negocio que quiere máxima visibilidad): permitir todo. Si el cliente quiere excluirse del entrenamiento, bloquear solo `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended` y mantener abiertos los de búsqueda. Consultar la documentación vigente de cada proveedor antes de fijar la lista, porque los nombres cambian; ver `templates/robots.txt`.

Checks obligatorios:
- `robots.txt` controla rastreo, **no** indexación (para no indexar se usa `noindex`).
- No bloquear CSS, JS ni imágenes.
- Revisar la configuración del CDN/WAF: algunos proveedores bloquean crawlers de IA por defecto o con un interruptor; si el sitio debe ser citable, desactivar ese bloqueo y verificarlo con `curl -A "OAI-SearchBot" -I https://dominio/` (debe responder 200).
- `Sitemap: https://dominio/sitemap-index.xml` en `robots.txt`.

## 8. llms.txt (opcional)

Archivo estático en `/llms.txt` con nombre, descripción de una línea y enlaces a páginas clave en Markdown. Costo cero para performance. Google no lo usa para AI Overviews y no hay confirmación sólida de que otros motores lo consuman: incluirlo si el cliente quiere, sin presentarlo como factor de ranking.

## 9. Reglas de redacción

- Idioma del público; ortografía local (ej.: español rioplatense/neutro según el usuario).
- Datos densos: métricas verificables, pasos, `<table>`, `<ul>`, `<ol>`; cero relleno.
- Primera frase de cada sección = respuesta; el resto amplía.
- **Pasaje autocontenible:** cada oración de valor lleva *sujeto + afirmación + calificador*. Mal: "Lo hacemos con 15 años de experiencia." Bien: "[Negocio] tiene más de 15 años de trayectoria en [servicio] en [ciudad]." (solo si el dato es real).
- Donde existan, usar **estadísticas propias verificables, fuentes citadas y citas de terceros** (matrícula, normativa, organismo): es lo que el paper de GEO asocia con mayor visibilidad. Nunca inventarlas.
- Nombre del negocio y ubicación escritos igual en toda la web (NAP consistente).
- Nada de claims no verificables ("el mejor", "#1", "garantía total") ni urgencia falsa.
- Enlaces internos con anclas descriptivas ("presupuesto de destapación de cañerías"), nunca "haz clic aquí".

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria recuperada y leída el 2026-10-21 · ◐ confirmada el 2026-10-21 solo en fuentes secundarias o citada por ellas (revalidar en la primaria) · ○ conocimiento general o ruta conocida, **no recuperada** hoy (verificar antes de depender de ello).
Regla de uso: si la regla es ◐ u ○, o si la guía superó su plazo de revalidación, confirmarla en la fuente primaria antes de aplicarla (con búsqueda web, si está disponible) y, si no se puede, decir explícitamente "regla no reverificada hoy".

| Afirmación de esta guía | Estado | Fuente primaria / dónde confirmar |
|---|---|---|
| Google: sin optimización específica ni schema especial para AI features; requisito = indexada y elegible con snippet | ✔ | https://developers.google.com/search/docs/appearance/ai-features |
| OpenAI: `OAI-SearchBot` (búsqueda; recomiendan permitirlo y permitir sus rangos IP), `GPTBot` (entrenamiento), `ChatGPT-User` (acción del usuario; robots.txt puede no aplicar); los cambios de búsqueda tardan ~24 h | ✔ | https://developers.openai.com/docs/bots |
| Anthropic: `ClaudeBot`, `Claude-User`, `Claude-SearchBot` respetan robots.txt; bloquear por IP no garantiza el opt-out porque impide leer robots.txt | ✔ | https://support.claude.com/en/articles/8896518 |
| Perplexity (`PerplexityBot`, `Perplexity-User`) y Apple (`Applebot`, `Applebot-Extended`) y Google (`Google-Extended`) | ○ | Documentación de cada proveedor: docs.perplexity.ai (sección de bots), support.apple.com (buscar "About Applebot"), https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers (ruta citada por fuentes secundarias) |
| Rastreadores de IA medidos no ejecutan JavaScript; `Googlebot` sí | ◐ | Vercel/MERJ, dic. 2024: https://vercel.com/blog/the-rise-of-the-ai-crawler. Dato envejecido: revalidar; hay un reporte aislado sin confirmar de que OpenAI renderizaría desde 2025 |
| El paper de GEO midió hasta ~40 % de mejora con citas, estadísticas y fuentes | ◐ | https://arxiv.org/html/2311.09735v3 (el resultado de búsqueda confirma el paper; las cifras exactas se leen allí) |
| Eliminación de FAQ rich results (7 mayo 2026) | ◐ | Ver `google-seo.md`, apartado de fuentes |
| `llms.txt` no es usado por Google para AI Overviews y no hay confirmación sólida de otros motores | ◐ | La doc de Google (primera fila) no menciona `llms.txt`; la afirmación proviene de fuentes secundarias |
| Requeridos de `LocalBusiness` y `geo` ≥ 5 decimales | ◐ / ○ | Ver `google-seo.md`, apartado de fuentes |
