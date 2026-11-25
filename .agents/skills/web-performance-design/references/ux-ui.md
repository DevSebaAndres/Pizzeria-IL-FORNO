# UX/UI: convenciones prácticas para landings y sitios de negocio

> **Última verificación:** 2026-10-21 · **Revalidar cada:** 180 días · Fuentes y estado al final de este documento.

Complementa a `references/sistema-visual.md` (cómo se construye cada sección) con las reglas de uso que deciden si el sitio convierte y se entiende. Son criterios de diseño ampliamente aceptados, no estadísticas: no citar porcentajes de conversión sin una fuente propia.

## Contenido

1. Jerarquía visual y layout
2. Tipografía y espaciado
3. Color
4. CTA y conversión
5. Formularios
6. Móvil primero
7. Navegación y orientación
8. Confianza y microcopy
9. Estados y feedback
10. Movimiento con propósito
11. Banners, popups y terceros
12. Checklist de revisión

## 1. Jerarquía visual y layout

- En cada pantalla debe haber **un solo foco primario**: un titular dominante, una acción principal. Lo secundario se ve secundario (menos peso, menos contraste, tamaño menor).
- **Above the fold en móvil (360×640 px aprox.):** debe verse el titular con servicio y lugar, la frase que explica qué es el negocio y el CTA principal. Si hace falta scroll para saber qué ofreces, rediseñar el hero.
- Alinear a una rejilla (12 columnas en desktop, 4 en móvil) y a una escala de espaciado (múltiplos de 4 u 8 px). Espacio en blanco generoso entre secciones: el estilo cinematográfico depende del ritmo, no de llenar.
- Agrupar por proximidad: lo relacionado va junto; separar lo distinto con espacio, no con líneas y cajas por todas partes.
- Patrón de lectura: en landings, escaneo en Z/F. Colocar titulares y CTAs donde cae el ojo, y dar a cada sección un titular que se entienda solo.

## 2. Tipografía y espaciado

- Texto de cuerpo **≥ 16 px** (en iOS, campos con menos de 16 px provocan zoom automático al enfocar). Interlineado 1.5–1.7 en cuerpo, 1.0–1.2 en titulares grandes.
- **Longitud de línea 45–75 caracteres** (`max-width: 65ch` como valor por defecto).
- Escala tipográfica con `clamp()` (fluida), 5–6 tamaños como máximo; jerarquía por tamaño y peso, no por mayúsculas ni subrayados decorativos.
- Máximo 2 familias (ya lo exige la skill). Serif itálica solo para énfasis, nunca para párrafos largos.
- Los enlaces dentro de texto se distinguen por más que el color (subrayado u otro indicador).

## 3. Color

- Regla orientativa 60-30-10: 60 % fondo/neutros, 30 % color de marca/superficies, 10 % acento (CTA, estados). El acento se reserva para lo accionable.
- No transmitir información **solo** con color (errores, estados, disponibilidad): añadir texto o ícono.
- Contraste AA medido con `scripts/contrast.mjs` (ver sección de accesibilidad en `references/sistema-visual.md`). Medir también hover, foco y deshabilitado.
- Modo oscuro: opcional. Si se ofrece, declarar `color-scheme` y revisar de nuevo los contrastes, las imágenes y las sombras.

## 4. CTA y conversión

- **Un CTA primario por pantalla**, repetido de forma coherente (hero, bloque intermedio, cierre). Texto con verbo y resultado: "Pedir presupuesto por WhatsApp", no "Enviar".
- Elegir el canal según el negocio local: WhatsApp (`wa.me` con texto prellenado) y llamada para urgencias; formulario corto para lo no urgente. Mostrar el teléfono como texto además del botón.
- El CTA debe parecer botón (contraste, tamaño, área) y ser un `<a>` o `<button>` nativo.
- Reducir fricción: decir qué pasa después del clic ("Te respondemos por WhatsApp en el horario indicado" solo si es cierto).
- Barra de CTA fija en móvil (opcional): altura ≤ 64 px, `padding-bottom: env(safe-area-inset-bottom)`, y `padding-bottom` equivalente en el `body` para no tapar contenido ni el footer. No usar widgets flotantes con JS.

## 5. Formularios

- Pedir solo lo imprescindible (en servicios locales, normalmente nombre, teléfono y mensaje).
- **`<label>` visible** en cada campo; el placeholder no reemplaza a la etiqueta.
- Tipos y atributos correctos: `type="email"`, `type="tel"`, `inputmode`, y `autocomplete` (`name`, `email`, `tel`) para autocompletar (WCAG 1.3.5).
- Validación nativa (`required`, `pattern`, `type`) y mensajes de error junto al campo, en texto claro, asociados con `aria-describedby`. Sin depender solo del color rojo.
- Campos y botones con altura táctil cómoda (≥ 44 px recomendado; WCAG 2.2 exige un mínimo de 24×24 px en AA).
- Estado de envío visible y mensaje de confirmación que diga qué sigue.
- Sin CAPTCHA intrusivo si se puede evitar (honeypot o verificación del lado del servidor).

## 6. Móvil primero

