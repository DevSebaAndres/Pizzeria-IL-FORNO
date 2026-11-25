# Flujo de trabajo: web cinematográfica, rápida y descubrible

**Antigravity + las 3 skills (`cinematic-fast-web`, `web-discoverability`, `web-performance-design`) + Stitch + Dribbble + ChatGPT**

> **Última verificación del documento:** 2026-10-22 · **Revalidar cada:** 90 días · Estado de cada dato sobre herramientas externas en la sección final "Fuentes y estado de verificación".

---

## 1. Idea central

Cada herramienta hace **una sola cosa** y nada más:

| Herramienta | Su trabajo | Lo que NO debe hacer |
|---|---|---|
| **Dribbble** (y similares) | Inspiración visual: estilo, ritmo, tipografía, composición | Copiar diseños ajenos (son obra protegida) |
| **ChatGPT** | Ordenar el brief, redactar prompts para Stitch, proponer variantes de titulares, criticar capturas | Afirmar reglas de Google, schema o performance: de eso se encargan las guías de las skills y los auditores |
| **Stitch** | Explorar y definir el diseño (layout, jerarquía, look) y exportarlo | Producir el código final: su HTML es **referencia**, no entregable |
| **Antigravity + skills** | Contenido, construcción, SEO/AEO/GEO, performance y verificación | Inventar datos del negocio o declarar scores que no midió |
| **Tú** | Aprobar en cada pausa | Delegar la aprobación |

**Regla de precedencia (la aplican las skills):** contenido indexable en el HTML inicial → performance → espectáculo visual. Si un elemento diseñado en Stitch rompe el presupuesto o el LCP, se simplifica el elemento, no el presupuesto.

## 2. Mapa de fases

Compatible con un pipeline de 5 fases con pausas de aprobación (estrategia y contenido AEO → extracción y refinamiento desde Stitch → inyección técnica GEO → auditoría QA → empaquetado). Se agregan las fases previas de preparación, brief, inspiración y diseño.

| Fase | Nombre | Dónde | Skill activa | Entregable | Pausa de aprobación |
|---|---|---|---|---|---|
| 0 | Preparación | Tu máquina / Antigravity | — | Skills instaladas, proyecto y MCP listos | Verificación de setup |
| 1 | Brief y datos reales | ChatGPT + tú | `web-discoverability` (intake) | `brief.md` con datos verificados | ✋ Apruebas el brief |
| 2 | Inspiración | Dribbble + ChatGPT | — | Moodboard + lenguaje visual (tokens) | ✋ Apruebas la dirección |
| 3 | Diseño | ChatGPT + Stitch | — | Pantallas aprobadas + `DESIGN.md` + capturas | ✋ Apruebas el diseño |
| 4 | Contenido AEO | Antigravity | `cinematic-fast-web` → `web-discoverability` | `business.ts` + copy + FAQ | ✋ Apruebas el copy |
| 5 | Construcción (Stitch → Astro) | Antigravity | `web-performance-design` | Sitio Astro fiel al diseño | ✋ Apruebas el primer corte, luego el resto |
| 6 | Inyección técnica SEO/GEO | Antigravity | `web-discoverability` | JSON-LD, robots, sitemap, canonical | — |
| 7 | QA y medición | Antigravity | las tres | Informe con auditores + Lighthouse | ✋ Apruebas el informe |
| 8 | Deploy y post-deploy | Hosting + Search Console | `web-discoverability` | Sitio publicado y verificado | Cierre |

Correspondencia con el pipeline de 5 fases: **4 = fase 1**, **5 = fase 2**, **6 = fase 3**, **7 = fase 4**, **8 = fase 5**.

## 3. Principios del flujo (para evitar errores y alucinaciones)

1. **Una fase, una aprobación.** Ninguna fase arranca sin tu "aprobado" explícito de la anterior.
2. **Datos reales o `TODO_`.** Teléfono, dirección, años, calificaciones, garantías y tiempos los pones tú. Si faltan, queda `TODO_` visible; el auditor falla si se publica con ellos.
3. **Fuente única:** todo dato del negocio vive en `src/data/business.ts`.
4. **Primero un corte vertical.** En la fase 5 se construye solo el hero (con su `<head>`, fuentes e imagen), se mide y se aprueba antes de seguir.
5. **Evidencia sobre afirmación.** El agente reporta la salida de los scripts (`check-seo`, `check-budget`, `contrast`, Lighthouse), no opiniones.
6. **Sin medición, sin score.** Si Lighthouse no se puede ejecutar, el agente lo dice; no estima.
7. **Stitch = referencia visual.** Se porta; no se copia tal cual.
8. **Máximo 3 ciclos de corrección** por fase; si no se resuelve, el agente se detiene y te explica la causa.

