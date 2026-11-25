# Secuencias de frames y video atado al scroll

**Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Guía de la skill (sin equivalente en la v1). Cubre el hero o las escenas donde el scroll "reproduce" una animación: secuencia de imágenes dibujada en `<canvas>` o video con `currentTime` atado al scroll. Es el elemento que más pesa en un sitio cinematográfico: se diseña con un **plan de medios** antes de escribir código y se mide con `scripts/check-frames.mjs`.

## Contenido

1. Elegir la técnica
2. Estructura de la escena (LCP, canvas, versión sin movimiento)
3. Plan de medios (cantidad, resolución, formato, peso)
4. Memoria: el costo que no aparece en la red
5. Motor M1: carga progresiva y dibujo
6. Alternativa: video atado al scroll
7. Móvil y `reduced-motion`
8. Extraer y codificar
9. Checklist

## 1. Elegir la técnica

| Técnica | Cuándo | Ventajas | Costos y riesgos |
|---|---|---|---|
| **Pocas imágenes clave + CSS** (M0) | 3–6 estados que se funden o se desplazan | 0 JS, mínimo peso | No es "reproducción" continua |
| **Secuencia de frames en canvas** (M1) | Control exacto del frame, scrub en ambos sentidos, recorrido corto o medio | Frame exacto; funciona igual en todos los navegadores | Peso en red y **memoria decodificada**; exige plan de medios |
| **Video con scrub** (M1) | Recorrido largo o móvil; priorizar peso | Mucho menos peso que cientos de imágenes | Requiere video codificado con keyframes muy frecuentes; el `seek` puede ir con retraso y variar por navegador (comprobar en iOS real); no es exacto al frame |

Regla: **empezar por la técnica más liviana que cumpla el diseño**. Si el diseño aprobado pide continuidad total en un recorrido largo (más de ~10 s de acción), evaluar el video antes que la secuencia. La decisión y su razón van en el blueprint.

## 2. Estructura de la escena

Reglas que no se negocian (ver reglas 3–5 del `SKILL.md`):

- El **primer frame es un `<img>` real** con `loading="eager"`, `fetchpriority="high"`, `width` y `height`: es el elemento LCP. El `<canvas>` no cuenta como candidato a LCP (◐), así que no puede ser el LCP.
- El **H1 y el texto de cada capítulo son HTML real**, no parte del canvas ni de los frames.
- El `<canvas>` es decorativo: `aria-hidden="true"`. El `alt` del primer frame describe la escena.
- Se monta **después** del LCP: el motor arranca en el evento `load`, no antes.
- Sin JS o con `reduced-motion` (clase `js-motion` ausente), la escena se ve como 3–5 imágenes clave con su texto, en altura normal (`templates/FrameSequence.astro`).
- Contenedor con altura reservada desde el HTML (sin CLS).

Marcado de referencia (resumen; el componente completo está en `templates/FrameSequence.astro`):

```html
<section id="f40" class="seq" aria-labelledby="f40-h" data-frame-seq
         data-base="/frames/v1/d-" data-count="120" data-ext="avif"
         data-base-mobile="/frames/v1/m-" data-count-mobile="72">
  <div class="seq-pin">
    <img data-first-frame src="/frames/v1/d-0001.avif" width="1280" height="720"
         loading="eager" fetchpriority="high" decoding="async" alt="Ferrari F40 rojo de frente">
    <canvas aria-hidden="true"></canvas>
  </div>
  <ol class="seq-chapters"> <!-- capítulos con texto real --> </ol>
  <div class="seq-stills"> <!-- versión sin movimiento --> </div>
</section>
```

## 3. Plan de medios

Se completa en el blueprint, **por breakpoint**, antes de generar los frames. Los topes de abajo son los perfiles de `check-frames.mjs` (criterios propios de la skill, ajustables con medición):

| Parámetro | Desktop | Móvil |
|---|---|---|
| Cantidad de frames | ≤ 240 (recomendado 90–180) | ≤ 120 (recomendado 60–100) |
| Resolución del frame | 1280×720 (o el aspecto de la escena) | ~720 de ancho; recorte vertical si la escena lo permite |
| Formato | AVIF (calidad ~45–55) o WebP (~65–75); nunca JPG/PNG para la secuencia | igual |
| Peso medio por frame | ≤ 60 KB | ≤ 40 KB |
| Peso total | ≤ 8 MB | ≤ 3 MB |
| Lote inicial (1 de cada 4 frames) | ≤ 500 KB | ≤ 300 KB |

