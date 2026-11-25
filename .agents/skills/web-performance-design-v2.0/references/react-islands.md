# Islas React e interactividad con estado (Nivel M3)

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 90 días · Fuentes y estado al final de este documento.

Guía para el nivel **M3**. React entra cuando una pieza de interfaz tiene **estado complejo de cliente** (configurador de vehículo/producto en vivo, explorador con filtros combinados e instantáneos, comparador, carrito, calculadora), nunca para maquetar secciones estáticas ni para hacer animaciones simples de scroll.

## Contenido

1. Qué va en Astro estático y qué va en una isla React
2. Directivas de hidratación permitidas
3. Presupuesto y aislamiento del bundle de React
4. SEO/AEO dentro y alrededor de una isla
5. Comunicación entre islas sin inflar el bundle
6. Alternativa Next.js (SSG + Server Components)
7. Checklist M3

## 1. Qué va en Astro estático y qué va en una isla React

| Elemento | Dónde se construye | Por qué |
|---|---|---|
| Navbar, Hero (con H1, frase AEO y secuencia M1), manifiesto, cómo funciona, cobertura, FAQ, footer | **Componentes `.astro` (0 JS de hidratación)** | Contenido 100 % estático e indexable; evita cargar React en el camino crítico |
| Catálogo inicial de modelos / productos y páginas de detalle | **`.astro` pre-renderizado en build** desde `src/data/business.ts` (o colección) + filtro ligero o isla diferida solo para los controles interactivos | Los bots de búsqueda e IA ven todas las fichas y enlaces `<a href>` en el HTML inicial |
| Configurador interactivo ("El Lienzo" / "El Render": cambio de pintura, llantas, fondos, vista Showroom, descarga/compra) | **Isla React (`.tsx`) con `client:visible`** | Estado rico de múltiples capas y previsualización en vivo |

Regla: **hacer la isla lo más pequeña posible**. Si una sección tiene un encabezado editorial, una explicación y un configurador, el encabezado y la explicación van en `.astro` y solo el panel interactivo es la isla React.

## 2. Directivas de hidratación permitidas

| Directiva | Uso en esta skill |
|---|---|
| `client:visible` (con `rootMargin` si conviene precargar antes de llegar) | **Por defecto** para toda isla M3 ubicada debajo del primer pliegue (configurador en la home, filtros interactivos) |
| `client:idle` | Islas secundarias que no están en el flujo principal pero conviene tener listas tras `load` |
| `client:media="(min-width: 768px)"` | Componentes pesados exclusivos de desktop |
| `client:load` | **Excepción justificada en el blueprint**: solo en una página dedicada cuya función principal arriba del pliegue sea la aplicación (por ejemplo `/configurador/`), cuidando que el H1 y el LCP sigan siendo HTML estático fuera o en el SSR de la isla |
| `client:only` | **Prohibido** en cualquier bloque que contenga texto, enlaces o datos que deban indexarse, porque emite HTML vacío en el build |

## 3. Presupuesto y aislamiento del bundle de React

- React + ReactDOM aportan ~40–45 KB gzip al presupuesto **diferido** (tope total: ≤ 120 KB gzip en `check-budget.mjs`).
- Con `client:visible` o `client:idle`, el runtime de React no bloquea el LCP ni suma al tope de JS crítico (≤ 15 KB gzip).
- **Cuidado con las librerías dentro de la isla:** no importar paquetes de íconos completos, librerías de UI pesadas ni gestores de estado grandes. Usar estado nativo (`useState`, `useReducer`) y SVG inline.
- Reservar siempre las dimensiones del contenedor de la isla (`min-height` o `aspect-ratio`) tanto en el SSR de la isla como en su contenedor `.astro` para que la hidratación tenga **CLS = 0**.

## 4. SEO/AEO dentro y alrededor de una isla

1. **Pre-renderizado (SSR en build):** en Astro, una isla con `client:visible` o `client:idle` igual ejecuta su primer render en el servidor durante `npm run build` y emite su HTML inicial con el estado por defecto.
2. **Enlaces reales:** cualquier enlace a una ficha de producto o modelo dentro de una isla debe ser un `<a href="/modelos/...">` real en el render inicial, no un `<div onClick>` que navegue por JS.
3. **Imágenes de capas del configurador:** la imagen por defecto se renderiza como `<img>` con `width`, `height`, `alt` descriptivo y `loading="lazy"` (o `eager` si es una página dedicada de configurador). Las variantes de color/escenario se precargan bajo demanda al interactuar o cuando la isla entra en viewport, nunca todas de golpe al abrir la página.

## 5. Comunicación entre islas sin inflar el bundle

Si dos controles separados necesitan compartir un dato simple (por ejemplo, un botón en una tarjeta del catálogo que abre el configurador con ese modelo preseleccionado):

- Usar eventos nativos del navegador (`window.dispatchEvent(new CustomEvent('select-model', { detail }))`), parámetros en el hash/query de la URL, o un store mínimo sin dependencias (< 1 KB). No instalar Redux ni librerías pesadas para eso.

## 6. Alternativa Next.js (SSG + Server Components)

Cuando la matriz (`cinematic-fast-web-v2.0/references/matriz-stack.md`) elija Next.js porque la mayor parte del sitio es aplicación:

- Mantener `output: 'export'` (SSG) o páginas pre-renderizadas estáticamente para todas las rutas públicas indexables.
- Todos los componentes son **Server Components por defecto**; añadir `'use client'` únicamente en las hojas interactivas (equivalentes a las islas M3).
- El presupuesto de `check-budget.mjs` y las reglas de LCP, fuentes e imágenes se aplican igual.

## 7. Checklist M3

- [ ] La isla tiene estado interactivo real que justifica M3; el marco editorial que la rodea está en `.astro`.
- [ ] Hidratada con `client:visible` o `client:idle` (sin `client:only`; `client:load` solo en ruta dedicada y justificado).
- [ ] El HTML generado en `dist/` contiene el estado inicial renderizado y enlaces `<a href>` reales.
- [ ] Contenedor con altura/aspecto reservado (CLS = 0 al hidratar).
- [ ] Las variantes de imagen del configurador se cargan bajo demanda, no en la carga inicial de la página.
- [ ] `check-budget.mjs` confirma JS crítico ≤ 15 KB gzip y JS diferido total ≤ 120 KB gzip.

## Fuentes y estado de verificación

**Leyenda:** ✔ fuente primaria leída · ◐ solo secundarias · ○ conocimiento general, no recuperada hoy.

| Afirmación | Estado | Dónde confirmar |
|---|---|---|
| Directivas `client:visible`, `client:idle`, `client:media`, `client:load`, `client:only` y pre-renderizado SSR en build de las islas de Astro | ○ | https://docs.astro.build/en/reference/directives-reference/#client-directives |
| Límites de presupuesto (15 KB crítico, 120 KB diferido) | ○ | Criterios propios de la skill (`references/stack-performance.md` §3) |

