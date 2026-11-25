# Matriz de stack y de nivel de movimiento

**Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Esta guía decide **qué stack usar** y **hasta qué nivel de movimiento subir**. Los presupuestos y patrones de cada nivel están en `web-performance-design-v2.0`.

## 1. Elección de stack

Pregunta guía: ¿qué parte del sitio necesita estado en el cliente?

| Situación | Stack recomendado | Por qué |
|---|---|---|
| Sitio de marca, landing o catálogo con scrollytelling; la interactividad compleja es una o pocas piezas | **Astro (SSG) + islas React** + Tailwind v4 | HTML estático por defecto, JS solo donde se hidrata, mejor base para SEO/AEO/GEO |
| La mayor parte del sitio es una aplicación (login, carrito, muchas rutas con estado compartido, panel) | **Next.js (SSG/ISR; Server Components)** | Estado compartido y enrutado de aplicación sin reinventarlo |
| Sitio de marca + una app (por ejemplo, configurador) | **Astro para las páginas públicas + isla React o ruta aparte** para la app | Lo indexable queda estático; la app no condiciona el resto |
| Sin interactividad más allá de animación | Astro sin React, niveles M0–M2 | No pagar React si nada lo necesita |

Reglas:
- React solo entra si hay una pieza con estado real. **Animar no justifica React**: la animación vive en M0–M2.
- **Prohibido renderizar el contenido crítico solo en el cliente** (SPA pura). Con React, el HTML del servidor ya trae el texto.
- Verificar versiones al hacer el scaffold (`npm create astro@latest`, `npm view <paquete> version`); no fijarlas de memoria.
- Tailwind v4 con el plugin `@tailwindcss/vite`. No usar el script CDN de Tailwind en producción.

## 2. Elección de nivel de movimiento

Se decide **por escena**, no por proyecto.

| Efecto pedido | Nivel mínimo | Notas |
|---|---|---|
| Revelado al entrar, parallax suave, sticky stack, hover | **M0** | `animation-timeline: view()` como mejora progresiva con `@supports` |
| Marcar estados al hacer scroll, contador, barra de progreso | **M0 / M1** | M0 si `animation-timeline: scroll()` basta |
| Secuencia de frames atada al scroll (hero scrollytelling) | **M1** | `requestAnimationFrame` + canvas, sin librería; detalle en `frame-sequence.md` |
| Video atado al scroll | **M1** | Requiere video codificado con keyframes frecuentes; detalle en `frame-sequence.md` |
| Timeline encadenado, pin con varias fases, scrub con easing, SplitText | **M2** | GSAP con `import()` tras el LCP |
| Configurador, filtros con estado, carrito | **M3** | Isla React con `client:visible` o `client:idle` |

Escalado: se sube de nivel solo si el inferior no logra el efecto. Anotar en el blueprint: escena, nivel, motivo, costo medido o estimado, y versión sin movimiento.

## 3. Reglas de combinación

- Un proyecto puede mezclar niveles, pero **cada nivel superior se carga una sola vez y de forma diferida** (un único chunk de GSAP compartido por todas las escenas M2).
- Si una escena M2 puede lograrse en M1 con menos de 3 KB, se hace en M1.
- La hidratación React (M3) nunca se declara `client:load` salvo que la pieza esté en el primer pliegue y sea imprescindible; el caso normal es `client:visible`.
- Dos sistemas de animación sobre el mismo elemento (CSS y GSAP) están prohibidos: se elige uno por elemento.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria recuperada y leída · ◐ solo en fuentes secundarias o citada por ellas (revalidar en la primaria) · ○ conocimiento general, no recuperada hoy (verificar antes de depender de ello).

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| Astro emite HTML estático con JS opt-in por islas (`client:*`) | ○ | https://docs.astro.build/en/concepts/islands/ |
| Tailwind v4 con `@tailwindcss/vite` | ◐ | https://tailwindcss.com/docs/installation/framework-guides (verificar método vigente al hacer el scaffold) |
| `<canvas>` no es candidato a LCP | ◐ (resumen de búsqueda sobre web.dev, 2026-11-10) | https://web.dev/articles/lcp |
| GSAP y sus plugins son gratuitos, incluso uso comercial | ◐ (2026-11-10, fuentes secundarias) | https://gsap.com/pricing/ |
| Next.js recomendado para apps con estado compartido | ○ | https://nextjs.org/docs |
| Los umbrales de nivel (por ejemplo, "M1 < 3 KB") son criterios propios de la skill | ○ | No son normas oficiales: ajustar con medición del proyecto |