---

## Fase 0 — Preparación (una vez por proyecto)

**Objetivo:** dejar el entorno listo para que las skills se activen y las herramientas se comuniquen.

### Pasos
1. **Instalar las tres skills como carpetas.** Un `.skill` es un zip: descomprimir cada uno de modo que queden las carpetas `web-discoverability/`, `web-performance-design/` y `cinematic-fast-web/` dentro de `.agents/skills/` del proyecto (Antigravity usa `.agents/skills/` y mantiene compatibilidad con la carpeta anterior `.agent/skills/`). Para tenerlas en todos los proyectos, la carpeta global de skills de Antigravity (ver fuentes: confirmar la ruta vigente).
2. **Crear el repositorio** y una carpeta `design/` (para exportaciones de Stitch y capturas) y otra `docs/` (para `brief.md`, informes).
3. **Conectar el MCP de Stitch** en la configuración MCP de Antigravity (ver documentación de Stitch para el comando y la autenticación vigentes). Si no se puede, usar el camino manual de la fase 3 (exportar a `design/`).
4. **Agregar una regla fija** (`.agents/rules/`, máx. 12.000 caracteres por archivo) para que el agente no se salte las skills. Contenido sugerido:

```
Para cualquier tarea de este proyecto:
- Activa cinematic-fast-web para construir sitios completos. Usa web-discoverability para SEO/AEO/GEO y web-performance-design para stack, visual, UX/UI y performance.
- Antes de aplicar reglas de Google, schema, rastreadores de IA o Lighthouse, ejecuta check-freshness.mjs; si una guía está vencida, revalida en la fuente primaria o avisa "regla no reverificada hoy".
- Nunca inventes datos del negocio: usa TODO_ y pregúntame.
- No avances de fase sin mi aprobación explícita.
- No afirmes scores ni cumplimiento sin ejecutar los scripts y mostrar su salida.
- El HTML exportado desde Stitch es referencia visual, no código de producción.
```

5. **Comprobar que las skills se detectan.** Prompt de prueba:

```
Lista las skills disponibles en este proyecto y para cada una dime su nombre, cuándo se activa y qué scripts incluye. No ejecutes nada todavía.
```
   Esperado: las tres aparecen. Si no, revisar la carpeta y el `name`/`description` del `SKILL.md`.

6. **Chequeo de vigencia:**

```
Ejecuta node scripts/check-freshness.mjs en web-discoverability y en web-performance-design y muéstrame la salida completa. Si alguna guía está vencida, dime qué reglas dependen de ella antes de continuar.
```

**Criterio de salida:** las 3 skills detectadas, MCP de Stitch conectado (o plan manual definido) y guías vigentes.

---

## Fase 1 — Brief y datos reales (ChatGPT + tú)

**Objetivo:** convertir tu información dispersa en un brief ordenado y **solo con datos verificados**.

### Paso 1.1 — Reunir los datos
Prepara en bruto: nombre del negocio, rubro, servicios, zonas, dirección, teléfono/WhatsApp, horarios, años de trayectoria, garantías, certificaciones, enlace a Google Business Profile, 5 preguntas frecuentes de clientes, logo y fotos propias, y los pixels/analítica que usas.

### Paso 1.2 — Prompt para ChatGPT (estructurar el brief)

```
Actúa como estratega de marca y de contenido web. Voy a pegarte información en bruto sobre mi negocio. Tu tarea es ordenarla en un brief, SIN inventar nada.

Reglas:
1. Usa solo lo que yo te doy. Si falta un dato, escribe TODO_ y lista la pregunta que necesito responder.
2. No agregues cifras, años, garantías, reseñas ni certificaciones que yo no haya dicho.
3. Si algo es ambiguo, pregúntame antes de asumir.
4. Separa claramente: (a) datos factuales verificables, (b) tono y personalidad de marca, (c) público, (d) objetivos de conversión.

Formato de salida (Markdown):
- Negocio (nombre, rubro, modo: local o general)
- Datos de contacto y NAP (exactos, tal como los escribí)
- Servicios (nombre + resultado concreto para el cliente)
- Zonas de cobertura (solo las que declaré)
- Diferenciadores verificables
- Pruebas disponibles (solo reales)
- Público y su principal frustración
- Objetivo principal de conversión (WhatsApp, llamada, formulario, reserva)
- Tono de marca (3 adjetivos + 3 cosas que la marca nunca diría)
- Lista de TODO_ pendientes

Información en bruto:
[PEGAR AQUÍ]
```

