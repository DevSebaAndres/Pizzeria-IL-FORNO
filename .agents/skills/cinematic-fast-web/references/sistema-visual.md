# Sistema visual cinematográfico, versión CSS-first

Traduce cada sección de `landing-cinematica` a una implementación que conserva el look y respeta el presupuesto. Los fragmentos son patrones de partida: adaptar nombres y valores a la marca y **probarlos en navegador** antes de entregar.

## Contenido

1. Tokens y reglas globales
2. Movimiento: política general
3. Navbar isla flotante
4. Hero
5. Dashboard (3 tarjetas)
6. Manifiesto
7. Colección: sticky stack
8. Planes / Newsletter
9. Footer
10. Accesibilidad

## 1. Tokens y reglas globales

- 4 colores de marca en `@theme` (`--color-primary`, `--color-accent`, `--color-bg`, `--color-ink`), más derivados (`color-mix()`).
- Radios generosos: `--radius-card: 2rem`, `--radius-hero: 3rem`, `--radius-footer: 4rem`.
- Sans (títulos y UI) + Serif itálica (acentos masivos) + mono del sistema (taglines).
- Textura: tile de ruido WebP/PNG ≤ 4 KB repetido en un pseudo-elemento fijo con `opacity: .05` y `pointer-events: none`. No usar `feTurbulence` sobre `body`.
- `scroll-behavior: smooth` solo bajo `prefers-reduced-motion: no-preference`.
- `html { scrollbar-gutter: stable }` para evitar CLS por scrollbar en desktop.

## 2. Movimiento: política general

- Solo `transform` y `opacity`. Duraciones 300–700 ms, easings tipo `cubic-bezier(0.22, 1, 0.36, 1)`.
- Contenido siempre visible sin JS ni soporte de animación: las animaciones son **mejora progresiva** (`@supports`).
- Envolver todo en `@media (prefers-reduced-motion: no-preference)`.
- `will-change` solo en elementos que realmente se animan, y quitarlo al terminar.
- Revelado al scroll (patrón):

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 55%;
    }
    @keyframes reveal {
      from { opacity: 0; transform: translateY(1.5rem); }
      to   { opacity: 1; transform: none; }
    }
  }
}
```
Prohibido aplicar `.reveal` al H1 del hero o a cualquier candidato a LCP. Sin soporte de `animation-timeline`, el contenido se ve estático, completo y correcto.

- "Split reveal" de texto: no partir letras en `<span>` con JS. Revelar por líneas/bloques con `.reveal` y `animation-delay` escalonado con `--i`. Mantener el texto como párrafo real (los motores lo leen entero).

## 3. Navbar isla flotante

- `position: fixed; top: max(1rem, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%)`; forma píldora, `z-index` alto.
- Inicial: fondo transparente, texto claro. Con scroll > 50 px: clase `.is-scrolled` → fondo `color-mix(in srgb, white 60%, transparent)`, `backdrop-filter: blur(12px)`, borde sutil, texto `--color-primary`. El `backdrop-filter` solo en este elemento pequeño.
- Detección del scroll sin listener de `scroll`: un centinela de 1 px al inicio de la página observado con `IntersectionObserver`:

```html
<div id="top-sentinel" style="position:absolute;top:50px;height:1px;width:1px"></div>
<script is:inline>
  const nav = document.querySelector('[data-nav]');
  new IntersectionObserver(([e]) => nav.classList.toggle('is-scrolled', !e.isIntersecting))
    .observe(document.getElementById('top-sentinel'));
</script>
```
- Enlaces con `<a href="#seccion">`. En móvil, menú con `<details>` o checkbox, sin JS.
- El "logo" es texto/SVG inline con el nombre del negocio.

## 4. Hero

- `min-height: 100svh`. Imagen como `<img>` con `object-fit: cover` (es el LCP: eager + `fetchpriority="high"` + AVIF), `position:absolute; inset:0`.
- Overlay: `linear-gradient(to top, color-mix(in srgb, var(--color-primary) 92%, black) 0%, transparent 70%)`.
- Contenido en el tercio inferior-izquierdo.
- **H1** con dos tipografías, un solo elemento y texto continuo para SEO:

```html
<h1>
  <span class="font-sans font-bold">Plomería de urgencia en </span>
  <span class="font-serif italic text-[clamp(3rem,12vw,9rem)] leading-[.9]">Yerba Buena.</span>