- Diseñar y verificar primero a 360 px de ancho; luego ampliar. Comprobar también a 200 % de zoom y con reflujo a 320 px CSS (WCAG 1.4.10): sin scroll horizontal.
- Objetivos táctiles ≥ 44×44 px con separación suficiente; acciones principales al alcance del pulgar (zona inferior) cuando tenga sentido.
- No depender de `hover`: todo lo que aparece al pasar el cursor debe tener equivalente táctil y de teclado.
- Usar `100svh` (no `100vh`) en pantallas completas, y `env(safe-area-inset-*)` en barras fijas.
- No secuestrar el scroll (sin scroll-jacking): el sticky stack usa `position: sticky` y scroll nativo.

## 7. Navegación y orientación

- Menú corto (4–6 elementos) con el CTA como último ítem. En una landing de una página, anclas `#seccion` con `scroll-margin-top` para que la barra fija no tape el titular.
- Indicar dónde está el usuario (estado activo) y permitir volver arriba sin esfuerzo.
- Breadcrumbs solo si hay jerarquía de varias páginas.
- Enlaces con texto descriptivo; los que abren otra pestaña, `rel="noopener"` y aviso visible.
- Teclado: orden de tabulación lógico, foco visible, skip link al inicio.

## 8. Confianza y microcopy

- Pruebas **reales y verificables**: fotos propias del negocio y del equipo antes que stock, nombres reales, certificaciones con número, enlace al perfil de Google Maps, dirección y teléfono visibles. Si no hay una prueba, no se muestra.
- Microcopy concreto y honesto: sin superlativos ("el mejor"), sin urgencia falsa, sin contadores inventados.
- Políticas visibles en el footer: privacidad y, si corresponde, términos. El texto legal lo define el cliente o su asesor.
- Coherencia de tono con la marca en botones, errores y confirmaciones.

## 9. Estados y feedback

- Todo elemento interactivo tiene estados distinguibles: normal, hover, `:focus-visible`, activo/presionado, deshabilitado.
- Respuesta inmediata al toque o clic (cambio visual en < 100 ms); relacionado con INP.
- Páginas de error útiles (404 con enlaces a las secciones principales y el CTA).
- Estados vacíos y de carga solo donde existan datos dinámicos; en un sitio estático, ninguno.

## 10. Movimiento con propósito

- Cada animación debe cumplir una función: guiar la atención, mostrar relación o dar feedback. Si es solo decoración, evaluar su costo en performance.
- Duraciones 200–500 ms para feedback, 400–800 ms para entradas; nada que bloquee la lectura ni el uso.
- Respetar `prefers-reduced-motion`. Nada parpadea más de 3 veces por segundo.
- El contenido nunca depende de que corra una animación para ser legible.

## 11. Banners, popups y terceros

- Banner de cookies/consentimiento (si la normativa del público lo exige): superponerlo con `position: fixed` en el borde inferior para que no empuje el layout (CLS), con botones de igual jerarquía para aceptar y rechazar, y sin bloquear la lectura del sitio.
- Sin popups de entrada ni de salida en una landing de conversión directa: tapan el CTA y dañan la experiencia móvil.
- Chat, pixels y analítica cargados tras la primera interacción (ver `references/stack-performance.md` §8).

## 12. Checklist de revisión

- [ ] En 360×640 se ve titular, qué es el negocio y el CTA sin scrollear.
- [ ] Un solo CTA primario por pantalla; verbo + resultado.
- [ ] Texto de cuerpo ≥ 16 px, línea ≤ ~75 caracteres.
- [ ] Contraste AA medido en todos los pares y estados.
- [ ] Objetivos táctiles ≥ 44 px; sin dependencia de `hover`.
- [ ] Formularios con `label`, `type`, `autocomplete` y errores asociados.
- [ ] Sin scroll horizontal a 320 px ni a 200 % de zoom.
- [ ] Foco visible y navegación completa con teclado.
- [ ] Animaciones con propósito y desactivadas con `prefers-reduced-motion`.
- [ ] Pruebas y datos de confianza reales; cero claims inventados.
- [ ] Ningún banner o widget desplaza el contenido (CLS) ni tapa el CTA.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria recuperada y leída el 2026-10-21 · ◐ confirmada el 2026-10-21 solo en fuentes secundarias o citada por ellas (revalidar en la primaria) · ○ conocimiento general o ruta conocida, **no recuperada** hoy (verificar antes de depender de ello).
Regla de uso: si la regla es ◐ u ○, o si la guía superó su plazo de revalidación, confirmarla en la fuente primaria antes de aplicarla (con búsqueda web, si está disponible) y, si no se puede, decir explícitamente "regla no reverificada hoy".

| Afirmación de esta guía | Estado | Fuente primaria / dónde confirmar |
|---|---|---|
| Tamaño mínimo de objetivo táctil 24×24 px (AA); 44×44 px recomendado | ○ | WCAG 2.2, criterio 2.5.8: https://www.w3.org/TR/WCAG22/ |
| Reflujo a 320 px CSS sin scroll horizontal | ○ | WCAG 2.2, criterio 1.4.10 (misma URL) |
| `autocomplete` para propósito de entrada | ○ | WCAG 2.2, criterio 1.3.5 (misma URL) |
| Campos con menos de 16 px provocan zoom automático en iOS Safari | ○ | Comportamiento conocido; comprobar en un dispositivo real |
| Longitud de línea 45–75 caracteres, regla 60-30-10, escala de espaciado | ○ | Convenciones de diseño, no normas; no citarlas como estándar |