### Paso 1.3 — Verifica y guarda
Corrige tú el brief (especialmente el NAP) y guárdalo como `docs/brief.md`.

**Criterio de salida ✋:** brief sin invenciones y con los `TODO_` resueltos o conscientemente pendientes.

> ChatGPT puede equivocarse en reglas técnicas. En este paso solo ordena **tu** información; no le pidas "qué exige Google".

---

## Fase 2 — Inspiración (Dribbble + ChatGPT)

**Objetivo:** definir una dirección visual concreta, no "algo bonito".

### Paso 2.1 — Buscar en Dribbble
Busca en inglés (suele haber más resultados) combinando el estilo con el sector. Ejemplos:
- `cinematic landing page`, `editorial serif hero`, `dark luxury website`, `minimal brutalist landing`
- `[tu rubro] website design` (ej.: `plumbing service website`, `dental clinic website`)
- `bento dashboard section`, `sticky stack cards`, `manifesto section typography`

**Selecciona 5 a 8 referencias** (guarda capturas, no enlaces solamente, porque los shots cambian). Criterios: que comuniquen el mismo clima de marca, que su jerarquía sea clara y que **se puedan lograr con CSS ligero** (evita referencias que dependen de video pesado, 3D o WebGL). Tómalas como inspiración: no copies un diseño ajeno.

También sirven como complemento: Awwwards, Behance, Land-book y Mobbin (patrones de UI).

### Paso 2.2 — Prompt para ChatGPT (analizar las referencias)
Sube las capturas y pega:

```
Analiza estas capturas de referencia para una web de [RUBRO] cuyo tono es [3 ADJETIVOS DEL BRIEF]. NO describas los diseños para copiarlos: extrae principios.

Entrega en Markdown:
1. Lenguaje visual común (3 a 5 rasgos).
2. Tipografía: tipo de titular (sans, serif, mono), contraste de pesos, escala aproximada. Sugiere 2 familias gratuitas y autoalojables que se acerquen (por ejemplo de Google Fonts o Fontsource).
3. Paleta: describe la proporción 60/30/10 que observas y propón 4 colores (principal, acento, fondo, texto) con hex.
4. Composición del hero y patrón de las secciones (qué se repite).
5. Elementos de movimiento que aparecen y si se pueden lograr con CSS (transform/opacity) sin JavaScript.
6. Lo que EVITARÍAS de estas referencias para una web rápida (video de fondo, 3D, parallax pesado, fuentes múltiples).
7. Riesgos de accesibilidad que veas (texto claro sobre imagen, bajo contraste).

Aclara qué es observación y qué es sugerencia tuya.
```

### Paso 2.3 — Medir el contraste de la paleta propuesta
La paleta sugerida **no se acepta sin medirla**. Más adelante el agente correrá `contrast.mjs`; si quieres adelantarlo, pídeselo en la fase 4.

**Entregable:** `docs/direccion-visual.md` con rasgos, paleta, tipografía y las capturas en `design/referencias/`.

**Criterio de salida ✋:** una dirección clara que puedas resumir en 2 conceptos (por ejemplo "minimalismo japonés / ritual industrial").

---

## Fase 3 — Diseño en Stitch

**Objetivo:** obtener pantallas aprobadas (desktop y móvil) y su sistema de diseño.

### Paso 3.1 — Generar los prompts de Stitch con ChatGPT