Cómo se decide la cantidad: la cantidad de frames no es "los del video". Es la que hace que el movimiento se vea continuo al ritmo del scroll. Una acción de 10 s a 12–15 fps ya son 120–150 frames; muchas escenas funcionan con menos si el movimiento es lento.

**Caso medido (proyecto Paint the Classics, 2026-11-10):** `frames/` tiene 504 WebP de 1920×1080, 59,5 MB en total y 121 KB de media. `check-frames.mjs` los marca como EXCEDE en todos los topes de los dos perfiles. La acción correctiva es reducir cantidad (muestrear 1 de cada 3–4) y resolución (1280×720 en desktop, ~720 de ancho en móvil) y volver a medir; no se arregla con más compresión de red.

## 4. Memoria: el costo que no aparece en la red

Un frame decodificado ocupa `ancho × alto × 4 bytes`, sin importar cuánto pese el archivo. Los 504 frames del caso medido, decodificados a la vez, serían **~3,9 GB** (1920×1080×4×504); `check-frames.mjs` lo calcula. Un móvil cierra o recarga la pestaña mucho antes.

Reglas:
- **No mantener todos los frames decodificados.** Mantener los objetos `Image` (el navegador conserva el dato comprimido y decodifica al dibujar) y pedir `decode()` solo de una **ventana** alrededor del frame actual (±8 es un punto de partida; ajustar midiendo).
- **No usar `createImageBitmap` para todos los frames**: un bitmap conserva los píxeles decodificados.
- **Limitar el tamaño del canvas:** `ancho CSS × min(devicePixelRatio, 1.5)`. Un canvas a DPR 3 en un móvil multiplica el costo de cada `drawImage` sin ganancia visible (criterio de la skill).
- Calcular en el blueprint la memoria de la ventana: `ancho × alto × 4 × (2·ventana+1)`; a 1280×720 y ventana ±8 son 17 frames × 3,5 MB ≈ 60 MB.

## 5. Motor M1: carga progresiva y dibujo

`templates/frame-sequence.js` implementa esto sin dependencias:

1. **Orden de carga.** Después del evento `load` y en idle: primero 1 de cada `stride` frames (lote inicial, para que el scrub funcione de inmediato con baja resolución temporal), luego el resto, **priorizando por cercanía al frame actual**. Concurrencia limitada (6 peticiones).
2. **Dibujo.** Se dibuja el frame pedido o, si aún no cargó, el **más cercano ya cargado**. Solo se redibuja cuando cambia el índice.
3. **Progreso.** `progreso = (scrollY − topDeLaEscena) / (altoDeLaEscena − altoDeViewport)`. La geometría se lee **fuera** del bucle (al activar y en `resize`); dentro del bucle solo se usa el `scrollY` guardado.
4. **Activación por visibilidad.** Un `IntersectionObserver` registra el listener de scroll (`passive`) solo mientras la escena está en pantalla y lo quita al salir.
5. **Un solo `requestAnimationFrame` por frame de scroll**, sin leer layout ni escribir estilos en el bucle.
6. **Listo para mostrar.** Al dibujar el primer frame en el canvas, la escena recibe la clase `is-ready` (el canvas pasa a visible).
7. **Limpieza.** El motor devuelve una función `destroy()` (se llama al desmontar o antes de un cambio de página).

No usar GSAP solo para esto: una secuencia simple es M1. GSAP (M2) entra si la secuencia debe sincronizarse con un timeline más grande (ver `gsap-patterns.md` §7).

## 6. Alternativa: video atado al scroll

- Codificar con **keyframes muy frecuentes** (`-g 2` o `-g 1`, que sube el peso) para que `currentTime` salte rápido; sin eso, el seek es lento y se ve con tirones.
- `muted`, `playsinline`, `preload="auto"` solo cuando la escena está cerca; sin `autoplay`; `poster` = primer frame (es candidato a LCP como `<video poster>`, ◐).
- Asignar `video.currentTime` dentro de `requestAnimationFrame` y solo si cambió más de `1/fps` respecto de la última asignación.
- Entregar un archivo por breakpoint. Medir peso real contra el de la secuencia equivalente: a veces, con keyframes en cada frame, el video deja de ser más liviano.
- El comportamiento de `seek` varía entre navegadores y dispositivos (○): **probar en iOS Safari y en un Android de gama media reales** antes de elegir esta técnica.

