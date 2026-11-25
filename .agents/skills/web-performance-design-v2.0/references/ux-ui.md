# UX/UI v2: convenciones prácticas para sitios cinematográficos y scrollytelling

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 180 días · Fuentes y estado al final de este documento.

Complementa a `references/sistema-visual.md` y `references/scrollytelling.md` con las reglas de uso que deciden si un sitio con animaciones avanzadas se entiende, no marea y convierte.

## Contenido

1. Jerarquía visual y layout
2. Tipografía y espaciado
3. Color y modos cromáticos (Garage / Showroom)
4. CTA y conversión
5. UX del scrollytelling y del configurador (específico v2)
6. Formularios
7. Móvil primero
8. Navegación y orientación
9. Confianza y microcopy
10. Estados y feedback
11. Banners, popups y terceros
12. Checklist de revisión

## 1. Jerarquía visual y layout

- En cada pantalla o capítulo de scroll debe haber **un solo foco primario**: el vehículo/producto o un titular dominante con su acción.
- **Above the fold en móvil (360×640 px):** debe verse el titular H1, qué ofrece el sitio, el primer frame nítido del hero y el CTA o indicador de inicio de recorrido sin obligar a adivinar.
- Rejilla de 12 columnas en desktop y 4 en móvil, con espacio negativo generoso (`space-2xl`) entre escenas para descansar la vista después de una sección con movimiento.

## 2. Tipografía y espaciado

- Texto de cuerpo **≥ 16 px** (evita zoom automático en iOS al enfocar inputs). Interlineado 1.5–1.7 en cuerpo, 0.95–1.15 en titulares display.
- Longitud de línea **45–75 caracteres** (`max-width: 65ch`). En tarjetas flotantes sobre un escenario de scrollytelling, preferir bloques aún más breves (25–45 palabras por capítulo) para que se lean de un vistazo mientras se avanza.
- Máximo 2 familias autoalojadas en WOFF2.

## 3. Color y modos cromáticos (Garage / Showroom)

- Regla orientativa 60-30-10: 60 % superficie base, 30 % contenedores/estructura, 10 % acento de acción.
- Cuando el diseño combine un ambiente editorial claro (*Garage*) y un escenario oscuro (*Showroom*), la transición entre ambos debe coincidir con un cambio de sección claro (por ejemplo, al entrar al Hero o al Configurador Showroom) y **ambos ambientes** deben pasar `scripts/contrast.mjs`.
- No transmitir información solo con color (por ejemplo, en los selectores de pintura del configurador, mostrar siempre el nombre y código del color junto al círculo cromático).

## 4. CTA y conversión

- **Un CTA primario por vista**, con verbo + resultado ("Personalizar este clásico", "Descargar El Lienzo", "Explorar catálogo").
- El CTA es siempre un `<a>` o `<button>` nativo con área táctil ≥ 44×44 px.
- Durante una escena larga de scrollytelling, el usuario no debe quedar encerrado sin salida: la navbar o un botón discreto permite ir directo al catálogo o a la acción principal en cualquier momento.

## 5. UX del scrollytelling y del configurador (específico v2)

- **Control del usuario:** la animación atada al scroll responde proporcionalmente al movimiento del dedo o rueda. Prohibido bloquear el scroll durante varios segundos obligando a ver una animación automática.
- **Indicador de progreso discreto:** en escenas con pin (`> 200svh`), incluir una señal visual mínima (barra de progreso fina o numeración de capítulo `01 / 04`) para que el visitante sepa cuánto dura la escena.
- **Legibilidad sobre fondo cambiante:** las tarjetas de capítulo sobre el `<canvas>` deben tener su propio respaldo de contraste (superficie sólida o placa oscura con `backdrop-filter` estático) verificado contra el frame más claro o más oscuro según corresponda.
- **UX del Configurador (M3):**
  - En desktop, relación sugerida 70 % lienzo visual / 30 % panel de controles; en móvil, lienzo arriba (`sticky` o fijo en la parte superior del bloque) y controles debajo en pestañas compactas para que al cambiar un color se vea el resultado sin hacer scroll arriba y abajo.
  - Mostrar siempre qué opción está activa (borde, check y etiqueta de texto).

## 6. Formularios

- `<label>` visible en cada campo, tipos y `autocomplete` correctos (`name`, `email`, `tel`), mensajes de error en texto claro asociados con `aria-describedby` y altura táctil ≥ 44 px.

## 7. Móvil primero

- Verificar a 360 px de ancho y con reflujo a 320 px CSS sin scroll horizontal (WCAG 1.4.10).
- Ningún control esencial puede depender de `:hover` (los hotspots del showroom deben abrirse con `click`/toque y cerrarse fácilmente en pantalla táctil).
- Usar `100svh` y `env(safe-area-inset-*)`.

## 8. Navegación y orientación

- Anclas `#seccion` con `scroll-margin-top` para que la barra fija no tape el titular.
- Orden de tabulación lógico, `:focus-visible` nítido y enlace "Saltar al contenido" (más enlace "Saltar escena" en scrollytelling largo).

## 9. Confianza y microcopy

- Datos técnicos e históricos verificables (en fichas de vehículos o productos, no inventar especificaciones; si falta un dato, usar `TODO_` y consultarlo).
- Sin urgencia falsa ni contadores inventados.

## 10. Estados y feedback

- Estados normal, hover, `:focus-visible`, activo y deshabilitado en todos los controles.
- Respuesta visual inmediata al toque o clic (< 100 ms; protege el INP). Si una capa de alta resolución del configurador tarda en cargar, mostrar un indicador de carga sutil sobre el lienzo sin desmontar la imagen anterior.

## 11. Banners, popups y terceros

- Sin popups intrusivos encima del scrollytelling. Terceros cargados tras interacción o en idle (`references/stack-performance.md` §8).

## 12. Checklist de revisión

- [ ] En 360×640 se ve el H1, la propuesta de valor, el primer frame y el CTA sin scrollear.
- [ ] Capítulos de scrollytelling breves (≤ 45 palabras), con contraste AA garantizado sobre cualquier frame.
- [ ] Indicador de progreso y opción de saltar en escenas > 200 `svh`.
- [ ] Configurador usable en móvil sin tener que scrollear para ver el cambio aplicado.
- [ ] Objetivos táctiles ≥ 44 px; hotspots y controles operables por toque y teclado (sin depender de hover).
- [ ] Sin scroll horizontal a 320 px ni a 200 % de zoom.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| WCAG 2.2 criterios 2.5.8 (Target Size), 1.4.10 (Reflow) y 1.3.5 (Identify Input Purpose) | ○ | https://www.w3.org/TR/WCAG22/ |
| Convenciones de UX de scrollytelling y configurador 70/30 | ○ | Criterios de diseño de la skill y del `DESIGN.md` del proyecto |