```
Eres un director de arte y prompt engineer para una herramienta de generación de interfaces (Google Stitch). Con este brief y esta dirección visual, escribe prompts para generar las pantallas de mi web.

Brief: [PEGAR docs/brief.md]
Dirección visual: [PEGAR docs/direccion-visual.md]

Reglas:
- Usa texto REAL del brief. Donde falte un dato, escribe [PLACEHOLDER] y no inventes cifras ni reseñas.
- Diseña mobile-first y luego la versión desktop.
- El diseño debe poder implementarse con HTML y CSS ligeros: sin video de fondo, sin 3D, sin dependencia de muchas fuentes (máx. 2 familias), formas y degradados en vez de imágenes pesadas.
- Cada pantalla tiene un único foco y un CTA primario.
- Especifica jerarquía, espaciado generoso, radios grandes y contraste alto en el texto.

Entrega 4 prompts independientes (cada uno de 120 a 200 palabras), en este orden:
1. Hero + navegación (H1 con servicio y ciudad, frase que explica qué es el negocio, CTA principal y secundario, 3 pruebas reales del brief).
2. Servicios como beneficios (3 tarjetas, cada una con resultado concreto) + sección "cómo funciona" en 3 pasos.
3. Manifiesto/diferenciales + cobertura geográfica (lista de zonas) + FAQ (5 preguntas del brief en formato desplegable).
4. Cierre de conversión + footer (NAP completo, enlaces, estado operativo).

Para cada prompt indica: objetivo de la pantalla, componentes, textos, estados (hover/foco) y cómo se vería en móvil.
```

### Paso 3.2 — Generar en Stitch
1. Genera **hero + navegación primero**; aprueba la dirección en esa pantalla antes de producir las demás.
2. Itera con instrucciones pequeñas y una por vez. Prompts de iteración útiles:

```
Aumenta el contraste del texto sobre la imagen del hero sin añadir una capa pesada; usa un degradado desde el color principal hacia abajo.
```
```
Reduce a 2 las familias tipográficas: una sans para títulos y una serif itálica solo para el énfasis en la palabra clave del H1.
```
```
Rediseña esta sección para móvil con una sola columna, CTA visible sin scroll y objetivos táctiles de al menos 44 px.
```
```
Sustituye la imagen de fondo por un degradado y una forma geométrica; el diseño no puede depender de una foto para entenderse.
```

3. Genera la versión móvil de cada pantalla.

### Paso 3.3 — Exportar (qué guardar)
Guarda en `design/stitch/`:
- **`DESIGN.md`** (tokens de diseño: colores, tipografía, espaciado), si tu versión de Stitch lo exporta.
- **Capturas** de cada pantalla (desktop y móvil) como imágenes.
- **HTML/CSS exportado** de cada pantalla (código del panel o `.zip`).
- Opcional: exportación a Figma si vas a refinar a mano.

Si el MCP está conectado, el agente podrá leer los diseños directamente; aun así guarda las capturas como respaldo estable.

### Paso 3.4 — Revisión humana del diseño (antes de pasar a código)
Checklist rápida (cada punto es un "no" que debes corregir en Stitch):
- [ ] ¿Se entiende qué es el negocio y dónde opera en los primeros 5 segundos en móvil?
- [ ] ¿Hay un solo CTA primario por pantalla?
- [ ] ¿El texto sobre imágenes tiene contraste suficiente?
- [ ] ¿Algún elemento exige video, 3D o más de 2 fuentes?
- [ ] ¿Los textos usan datos reales o `[PLACEHOLDER]` marcados?

**Criterio de salida ✋:** pantallas desktop y móvil aprobadas y guardadas en `design/stitch/`.

---

## Fase 4 — Contenido AEO (Antigravity) · pipeline fase 1

**Objetivo:** definir `business.ts` y el copy completo antes de escribir código de interfaz.

### Prompt

```
Activa cinematic-fast-web y, dentro de ella, web-discoverability.

Contexto: tengo el brief en docs/brief.md, la dirección visual en docs/direccion-visual.md y el diseño aprobado en design/stitch/.

Tarea de esta fase (SOLO contenido, sin código de interfaz):
1. Ejecuta check-freshness.mjs y dime si alguna guía está vencida.
2. Lee docs/brief.md y compáralo con las preguntas de references/intake-datos.md. Lista los datos que faltan; no los inventes.
3. Crea src/data/business.ts a partir de templates/business.example.ts con SOLO datos reales. Lo pendiente queda como TODO_.
4. Redacta en el idioma del público:
   - frase de entidad AEO (25 a 40 palabras, factual, sin superlativos),
   - H1 (servicio + lugar), title (<= 60 caracteres) y meta description (150 a 160),
   - el copy de las 11 secciones del arco narrativo, respetando los textos ya aprobados en el diseño de Stitch donde coincidan,
   - FAQ de 5 a 8 preguntas, respuestas < 50 palabras, autocontenibles y con nombre del negocio y ubicación.
5. Entrégame un documento docs/contenido.md para aprobar. No generes HTML ni componentes.

Reglas: no inventes datos ni claims; no uses superlativos; si algún dato del diseño de Stitch difiere del brief, señálalo.
Detente al terminar y espera mi aprobación.
```

