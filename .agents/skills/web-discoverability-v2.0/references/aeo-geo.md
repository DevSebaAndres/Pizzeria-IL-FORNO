# AEO + GEO v2.0: contenido, scrollytelling semántico y datos para buscadores con IA

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Define qué se escribe y cómo se estructura e inyecta en un sitio cinematográfico v2.0 para que tanto los buscadores tradicionales como los motores de respuesta con IA (ChatGPT Search, Perplexity, Gemini / AI Overviews, Claude) extraigan entidades, hechos, capítulos y productos sin ejecutar JavaScript.

## Contenido

1. Qué se sabe y qué no (honestidad sobre IA y JS)
2. Frase de entidad AEO (modos `local`, `general` y `product`)
3. Cómo hacer citable una escena de scrollytelling o un configurador
4. Arco narrativo de 11 pasos en los 3 modos
5. Cobertura geográfica (modo local) y alcance de envío/descarga (modo producto)
6. FAQ semántica 1:1
7. JSON-LD (`@graph` unificado con `Product`/`Offer`)
8. Crawlers de IA y `robots.txt`
9. `llms.txt`
10. Reglas de redacción citable

## 1. Qué se sabe y qué no (honestidad sobre IA y JS)

- **Rastreadores de IA y JavaScript:** las mediciones disponibles (Vercel/MERJ, ◐) muestran que `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `Claude-SearchBot` y `PerplexityBot` leen el HTML inicial y **no ejecutan JavaScript**. Si la historia del hero, las fichas de los autos o las respuestas están generadas en cliente o atrapadas en un `<canvas>`, para esos bots **la página está vacía**. Por eso en v2.0 el espectáculo visual corre en una capa paralela (`<canvas>`, GSAP) mientras toda la información reside en HTML estático.
- **Google (AI Overviews / AI Mode):** no exige archivos especiales; requiere que la página esté indexada, sea elegible para snippet y tenga contenido claro y coincidente con su JSON-LD (✔).
- **FAQ rich results:** eliminados en Google el 7 de mayo de 2026 (◐). La FAQ visible con `<details>` + `FAQPage` se conserva porque ofrece bloques pregunta-respuesta directos y autocontenibles para usuarios y motores de respuesta.
- **Evidencia de GEO (Princeton/KDD 2024, ◐):** lo que mostró hasta ~40 % más visibilidad en respuestas generativas fue incluir **datos cuantitativos reales, citas y referencias verificables** (por ejemplo, especificaciones técnicas exactas de un modelo histórico: cilindrada, caballos de fuerza, año de producción y diseñador), nunca adjetivos vacíos.

## 2. Frase de entidad AEO

Una definición declarativa y factual de **25 a 40 palabras**, sin superlativos ("el mejor", "único en el mundo"), ubicada **visible inmediatamente debajo del `<h1>`** en un `<p class="aeo-entity">` o `<blockquote class="aeo-entity">`.

- **Plantilla modo `local`:**
  > **[Negocio]** es un servicio profesional de [rubro] en [ciudad], especializado en [servicio 1 y servicio 2] para [público], con cobertura en [zona 1, zona 2 y zona 3] y atención [horario].
- **Plantilla modo `general`:**
  > **[Marca]** es [categoría] que brinda [servicio/solución principal] para [público] en [región], combinando [método/capacidad 1] y [diferencial verificable].
- **Plantilla modo `product` (catálogo / coleccionismo / arte automotriz):**
  > **[Marca]** es una plataforma de [categoría, ej.: arte automotriz clásico] para [público, ej.: coleccionistas y entusiastas], que ofrece [producto 1, ej.: lienzos line-art listos para colorear] y [producto 2, ej.: renders personalizables de alta resolución] de modelos históricos de las décadas de [rango, ej.: 1960 a 2010].

## 3. Cómo hacer citable una escena de scrollytelling o un configurador

1. **Capítulos del scrollytelling como lista ordenada (`<ol class="seq-chapters">`):**
   - Cada parada de la animación es un `<li>` con un `<h3>` descriptivo y un `<p>` de **25 a 45 palabras** que tiene sentido por sí solo (sujeto + dato técnico/histórico + contexto).
   - Ejemplo real: en lugar de escribir solo *"Pura potencia italiana"*, escribir *"El Ferrari F40 (1987) equipa un motor V8 biturbo de 2.936 cc (código F120A) que desarrolla 478 CV a 7.000 rpm, diseñado para conmemorar el 40.º aniversario de Ferrari."*
2. **Catálogo y Configurador (M3):**
   - Cada vehículo o producto del catálogo tiene su tarjeta `<article>` en el HTML estático con nombre completo, década, país de origen, especificaciones clave y modalidades disponibles.
   - Cerca del configurador interactivo, un bloque HTML estático resume las opciones personalizables (colores históricos con su código original, escenarios y formatos de entrega) para que un bot que no ejecuta la isla React conozca todas las capacidades del configurador.

## 4. Arco narrativo de 11 pasos en los 3 modos

Cada paso es una sección semántica (`<section aria-labelledby="…">`):

| Paso | Modo `local` | Modo `general` | Modo `product` (ej. *Paint the Classics*) |
|---|---|---|---|
| **1. Hero** | H1 (servicio + ciudad) + frase AEO + CTA WhatsApp + pruebas | H1 (propuesta + categoría) + frase AEO + CTA | **Hero Scrollytelling**: H1 + frase de entidad AEO + secuencia M1 con capítulos técnicos `<ol>` + CTA al catálogo/configurador |
| **2. Problema** | Fricción habitual del rubro local | Fricción del mercado | La dificultad de encontrar arte técnico fiel a las especificaciones originales de fábrica |
| **3. Solución** | Propuesta transparente del negocio | Contrapropuesta de la marca | Dos modalidades de autor: precisión de manual de taller (*Modo Garage*) y estudio fotográfico (*Modo Showroom*) |
| **4. Oferta central** | Servicios como beneficios medibles | Servicios / módulos principales | Modalidades de producto: **"El Lienzo"** (line-art B/N para pintar) y **"El Render"** (póster personalizado en alta resolución) |
| **5. Alcance / Catálogo** | Cobertura geográfica por barrios | Casos o ámbito de servicio | **Explorador de Clásicos (Catálogo estático)**: modelos por década (60s–10s) y país de origen con fichas técnicas |
| **6. Conversión intermedia** | CTA de presupuesto rápido | CTA de consulta o demo | **Configurador / Showroom interactivo (M3)** con resumen estático de opciones y CTA de diseño |
| **7. Cómo funciona** | 3 pasos (`<ol>`): contacto → diagnóstico → entrega | 3 pasos de implementación | `<ol>` de 3 pasos: elegir clásico → personalizar pintura/escenario o línea → descargar o recibir lienzo impreso |
| **8. Diferenciales** | Tabla comparativa con alternativas informales | Comparativa de valor verificable | Especificaciones de calidad: resolución de impresión, fidelidad histórica de códigos de pintura, formatos de archivo |
| **9. FAQ** | 5 a 8 preguntas (`<details>`) | 5 a 8 preguntas (`<details>`) | 5 a 8 preguntas sobre formatos, impresión, envíos, licencias y personalización |
| **10. Confianza / Entidad** | NAP completo, horarios, mapa, habilitaciones | Datos de la organización y garantías | Datos de la marca, garantías de calidad/entrega, canales de soporte y contacto real |
| **11. Cierre** | CTA final + Footer con NAP | CTA final + Footer | CTA final de colección + Footer semántico |

## 5. Cobertura geográfica (modo local) y alcance (modo producto)

- En **modo `local`**, listar únicamente las ciudades y barrios realmente atendidos en una `<ul>` clara. Prohibido generar páginas puerta para zonas sin presencia real.
- En **modo `product`**, especificar con claridad si la entrega es descarga digital global, envío físico a determinados países/regiones o ambos, usando datos reales del cliente.

## 6. FAQ semántica 1:1

- **5 a 8 preguntas** por página.
- Respuesta **< 50 palabras**, autocontenible (primera oración responde directamente nombrando a `[Marca/Negocio]`), sin relleno.
- Renderizada con `<details><summary>` nativos (`templates/FAQ.astro`), sin depender de JS.
- **Paridad exacta 1:1:** el texto del `<p>` visible y el `acceptedAnswer.text` del JSON-LD salen del mismo arreglo `faqs[]` en `src/data/business.ts`. `scripts/check-seo.mjs` falla si difieren en un solo carácter.

## 7. JSON-LD (`@graph` unificado con `Product`/`Offer`)

Generado por `templates/schema.ts` e inyectado una única vez en `<head>` por `BaseLayout.astro`:

- `LocalBusiness` (o subtipo) en modo `local`; `Organization` en modos `general` y `product`.
- `WebSite` y `WebPage` vinculados por `@id`.
- `Service` para cada servicio en `business.services`.
- **`Product` (en modo `product`):** un nodo `Product` por cada ítem en `business.products`, con `@id`, `name`, `description`, `image` (URL absoluta), `sku` (opcional), `brand` (`{ '@id': id('business') }`) y `offers`:
  - Solo se emiten nodos `Offer` cuando el precio es **real y numérico** (nunca inventar precios ni emitir un `Offer` con `TODO_`).
  - Cada `Offer` incluye `@type: 'Offer'`, `name` (ej. `"El Lienzo — Descarga Digital"` o `"El Render — Póster Personalizado"`), `price`, `priceCurrency` (`ARS`, `USD`, etc.), `availability` (`https://schema.org/InStock` o el estado real) y `url`.