</h1>
```
  La keyword de servicio + localidad va **dentro del H1**, no solo en el diseño.
- Debajo del H1: la frase de entidad AEO como `<p>` o `<blockquote class="aeo-entity">` visible (ver `aeo-geo.md`). Tagline monoespaciado aparte.
- CTA magnético: `transition: transform .3s`, `:hover { transform: scale(1.03) }`, capa deslizante con `::before` y `transform: translateY(100%) → 0` bajo `overflow:hidden`. Es un `<a>` con `href`, no un `<button>` con JS.
- Entrada del contenido secundario (tagline, CTA): keyframes `fade-up` con `animation-delay` escalonado. El H1 no se anima.

## 5. Dashboard (3 tarjetas, `grid-cols-1 md:grid-cols-3`)

Todo el texto está en el HTML; el movimiento es solo CSS. Contenedores con `aspect-ratio` o `min-height` fijos para no generar CLS.

### Tarjeta 1 — Clasificador (3 elementos que ciclan)
Lista de N elementos + el primero duplicado al final (`aria-hidden="true"`) para loop continuo. Ventana de altura `--row` con `overflow:hidden`.

```css
.cls-list { animation: cls 9s infinite; animation-timing-function: cubic-bezier(.34,1.56,.64,1); }
@keyframes cls {
  0%, 28%   { transform: translateY(0); }
  33%, 61%  { transform: translateY(calc(var(--row) * -1)); }
  66%, 94%  { transform: translateY(calc(var(--row) * -2)); }
  100%      { transform: translateY(calc(var(--row) * -3)); }
}
```

### Tarjeta 2 — Feed en vivo (mensajes que se "escriben")
Tres mensajes apilados con `position:absolute`. Ancho animado con `steps()` en unidades `ch` (fuente monoespaciada). **`width` en un elemento que no afecta al layout** (contenedor de altura fija y mensajes absolutos) no provoca CLS; aun así, si Lighthouse lo marca, cambiar a `clip-path: inset(0 100% 0 0)` → `inset(0)`.

```css
.msg { position:absolute; inset-inline:0; white-space:nowrap; overflow:hidden; width:0;
       font-family: ui-monospace, monospace; border-right:2px solid var(--color-accent);
       animation: type 9s infinite; animation-delay: calc(var(--i) * -6s); }
@keyframes type {
  0%      { width: 0; opacity: 1; }
  22%     { width: calc(var(--ch) * 1ch); }
  30%     { width: calc(var(--ch) * 1ch); opacity: 1; }
  33%,100%{ opacity: 0; width: 0; }
}
```
(`--ch` = cantidad de caracteres del mensaje, inyectada en el HTML desde los datos; `--i` = 0,1,2.) Punto de estado "en vivo": círculo con `animation: pulse` (transform/opacity) y texto del estado real del negocio.

### Tarjeta 3 — Protocolo semanal
Grid D L M X J V S estático; los días activos se marcan con una clase renderizada en build (no JS). Botón final = `<a href>` con el texto indicado.

## 6. Manifiesto

- Sección con fondo `--color-ink`, imagen Unsplash/propia como `<img>` en un contenedor `overflow:hidden` con paralaje por CSS:
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .parallax-img { animation: par linear both; animation-timeline: view(); }
    @keyframes par { from { transform: translateY(-6%); } to { transform: translateY(6%); } }
  }
}
```
 La imagen debe medir ~112 % de alto del contenedor para que el desplazamiento no deje bordes.
- Frase del sector convencional (tipografía grande, apagada) vs. contrapropuesta (Serif itálica masiva, color acento). Tercera línea mono con los valores separados por ` · `.
- Revelado por bloques con `.reveal`. El texto es real y está en el HTML.

## 7. Colección: sticky stack (3 tarjetas de 100svh)

Estructura estable en todos los navegadores:

```css
.stack { position: relative; }
.stack-card { position: sticky; top: 0; height: 100svh; display:grid; place-items:center; }
.stack-card > .inner { transition: transform .6s cubic-bezier(.22,1,.36,1), opacity .6s; border-radius: var(--radius-hero); }
.stack-card.is-covered > .inner { transform: scale(.92); opacity: .55; }
```
Marcar la tarjeta cubierta cuando la siguiente asoma (sin `blur`):
```html
<script is:inline>
  const cards = [...document.querySelectorAll('.stack-card')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    const i = cards.indexOf(e.target);
    if (i > 0) cards[i - 1].classList.toggle('is-covered', e.intersectionRatio > .35);
  }), { threshold: [0, .35, 1] });
  cards.forEach(c => io.observe(c));
</script>
```
(El `IntersectionObserver` se ejecuta en un hilo cooperativo y no hace layout por frame; ajustar el umbral a ojo.)

- Cada tarjeta: número de experiencia, nombre grande (Sans + Serif itálica), descripción, `<a>` CTA y un **SVG inline único** animado con CSS (stroke-dashoffset, rotate, translate) que evoque la sensación pedida ("precisión y filo", "calor y vapor", "fluidez"). No repetir SVG. Mantener cada SVG < 3 KB, sin filtros (`<filter>`) ni `blur`.
- Con solo 2 servicios, la tercera tarjeta es "Próximamente" con el mismo sistema.
- Cada servicio tiene además su `<h2>`/`<h3>` y su descripción con palabras clave reales (para SEO) y, si procede, su propia página.

## 8. Planes / Newsletter

- Con planes: grid de 3 tarjetas; la central destacada (fondo `--color-primary`, botón `--color-accent`). Precios en HTML real. Si se muestran precios, que coincidan con los datos estructurados `Offer` (solo si se agregan).
- Sin planes: módulo de lista VIP con `<form action="…" method="post">` nativo + `<label>` visible. Sin JS para validar (atributos `required`, `type="email"`).

## 9. Footer

- Fondo `--color-ink`, `border-radius: var(--radius-footer) var(--radius-footer) 0 0`.
- 4 enlaces, NAP completo idéntico al de Google Business Profile (viene de `business.ts`), redes con `rel="me noopener"`, indicador de estado con punto verde pulsante (CSS) y texto mono.
- Enlaces a `/politica-de-privacidad` y, en modo local, enlace al perfil de Google Maps.

## 10. Accesibilidad (también suma SEO, AEO y Lighthouse)

Los bots de IA que no ejecutan JavaScript consumen el DOM de forma parecida a un lector de pantalla: un sitio semántico y accesible es también más legible para ellos.

- **Contraste WCAG 2.2 AA:** texto normal (< 18 px, o < 14 px en negrita) ≥ **4.5:1**; texto grande (≥ 18 px, o ≥ 14 px en negrita) ≥ **3:1**; componentes de UI (bordes, íconos funcionales) ≥ **3:1**; logos y texto decorativo, sin requisito.
- **Medir, no estimar:** `node scripts/contrast.mjs "#texto/#fondo" …` para cada par de la paleta (texto sobre fondo, texto sobre acento, botón sobre su fondo, texto atenuado). Ejemplos medidos: `#1a1a2e` sobre blanco 17.06:1; `#6c757d` sobre blanco 4.69:1 (apenas pasa); `#128C7E` sobre blanco **4.14:1 (falla para texto normal)**; `#25D366` sobre blanco 1.98:1 (falla). Un botón de WhatsApp con texto blanco necesita un verde más oscuro que el de la marca o texto oscuro.
- Revisar también los estados: hover, foco, deshabilitado, y el texto sobre imágenes con overlay (medir contra el punto más claro del gradiente).
- Un `<main>`, `<header>`, `<nav>` (con `aria-label`), `<footer>`; cada `<section>` con heading o `aria-labelledby`.
- Semántica nativa: `<button>`, `<a href>`, `<label for>` en cada campo; sin `div role="button"`.
- `alt` descriptivo en imágenes informativas; `alt=""` en decorativas. Formato WebP/AVIF.
- `prefers-reduced-motion`: ninguna animación ni transición significativa; el contenido queda visible.
- Foco visible (`:focus-visible`), objetivos táctiles ≥ 44 px, skip link "Saltar al contenido".