**Criterio de salida ✋:** `business.ts` sin inventos y `docs/contenido.md` aprobado. Cualquier `TODO_` pendiente se resuelve ahora.

---

## Fase 5 — Construcción: de Stitch a Astro (Antigravity) · pipeline fase 2

**Objetivo:** reproducir el diseño de Stitch con HTML semántico, CSS ligero y presupuesto de performance.

> **Cuándo se usa Stitch y cuándo la skill decide el diseño.** Si hay diseño de Stitch aprobado, **Stitch define la composición visual** (layout, jerarquía, estilo) y las skills imponen las reglas técnicas. Si no hay diseño, `web-performance-design` aplica su sistema visual por defecto (hero, dashboard, manifiesto, sticky stack, planes, footer).

### 5.1 — Corte vertical (hero primero)

```
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
```

**Criterio de salida ✋:** el hero se parece al diseño, `check-budget` sin errores y, si se pudo medir, LCP ≤ 2.5 s en móvil.

### 5.2 — Resto de secciones

```
Aprobado el hero. Construye ahora las demás secciones del diseño de Stitch en el orden de las pantallas: servicios, cómo funciona, manifiesto/diferenciales, cobertura, FAQ y cierre con footer.

Reglas:
- Usa web-performance-design (references/sistema-visual.md y ux-ui.md) como guía de implementación de efectos: sticky stack con position: sticky, dashboards animados con keyframes CSS, revelado con animation-timeline bajo @supports. Nada de GSAP salvo que algo sea imposible en CSS; si lo propones, justifícalo y mide su costo.
- La FAQ usa el componente templates/FAQ.astro con <details> y se alimenta de faqs en business.ts (misma fuente que el JSON-LD).
- Un solo <main>, un solo H1, cada <section> con heading o aria-labelledby, imágenes con alt, y ningún texto crítico renderizado por JavaScript.
- Todo texto sale de docs/contenido.md y business.ts; si algo falta, usa TODO_ y avísame.
- Cada 2 secciones ejecuta check-budget.mjs y muéstrame la salida.

Al final, entrégame la tabla "Elemento de Stitch → Implementación → Cambios" completa y la lista de cualquier diferencia respecto del diseño con su motivo.
```

### 5.3 — Si NO tienes el MCP de Stitch (camino manual)
Cambia en los prompts anteriores "puedes consultarlo también por el MCP de Stitch" por: "Trabaja solo con los archivos de `design/stitch/`. Si algo no se ve en las capturas, pregúntame; no lo inventes".

**Criterio de salida ✋:** sitio completo fiel al diseño, `check-budget` sin errores y diferencias respecto del diseño justificadas.

---

## Fase 6 — Inyección técnica SEO/GEO (Antigravity) · pipeline fase 3

**Objetivo:** marcado, rastreo y semántica, verificados con script.

### Prompt

```
Activa web-discoverability.

Tarea: completa la capa técnica del sitio y verifícala.
1. Genera el JSON-LD con templates/schema.ts desde business.ts, en un único @graph dentro del <head> (LocalBusiness o subtipo específico si el modo es local; Organization si es general; Service por servicio; WebSite; WebPage; FAQPage). Nada de microdata duplicado.
2. Revisa que el texto visible de la FAQ sea idéntico a acceptedAnswer.text.
3. Confirma name real (sin keywords), geo con 5 decimales como mínimo si se incluye, y que NO exista aggregateRating ni review propios.
4. Crea public/robots.txt y public/llms.txt (opcional) desde los templates, con la URL real del sitemap; confirma que el sitemap se genera.
5. Verifica title, meta description, canonical (y que og:url sea idéntica), lang, jerarquía de headings y landmarks.
6. Ejecuta node scripts/check-seo.mjs dist y muéstrame la salida completa. Corrige los errores y repite (máximo 3 ciclos). Los avisos explícalos uno por uno: cuáles aplicas y cuáles descartas y por qué.

No afirmes que algo "cumple" sin la salida del script. Si una regla de Google o de los rastreadores de IA está marcada ◐ u ○ en la guía y es sensible al tiempo, confírmala en la fuente primaria o dime "regla no reverificada hoy".
```

**Criterio de salida:** `check-seo.mjs` con 0 errores y avisos revisados.

