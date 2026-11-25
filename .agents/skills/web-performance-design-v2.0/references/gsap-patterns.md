# Patrones de GSAP y ScrollTrigger (Nivel M2)

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Guía para el nivel **M2**. GSAP se usa cuando CSS (`animation-timeline`, M0) o un bucle ligero de `requestAnimationFrame` (M1) no alcanzan: timelines encadenados con múltiples fases, `scrub` con suavizado, `pin` con sub-animaciones horizontales o `SplitText` accesible.

## Contenido

1. Cuándo entra GSAP (y cuándo no)
2. Carga diferida y chunk único compartido
3. `gsap.matchMedia()` y `prefers-reduced-motion`
4. Estados iniciales seguros (`html.js-motion`)
5. Configuración de ScrollTrigger en móvil
6. `SplitText` accesible
7. Sincronizar GSAP con un canvas de frames
8. Uso dentro de islas React (`useGSAP` y `contextSafe`)
9. Checklist M2

## 1. Cuándo entra GSAP (y cuándo no)

- **NO usar GSAP** para: fades simples al entrar en viewport (usar `.reveal` en CSS, M0), transiciones de hover, ni para reproducir una secuencia de frames sin otras capas encadenadas (usar `templates/frame-sequence.js`, M1).
- **SÍ usar GSAP** para: escenas donde un mismo recorrido de scroll encadena múltiples elementos con tiempos relativos (HUD + tarjetas + zoom + llamadas técnicas), galerías horizontales ancladas o revelados tipográficos por líneas/palabras con `SplitText`.
- **Nunca mezclar CSS `transition`/`animation` y GSAP sobre la misma propiedad del mismo elemento**: compiten en cada frame y producen tirones.

## 2. Carga diferida y chunk único compartido

GSAP core (~23–26 KB gzip, ◐) + ScrollTrigger (~7–10 KB gzip, ◐) nunca deben formar parte del JS crítico:

1. **Un solo módulo cargador** (`src/scripts/gsap-scroll.js`, plantilla en `templates/gsap-scroll.js`) importa `gsap` y los plugins usados y los registra una única vez, para que Vite/Rollup emita un solo chunk diferido compartido.
2. **Carga tras el LCP o por cercanía:** el `import()` dinámico se dispara cuando la primera escena `[data-gsap-scene]` se acerca al viewport (`IntersectionObserver` con `rootMargin: '400px 0px'`) o en `requestIdleCallback` después de `window.load`.
3. **Importar solo los plugins necesarios:** no importar paquetes completos si solo se usa `ScrollTrigger`.

## 3. `gsap.matchMedia()` y `prefers-reduced-motion`

Toda animación de GSAP debe declararse dentro de `gsap.matchMedia()` (◐). Así GSAP revierte automáticamente estilos inline, timelines y ScrollTriggers cuando cambia el breakpoint o cuando el usuario activa `prefers-reduced-motion: reduce`:

```js
const mm = gsap.matchMedia();

mm.add(
  {
    isDesktop: '(min-width: 768px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  },
  (context) => {
    const { isDesktop, reduceMotion } = context.conditions;
    if (reduceMotion) return; // En reduced-motion no se registra ningún scrub ni pin

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: isDesktop ? 0.4 : true,
      },
    });
    tl.fromTo(
      root.querySelectorAll('[data-gsap-step]'),
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, stagger: 0.25 }
    );
  },
  root // scope: limita selectores al contenedor de la escena
);
```

## 4. Estados iniciales seguros (`html.js-motion`)

Un fallo clásico con `gsap.from()` es que, si el chunk diferido tarda o falla, el elemento pega un salto visual (flash de contenido sin animar) o, peor, queda en `opacity: 0` si alguien lo ocultó en CSS global.

- **Prohibido** ocultar elementos con `[data-gsap-step] { opacity: 0 }` sin condicionar.
- **Regla:** si un elemento necesita arrancar oculto antes de que cargue GSAP, ocultarlo en CSS **únicamente bajo `html.js-motion`** (por ejemplo `.js-motion [data-gsap-init="hidden"] { opacity: 0; transform: translateY(1.5rem); }`) y animarlo con `gsap.to(..., { opacity: 1, y: 0 })` o `fromTo`.
- **Prohibido** aplicar estados ocultos o animaciones de GSAP al H1 o a la imagen LCP.

