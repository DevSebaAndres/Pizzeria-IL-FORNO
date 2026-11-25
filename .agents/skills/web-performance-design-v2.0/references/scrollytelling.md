# Arquitectura de Scrollytelling (capítulos, pin, progreso y ciclo de vida)

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Define cómo estructurar escenas narrativas atadas al scroll en los niveles **M0, M1 y M2**, manteniendo el texto indexable en el HTML inicial, el LCP intacto y la fluidez en móvil.

## Contenido

1. Anatomía de una escena de scrollytelling
2. Elección de técnica de pin (`position: sticky` vs ScrollTrigger pin)
3. Presupuesto de altura (cuántos `svh` por escena)
4. Sincronización de capítulos de texto con el fondo visual
5. Ciclo de vida: activación por visibilidad y limpieza
6. Reglas para móvil
7. Checklist de escena

## 1. Anatomía de una escena de scrollytelling

Toda escena de scrollytelling separa **tres capas en el DOM**:

1. **Pista de scroll (`<section class="scene-track">`)**: contenedor con la altura total del recorrido (por ejemplo `min-height: 320svh` en desktop, `220svh` en móvil) y un heading semántico (`<h2>` o `aria-labelledby`).
2. **Escenario fijo (`<div class="scene-stage">`)**: contenedor `position: sticky; top: 0; height: 100svh; overflow: hidden` que aloja el fondo visual (`<img>` LCP + `<canvas>` o `<video>` o capas SVG/CSS).
3. **Columna narrativa (`<ol class="scene-chapters">`)**: lista ordenada de pasos o capítulos con **texto HTML real** que fluye por encima del escenario fijo (o se revela por rangos de progreso), garantizando que Googlebot, los rastreadores de IA y los lectores de pantalla lean toda la historia sin ejecutar JavaScript.

```html
<section id="historia-f40" class="scene-track" aria-labelledby="f40-title">
  <div class="scene-stage">
    <!-- Fondo visual: img LCP + canvas (M1) o capas animadas (M0/M2) -->
  </div>
  <div class="scene-narrative">
    <h2 id="f40-title">Ingeniería biturbo de Maranello</h2>
    <ol class="scene-chapters">
      <li class="chapter" data-step="0">
        <h3>Chasis tubular y kevlar</h3>
        <p>Construido con paneles compuestos visibles bajo la pintura original…</p>
      </li>
      <li class="chapter" data-step="1">
        <h3>V8 2.9 L Twin-Turbo · 478 CV</h3>
        <p>Entrega mecánica pura sin asistencias electrónicas…</p>
      </li>
    </ol>
  </div>
</section>
```

## 2. Elección de técnica de pin

| Caso | Técnica obligatoria | Motivo |
|---|---|---|
| Escenario fijo mientras los capítulos pasan por encima o mientras un canvas actualiza su frame | **`position: sticky; top: 0; height: 100svh`** en CSS | Lo resuelve el compositor del navegador sin JS; no inserta wrappers `pin-spacer` ni recalcula layout en `resize` |
| Secuencia encadenada donde varios paneles horizontales o capas internas cambian de dirección dentro del mismo pin | **GSAP ScrollTrigger `pin: true`** (nivel M2) | Necesario cuando la geometría interna depende del timeline de GSAP |

Regla: **nunca usar `pin: true` de GSAP si `position: sticky` en CSS resuelve el anclaje**. Incluso en escenas M1 (secuencia de frames) y en muchas M2, el pin lo hace CSS con `position: sticky` y el JS solo lee el progreso de la sección madre. Para que `position: sticky` funcione, ningún ancestro entre la sección y `body` debe tener `overflow: hidden` o `overflow: auto` (usar `overflow: clip` si hace falta recortar desbordes horizontales).

## 3. Presupuesto de altura

Una pista demasiado larga cansa al usuario y da sensación de "scroll atascado"; una demasiado corta hace saltar los frames:

- **Desktop:** `250svh` a `400svh` por escena con secuencia (≈ 60–90 `svh` por capítulo narrativo). Máximo recomendado en toda la página: ≤ 2 escenas largas de scrollytelling.
- **Móvil:** reducir a `180svh`–`280svh` (el gesto táctil recorre menos píxeles por segundo que una rueda de escritorio).
- **`prefers-reduced-motion: reduce`:** altura automática (`min-height: auto`), `position: static` en el escenario y capítulos mostrados en flujo normal junto a sus imágenes clave (`motion-a11y.md`).

## 4. Sincronización de capítulos de texto

Tres patrones según el nivel de movimiento:

- **M0 (flujo natural + CSS):** los `<li class="chapter">` están espaciados verticalmente (por ejemplo `margin-block: 55svh`) y pasan de forma natural sobre el fondo `sticky`, con `.reveal` (`animation-timeline: view()`) para suavizar su entrada. Cero JS.
- **M1 (capítulos fijos por rango de progreso):** los capítulos se superponen en el HUD y el mismo bucle `requestAnimationFrame` de la escena marca `data-active="true"` en el capítulo cuyo rango `[start, end]` contiene `progress`. Las transiciones de entrada/salida las hace CSS con `opacity` y `transform`.
- **M2 (timeline de GSAP):** un único `gsap.timeline({ scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 0.4 } })` coordina las fases de los capítulos y los indicadores del HUD (`gsap-patterns.md`).

En los tres casos, **sin la clase `html.js-motion`** todos los capítulos quedan visibles en flujo normal (`opacity: 1; position: static`).

## 5. Ciclo de vida: activación por visibilidad y limpieza

1. **Geometría cacheada:** `top` y `height` de la pista se calculan al entrar en viewport y en `ResizeObserver`, **nunca** dentro del listener de `scroll` ni en cada `requestAnimationFrame`.
2. **Encendido y apagado:** un `IntersectionObserver` con `rootMargin: '200px 0px'` activa el listener `{ passive: true }` cuando la escena se acerca y lo desconecta cuando sale. Fuera de pantalla, el costo de CPU de la escena debe ser **0**.
3. **Destrucción limpia:** todo inicializador devuelve `destroy()` para desconectar listeners, `IntersectionObserver`, `ResizeObserver` y instancias de ScrollTrigger al cambiar de ruta o de breakpoint.

## 6. Reglas para móvil

- Usar siempre `100svh` (small viewport height) en el escenario fijo para evitar saltos cuando la barra de direcciones del navegador móvil se oculta o reaparece.
- Los paneles de texto o HUD sobre el escenario deben ocupar ≤ 35 % de la altura del viewport móvil y colocarse en el tercio inferior o superior para no tapar el sujeto principal del canvas/imagen.
- No interceptar eventos `touchstart`/`touchmove` ni usar `preventDefault()` sobre el scroll vertical.

## 7. Checklist de escena

- [ ] Pista con heading semántico y capítulos en HTML real (legibles sin JS).
- [ ] Pin resuelto con `position: sticky` + `overflow: clip` (o justificado en M2 si usa `pin: true`).
- [ ] Altura en `svh` dentro del rango (desktop ≤ 400svh, móvil ≤ 280svh, `auto` en `reduced-motion`).
- [ ] Listener de scroll `passive`, sin lecturas de layout en el bucle, apagado fuera de viewport.
- [ ] En móvil, el texto del capítulo no tapa el sujeto principal y deja margen para el pulgar.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| `position: sticky` corre en el compositor y `overflow: hidden` en un ancestro lo desactiva (`overflow: clip` no crea contenedor de scroll) | ○ | https://developer.mozilla.org/en-US/docs/Web/CSS/position y https://developer.mozilla.org/en-US/docs/Web/CSS/overflow |
| Unidades `svh` evitan saltos por la barra de direcciones móvil | ○ | https://web.dev/articles/viewport-units |
| `animation-timeline: view()` es Baseline 2026 (Chrome 115+, Safari 26+, Firefox 159+) | ◐ (2026-11-10, secundarias) | https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline |
| Rangos de altura en `svh` y límite de 2 escenas largas por página | ○ | Criterios propios de la skill, ajustar con pruebas de usuario |