---

## Fase 7 — QA y medición (Antigravity) · pipeline fase 4

**Objetivo:** probar con instrumentos, no con impresiones.

### Prompt

```
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
```

### Revisión manual (tú)
- Abre el sitio en un móvil real: hero sin scroll, CTA visible, sin desplazamiento horizontal.
- Navega solo con teclado (foco visible) y con zoom al 200 %.
- Activa "reducir movimiento" en el sistema y confirma que el contenido sigue completo.
- Compara visualmente con las capturas de `design/stitch/`.

**Criterio de salida ✋:** informe aprobado, sin errores en los auditores y diferencias visuales aceptadas.

---

## Fase 8 — Deploy y post-deploy · pipeline fase 5

**Objetivo:** publicar y verificar en el entorno real.

### Prompt (empaquetado y entrega)

```
Prepara la entrega.
1. Revisa que no queden marcadores TODO en el código ni en dist (check-seo ya lo comprueba).
2. Configura public/_headers (caché inmutable para /_astro/ y /fonts/) y verifica que robots.txt apunte al dominio final.
3. Genera docs/entrega.md con: árbol de archivos, decisiones técnicas, resultados medidos (con fecha y comandos), diferencias respecto del diseño de Stitch y pendientes.
4. Prepara los comandos de deploy para [Cloudflare Pages / Netlify / Vercel] sin ejecutarlos todavía.
5. Lista los pasos manuales post-deploy y qué evidencia debo guardar de cada uno.
```

### Después del deploy (manual)
1. **Search Console:** verificar la propiedad de dominio (DNS), enviar `sitemap-index.xml`, inspeccionar la URL principal y solicitar indexación.
2. **Validación de datos estructurados:** validator.schema.org (sintaxis). El Rich Results Test no valida FAQ; úsalo solo para tipos con resultado enriquecido vigente.
3. **Google Business Profile** (modo local): NAP idéntico carácter por carácter, enlace al sitio y categoría correcta.
4. **PageSpeed Insights** sobre la URL pública (laboratorio y, con tráfico, datos de campo).
5. **Acceso de rastreadores de IA:**

```
curl -A "OAI-SearchBot" -I https://TU-DOMINIO/
curl -A "Claude-SearchBot" -I https://TU-DOMINIO/
curl -A "PerplexityBot" -I https://TU-DOMINIO/
```
   Debe responder 200. Un 403 suele indicar un bloqueo del CDN/WAF; revisar la configuración de bots de IA del proveedor.
6. **Pixels y analítica:** confirma que se cargan tras la primera interacción y mide Lighthouse con y sin ellos.
7. **Seguimiento:** revisar Search Console a las 2 y 4 semanas (cobertura, consultas, CTR) y ajustar títulos y descripciones.

---

## 4. Prompts de rescate

Cuando el agente se desvía, corrige con un prompt breve y concreto.

**El agente no usó las skills:**
```
Detente. No usaste las skills del proyecto. Activa cinematic-fast-web, lee los SKILL.md de web-discoverability y web-performance-design y dime qué reglas aplican a esta tarea antes de continuar.
```

**El agente inventó un dato:**
```
Ese dato no está en docs/brief.md ni en business.ts. Elimínalo, reemplázalo por TODO_ y dime de dónde lo sacaste. No vuelvas a completar datos del negocio por tu cuenta.
```

**El agente declara un score sin medir:**
```
No hay salida de Lighthouse en esta conversación. Retira esa cifra y ejecuta la medición; si no puedes, dime explícitamente que no está medido.
```

**Reintrodujo el CDN de Tailwind, fuentes remotas o imágenes externas:**
```
Hay recursos externos en el build (CDN de Tailwind / Google Fonts / imágenes remotas). Reemplázalos por Tailwind compilado, WOFF2 autoalojadas e imágenes locales AVIF/WebP, y ejecuta check-budget.mjs para confirmarlo.
```

**El diseño de Stitch rompe el presupuesto:**
```
Este elemento del diseño (describe cuál) supera el presupuesto. Propón 2 alternativas que conserven la intención visual con CSS ligero, indica el costo estimado de cada una y espera mi elección.
```

**Una guía está vencida:**
```
Esa regla es sensible al tiempo y la guía está vencida o marcada como no reverificada. Confírmala en la fuente primaria enlazada; si no puedes, dime "regla no reverificada hoy" y marca la decisión como provisional.
```