## 7. Móvil y `reduced-motion`

- **Móvil:** secuencia propia (`data-base-mobile`, `data-count-mobile`), no la de desktop escalada. Escena más corta (recorrido de ~250–300 `svh` en lugar de 400–500) si el diseño lo permite.
- **Cambio de breakpoint:** al girar el dispositivo o redimensionar, el motor se reinicia con el set que corresponde.
- **`reduced-motion` / sin JS:** sin `js-motion` el canvas no existe y se muestran 3–5 imágenes clave con su texto (`motion-a11y.md`). Son imágenes distintas del primer frame cuando aporten, con `loading="lazy"`.
- **Ahorro de datos:** si el proyecto lo requiere, usar `navigator.connection?.saveData` para elegir el set móvil (○, no soportado en todos los navegadores; solo como mejora opcional).

## 8. Extraer y codificar

Comandos de partida (verificar versiones de ffmpeg y codecs del entorno; ajustar a cada proyecto):

```bash
# Muestrear a ~12 fps, escalar a 1280 de ancho y exportar WebP numerado
ffmpeg -i master.mp4 -vf "fps=12,scale=1280:-2" -c:v libwebp -quality 70 frames/v1/d-%04d.webp

# Versión móvil: menos fps y 720 de ancho
ffmpeg -i master.mp4 -vf "fps=8,scale=720:-2" -c:v libwebp -quality 65 frames/v1/m-%04d.webp

# Video para scrub: sin audio, keyframes en cada 2 frames
ffmpeg -i master.mp4 -vf "scale=1280:-2" -an -c:v libx264 -preset slow -crf 24 -g 2 -pix_fmt yuv420p -movflags +faststart scrub-d.mp4
```

Para AVIF, convertir los frames con una herramienta que lo soporte (por ejemplo `sharp` o `avifenc`) y comparar el peso contra WebP con `check-frames.mjs`: AVIF suele pesar menos, pero tarda más en decodificar en equipos modestos (○, medir). Nombres **versionados** (`/frames/v1/…`) para poder cachearlos con `immutable` (`templates/_headers`).

Después de generar: `node scripts/check-frames.mjs public/frames/v1 --profile desktop` y, para la serie móvil, `--profile mobile` apuntando a su carpeta (separar desktop y móvil en carpetas distintas para medirlos por separado).

## 9. Checklist

- [ ] Técnica elegida y razón registradas en el blueprint.
- [ ] Primer frame como `<img>` LCP (eager, `fetchpriority="high"`, dimensiones); H1 y capítulos como HTML.
- [ ] Plan de medios por breakpoint cumplido con `check-frames.mjs` (desktop y móvil por separado).
- [ ] Memoria de la ventana calculada; no hay `createImageBitmap` masivo.
- [ ] Motor arranca tras `load`; listener de scroll `passive`, activo solo con la escena visible; `destroy()` conectado.
- [ ] Versión sin movimiento (3–5 imágenes clave con texto) y versión móvil entregadas.
- [ ] Frames con nombres versionados y caché `immutable`.
- [ ] `measure-scroll.mjs` en perfil mobile dentro de los topes; verificado además en un dispositivo real.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| `<canvas>` no es candidato a LCP; `<video>` sí (poster o primer frame) | ◐ (resumen de búsqueda sobre web.dev, 2026-11-10) | https://web.dev/articles/lcp |
| Un frame decodificado ocupa ancho × alto × 4 bytes | ○ (aritmética estándar de RGBA 8 bits) | — |
| El navegador conserva los datos comprimidos de un `<img>` y decodifica al dibujar; `createImageBitmap` conserva píxeles decodificados | ○ | https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap — verificar con el panel Memory en el navegador objetivo |
| El seek de `<video>` varía por navegador y mejora con keyframes frecuentes | ○ | Probar en dispositivos reales |
| Topes de frames, peso y memoria de §3–§4 | ○ | Criterios propios de la skill (perfiles de `check-frames.mjs`), no normas |
| Comandos de ffmpeg de §8 | ○ | Plantillas **no ejecutadas** al escribir esta guía: validar en el entorno del proyecto |
| Caso medido de 504 frames, 59,5 MB, 1920×1080 | ✔ | Ejecutado con `check-frames.mjs` el 2026-11-10 sobre `web/frames` |