## 5. Configuración de ScrollTrigger en móvil

- Activar `ScrollTrigger.config({ ignoreMobileResize: true })` (◐) una vez al registrar el plugin: evita que el cambio de altura de la barra de direcciones en iOS/Android recalcule todos los puntos de inicio/fin en mitad del scroll.
- Llamar a `ScrollTrigger.refresh()` solo cuando cambie la altura real del DOM (por ejemplo, al abrir un acordeón largo o cargar una sección dinámica), nunca dentro de un bucle.
- Limitar las propiedades animadas a `x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation` y `autoAlpha`/`opacity`.

## 6. `SplitText` accesible

Cuando el diseño pida revelar titulares secundarios por líneas o palabras:

- **Nunca** aplicar `SplitText` al `<h1>` (protege el LCP y la indexación limpia del titular principal).
- Usar `SplitText.create(el, { type: 'lines,words' })` (gratuito en GSAP, ◐), que añade `aria-label` con el texto completo en el elemento padre y marca los fragmentos internos con `aria-hidden="true"` (◐). Verificar en el DOM resultante que el padre conserve `aria-label` y que en `prefers-reduced-motion: reduce` no se ejecute el split.
- Preferir `type: 'lines'` sobre `type: 'chars'`: crea muchos menos nodos DOM y reduce el costo de estilo y layout.

## 7. Sincronizar GSAP con un canvas de frames

Si una escena necesita que el frame del `<canvas>` y varias tarjetas o marcadores del HUD sigan exactamente el mismo timeline con `scrub`:

- Reutilizar la carga progresiva y ventana de decodificación de `frame-sequence.js`, o animar un objeto `{ frame: 0 }` en el timeline de GSAP (`tl.to(state, { frame: count - 1, snap: 'frame', onUpdate: () => draw(state.frame) }, 0)`).
- Aun en este caso, la descarga de frames comienza después de `window.load` y respeta los topes de `check-frames.mjs`.

## 8. Uso dentro de islas React (`useGSAP` y `contextSafe`)

Si una isla React (nivel M3, por ejemplo el configurador en modo Showroom) usa GSAP internamente:

- Usar el hook oficial `useGSAP(() => { ... }, { scope: containerRef })` de `@gsap/react` (◐) en lugar de `useEffect` manual: limpia automáticamente timelines, `ScrollTrigger` y `matchMedia` al desmontar y es seguro con `StrictMode`.
- Para animaciones disparadas por eventos de usuario (`onClick`, cambio de color o llanta), envolver el handler con `const { contextSafe } = useGSAP({ scope: containerRef })` para que esas animaciones también queden registradas en el contexto y se limpien al desmontar.

## 9. Checklist M2

- [ ] Justificado en el blueprint por qué la escena requiere M2 en vez de M0/M1.
- [ ] GSAP se importa desde un único módulo diferido (`templates/gsap-scroll.js`); JS crítico sigue ≤ 15 KB gzip.
- [ ] `gsap.matchMedia()` envuelve las animaciones y no ejecuta nada en `prefers-reduced-motion: reduce`.
- [ ] `ScrollTrigger.config({ ignoreMobileResize: true })` activo.
- [ ] Ningún elemento usa CSS `transition` sobre la misma propiedad que anima GSAP.
- [ ] El H1 y la imagen LCP no pasan por GSAP ni por `SplitText`.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| Licencia gratuita de GSAP + ScrollTrigger + SplitText y pesos aproximados (core ~23–26 KB, ScrollTrigger ~7–10 KB gzip) | ◐ (2026-11-10, secundarias) | https://gsap.com/pricing/ y build real con `check-budget.mjs` |
| `gsap.matchMedia()`, `ScrollTrigger.config({ ignoreMobileResize: true })`, `SplitText` con `aria-label`/`aria-hidden`, y `@gsap/react` (`useGSAP`, `contextSafe`) | ◐ (2026-11-10, resumen sobre docs de GSAP) | https://gsap.com/docs/v3/ |
| Regla de no aplicar GSAP/SplitText al H1 ni al LCP | ○ | Criterio propio de la skill para proteger LCP y SEO |

