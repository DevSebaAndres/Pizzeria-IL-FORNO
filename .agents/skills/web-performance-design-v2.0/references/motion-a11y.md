# Accesibilidad del movimiento (`prefers-reduced-motion`, `html.js-motion` y teclado)

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 180 días · Fuentes y estado al final de este documento.

En un sitio con scrollytelling, desactivar las animaciones dejando un contenedor vacío de 400 `svh` rompe la experiencia. Esta guía define cómo construir la **versión sin movimiento** como entregable de primera clase y cómo proteger la navegación por teclado y lectores de pantalla.

## Contenido

1. El contrato de `html.js-motion`
2. Qué debe ocurrir con `prefers-reduced-motion: reduce` (o sin JS)
3. Diseño de la versión editorial estática (3–5 imágenes clave)
4. Navegación por teclado, foco y enlaces de salto
5. Confort vestibular y límites de parpadeo
6. Checklist de accesibilidad de movimiento

## 1. El contrato de `html.js-motion`

`BaseLayout.astro` incluye en `<head>` un script inline de una línea:

```html
<script is:inline>
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('js-motion');
</script>
```

Consecuencias obligatorias en todo el proyecto:

1. **Sin `html.js-motion`** (porque el usuario pidió `prefers-reduced-motion: reduce` o porque el navegador/bot no ejecuta JS), **ningún elemento de contenido puede tener `opacity: 0`, `visibility: hidden` ni un `transform` que lo deje fuera de pantalla**.
2. Toda regla CSS que prepare un estado inicial oculto para M1 o M2 debe escribirse bajo `.js-motion`:
   ```css
   html.js-motion [data-gsap-init="hidden"] {
     opacity: 0;
     transform: translateY(1.25rem);
   }
   ```
3. **Nunca** aplicar un estado oculto (con o sin `.js-motion`) al `<h1>` ni a la imagen LCP.
4. Si el usuario cambia la preferencia del sistema en caliente, los motores M1 y `gsap.matchMedia()` (M2) detienen o revierten las animaciones atadas al scroll.

## 2. Qué debe ocurrir con `prefers-reduced-motion: reduce`

| Componente | Con movimiento (`html.js-motion`) | Con `prefers-reduced-motion: reduce` (o sin JS) |
|---|---|---|
| Pista de scrollytelling (`FrameSequence` / escena M1-M2) | Altura extendida (`250–400svh`), escenario `sticky`, `<canvas>` activo | Altura normal (`min-height: auto`), escenario estático, `<canvas>` oculto y **galería editorial de 3–5 imágenes clave** junto a los capítulos |
| Revelados de sección (`.reveal`, M0) | `animation-timeline: view()` con fade + desplazamiento suave | Contenido visible desde el inicio, sin animación |
| Sticky stack de colección | Tarjetas `sticky` con escala suave al cubrirse | Tarjetas apiladas con espaciado normal o `sticky` sin transformación de escala |
| Configurador React (M3) | Cambio de capa con transición corta de opacidad (≤ 200 ms) | Cambio instantáneo de capa; 100 % funcional |
| Scroll de anclas (`#seccion`) | `scroll-behavior: smooth` | Salto instantáneo (`scroll-behavior: auto`) |

Nota: "reducir movimiento" no prohíbe transiciones de `opacity` breves (≤ 200 ms) para dar feedback de estado (por ejemplo, cambiar una pestaña o color en el configurador), sino el **movimiento espacial grande** (parallax, scrub continuo, zoom, giros, desplazamiento de pantalla).

## 3. Diseño de la versión editorial estática (3–5 imágenes clave)

Cada escena con secuencia de frames incluye en su marcado un bloque `.seq-stills` (`templates/FrameSequence.astro`) con 3 a 5 fotogramas representativos del recorrido (por ejemplo: vista frontal, perfil, detalle del motor, postura trasera):

- Con `html.js-motion`, `.seq-stills` se oculta (`display: none`) y no descarga sus imágenes (`loading="lazy"`).
- Sin `html.js-motion`, el `<canvas>` se oculta y cada capítulo narrativo se muestra emparejado con su imagen clave correspondiente en un layout editorial limpio, sin requerir 400 `svh` de scroll vacío.

## 4. Navegación por teclado, foco y enlaces de salto

- **Prohibido atrapar el foco o el teclado:** `Tab`, `Shift+Tab`, `Espacio`, `RePág`/`AvPág`, `Inicio`/`Fin` y las flechas deben recorrer la página sin interferencia.
- **Saltar escena larga:** cuando una escena de scrollytelling supere `250svh`, incluir al inicio de la sección un enlace `<a class="skip-link" href="#siguiente-seccion">Saltar animación e ir al catálogo</a>` visible al recibir foco (`:focus-visible`).
- **Orden de tabulación:** los enlaces o botones dentro de los capítulos de una escena `sticky` deben recibir foco en el mismo orden visual en que aparecen; al recibir foco, el navegador debe poder desplazarlos a la vista sin que un script fuerce `window.scrollTo` en contra.

## 5. Confort vestibular y límites de parpadeo

- Ningún elemento puede parpadear o destellar más de **3 veces por segundo** (WCAG 2.3.1).
- Evitar movimientos opuestos simultáneos en áreas grandes del viewport (por ejemplo, fondo desplazándose a la izquierda mientras un primer plano grande se desplaza a la derecha y hace zoom).
- Mantener un punto de referencia estable en pantalla (navbar o marco del HUD) durante las escenas de scrollytelling.

## 6. Checklist de accesibilidad de movimiento

- [ ] Con JS desactivado o con `prefers-reduced-motion: reduce`, toda la página se lee de principio a fin sin huecos en blanco ni textos invisibles.
- [ ] Cada escena de secuencia tiene su bloque `.seq-stills` con 3–5 imágenes clave y `alt` descriptivo.
- [ ] Enlace "Saltar escena" presente y visible con `:focus-visible` en escenas > `250svh`.
- [ ] Ningún elemento parpadea > 3 veces por segundo.
- [ ] Probado en DevTools activando `Emulate CSS media feature prefers-reduced-motion: reduce`.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| WCAG 2.2 criterio 2.3.1 (Three Flashes or Below Threshold) y 2.3.3 (Animation from Interactions) | ○ | https://www.w3.org/TR/WCAG22/#seizures-and-physical-reactions |
| En `display: none`, `<img loading="lazy">` no se descarga en navegadores modernos | ○ | https://html.spec.whatwg.org/multipage/urls-and-fetching.html#lazy-loading-attributes |
| Patrón `html.js-motion` y galería de 3–5 imágenes clave | ○ | Convención propia de la skill (`templates/BaseLayout.astro` y `templates/FrameSequence.astro`) |