- `FAQPage` con las preguntas y respuestas de `faqs[]`.
- Prohibido incluir `aggregateRating` o `review` propios sobre la organización o negocio.

## 8. Crawlers de IA y `robots.txt`

Mantener abiertos los rastreadores de búsqueda/citación (`Googlebot`, `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `Applebot`) y asegurarse de que `robots.txt` no bloquee `/_astro/` ni `/frames/`. Ver `templates/robots.txt`.

## 9. `llms.txt`

Archivo opcional en `/llms.txt` (`templates/llms.txt`) con nombre de la marca, frase de entidad AEO, lista de productos/modelos o servicios con sus URLs canónicas y datos de contacto. No se promete impacto en ranking.

## 10. Reglas de redacción citable

- Cada capítulo de scrollytelling y cada respuesta de FAQ debe poder entenderse fuera de contexto (**sujeto explícito + afirmación factual + dato concreto**).
- Preferir cifras y datos técnicos reales (año, potencia, dimensiones, resolución en DPI/px, plazos reales) antes que adjetivos.
- Si un dato no fue provisto por el usuario, escribir `TODO_DATO` y pedirlo; `check-seo.mjs` bloquea la aprobación si queda algún `TODO_` en el build.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación de esta guía | Estado | Fuente primaria / dónde confirmar |
|---|---|---|
| Google AI features: requisito = indexada y elegible con snippet; sin marcado especial ni `llms.txt` | ✔ | https://developers.google.com/search/docs/appearance/ai-features |
| Bots de OpenAI (`OAI-SearchBot`, `GPTBot`, `ChatGPT-User`) y Anthropic (`ClaudeBot`, `Claude-User`, `Claude-SearchBot`) | ✔ | https://developers.openai.com/docs/bots y https://support.claude.com/en/articles/8896518 |
| Bots de IA no ejecutan JS en las mediciones de Vercel/MERJ (dic. 2024) | ◐ | https://vercel.com/blog/the-rise-of-the-ai-crawler |
| Paper GEO (Princeton/KDD 2024): estadísticas, citas y fuentes mejoran visibilidad hasta ~40 % | ◐ | https://arxiv.org/html/2311.09735v3 |
| Estructura `Product` / `Offer` en Schema.org y Google Search Central | ○ | https://developers.google.com/search/docs/appearance/structured-data/product |