## 5. Estructura de proyecto recomendada

```
mi-proyecto/
├── .agents/
│   ├── skills/
│   │   ├── cinematic-fast-web/
│   │   ├── web-discoverability/
│   │   └── web-performance-design/
│   └── rules/            # regla fija de la fase 0
├── design/
│   ├── referencias/      # capturas de Dribbble
│   └── stitch/           # DESIGN.md, capturas, HTML exportado
├── docs/
│   ├── brief.md
│   ├── direccion-visual.md
│   ├── contenido.md
│   └── entrega.md
├── scripts/              # check-seo, check-budget, contrast, check-freshness
├── src/
│   ├── data/business.ts  # fuente única de verdad
│   ├── layouts/BaseLayout.astro
│   ├── components/
│   ├── lib/schema.ts
│   ├── pages/
│   └── styles/global.css
├── public/               # robots.txt, llms.txt, _headers, fuentes
└── lighthouserc.json
```

## 6. Atajos útiles

- **Guarda cada prompt como workflow** de Antigravity (archivo Markdown en `.agents/workflows/`, cada uno con un máximo de 12.000 caracteres) para invocarlo como comando con barra, por ejemplo `/fase-4-contenido`, `/fase-5-hero`, `/fase-7-qa`. Confirma el formato vigente en la documentación de Antigravity.
- **Un proyecto = una conversación por fase.** Reiniciar el contexto entre fases evita arrastrar errores; el estado vive en los archivos (`brief.md`, `business.ts`, `contenido.md`).
- **Trabaja con presupuestos escritos.** Pega en la regla fija los umbrales del proyecto (JS ≤ 70 KB, LCP ≤ 2.5 s, etc.) para que el agente los tenga presentes.
- **Reutiliza el diseño.** Una vez aprobado `DESIGN.md`, sirve como base para otras páginas (servicios, zonas) sin volver a generar la identidad.

## 7. Qué NO delegar

| No delegar a… | Porque… |
|---|---|
| ChatGPT | Puede afirmar con seguridad reglas de Google o de schema desactualizadas o falsas |
| Stitch | Su código no está optimizado para tu presupuesto de performance ni tu estructura semántica |
| El agente (sin evidencia) | Puede declarar "cumple" sin haber ejecutado nada |
| Ninguna herramienta | La aprobación final, los datos del negocio y el contenido legal (políticas de privacidad) |

---

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente leída el 2026-10-22 · ◐ confirmada solo en fuentes secundarias (revalidar en la primaria) · ○ no recuperada hoy (verificar).

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| Skills de Antigravity: carpeta con `SKILL.md`, se activan por coincidencia con la descripción; ruta de workspace `.agent/skills/` (codelab) | ✔ | https://codelabs.developers.google.com/getting-started-with-antigravity-skills |
| Ruta por defecto actual `.agents/skills/` con compatibilidad con `.agent/skills/`; global `~/.gemini/antigravity/skills/` (otra fuente cita `~/.gemini/config/skills/`) | ◐ | https://www.firecrawl.dev/blog/antigravity-skills · https://antigravity.google/docs/skills (confirmar la ruta global vigente) |
| Reglas en `.agents/rules/`, workflows como comandos con barra, límite de 12.000 caracteres por archivo de reglas/workflows | ◐ | https://antigravity.google/docs/rules-workflows (ruta citada por fuentes secundarias) |
| Configuración MCP en `.agent/mcp_config.json` | ◐ | https://antigravity.google/docs/editor/ide-mcp.md (ruta citada por fuentes secundarias) |
| Stitch: genera pantallas desde texto, imágenes y bocetos; exporta HTML/CSS, Tailwind, Figma, `.zip`, MCP y `DESIGN.md` | ◐ | Reseñas y guías de terceros (p. ej. https://moda.app/blog/google-stitch-review); confirmar en la documentación oficial de Stitch |
| Límites del plan gratuito de Stitch | ○ | Varían: consultar el plan vigente en Stitch |
| Cómo configurar el MCP de Stitch (comando, autenticación) | ○ | Documentación oficial de Stitch / repositorio del servidor MCP |
| Dribbble, Awwwards, Behance, Land-book, Mobbin como fuentes de inspiración | ○ | Uso general; respetar los términos y derechos de autor de cada sitio |
| Umbrales y reglas SEO/GEO/performance | — | Ver la tabla de fuentes de cada guía en las skills |
