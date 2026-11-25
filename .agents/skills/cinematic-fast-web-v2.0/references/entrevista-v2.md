# Entrevista de personalización v2 (Fase 1)

Presentar TODO en un único mensaje, en el idioma del usuario. No escribir código hasta tener las respuestas. Omitir lo que el usuario ya haya contestado o lo que ya defina un diseño aprobado (Stitch, Figma, `DESIGN.md`).

---

> 🎬 **Vamos a construir tu web: cinematográfica, con scrollytelling, rápida y lista para Google y para buscadores con IA.**
> Responde lo que puedas; lo que no sepas, lo decido yo con criterio de marca. Los datos de los bloques 9 y 10 los necesito **reales** (no los invento).
>
> **1. 🏢 Tu negocio o producto**
> - Nombre y una frase de qué hace o vende.
> - ¿Es un negocio con zona física (local), una marca/servicio online (general) o un catálogo de productos (producto)?
>
> **2. 🎨 Universo visual** *(omitir si hay diseño aprobado)*
> - 2 conceptos que definan tu marca y entre qué dos mundos está.
> - Paleta: Principal, Acento, Fondo y Texto (nombre + hex), o la sensación deseada ("oscuro y dorado").
> - Tipografías: si ya tienes (máximo 2 familias), indícalas.
>
> **3. 🎞️ Narrativa del scrollytelling**
> - ¿Cuántos capítulos o escenas tiene la historia (3–6 recomendado)?
> - Para cada capítulo: qué ocurre en pantalla, el texto que lo acompaña y la emoción que debe dejar.
> - Cierre: qué acción debe hacer el visitante al terminar el recorrido (botón, formulario, WhatsApp, compra).
>
> **4. 🖼️ Medios de cada escena**
> - Material fuente: video, secuencia de frames ya extraída, fotos, renders. Resolución, duración y quién tiene los derechos.
> - ¿Qué imagen debe ver el visitante en el primer instante (será el elemento LCP)?
> - ¿Aceptas que en móvil la secuencia sea más corta o más liviana, o que en `reduced-motion` se muestren imágenes clave estáticas?
>
> **5. ⚙️ Intensidad de movimiento y dispositivos**
> - Intensidad: sutil, media o inmersiva (cuánto del sitio se mueve con el scroll).
> - ¿Qué porcentaje esperas de visitas móviles? ¿Hay algún dispositivo o navegador mínimo a respetar?
> - ¿Algún efecto de referencia (sitio que admires)? Lo traduzco a un nivel de movimiento con su costo.
>
> **6. 🧩 Interactividad**
> - ¿Hay configurador, filtros, buscador, carrito, calculadora, formulario multipaso? Descríbelos: son las piezas que se hidratan con React.
>
> **7. 🅰️ Hero (portada)**
> - Titular (puede ir en dos partes: Sans sobria + acento) que incluya servicio o producto y lugar si aplica.
> - Tagline corto, texto del botón principal.
>
> **8. 🗂️ Secciones, servicios/productos y cierre**
> - Servicios o productos estrella (nombre, descripción de 1–2 frases, sensación visual).
> - ¿Planes de precio o membresía? ¿Qué enlaces van en el footer?
>
> **9. 📍 Datos reales para SEO / AEO** *(imprescindibles)*
> - Dominio (existente o deseado) y país/idioma principal.
> - **Modo local:** dirección o base, teléfono/WhatsApp con código de país, ciudad y 3–6 zonas, horarios, enlace a Google Business Profile.
> - **Modo producto:** por producto, nombre, descripción, precio y moneda, disponibilidad, imágenes y SKU si existe.
> - Servicio o producto principal (lo que la gente busca en Google) y 3–5 variantes.
> - El principal dolor del cliente y tu diferencial **verificable** (garantía, tiempo de respuesta, certificaciones).
> - 5 preguntas que tus clientes te hacen siempre (para la FAQ).
>
> **10. ✅ Pruebas y activos reales**
> - Años de trayectoria, calificación real (si quieres mostrarla), clientes, certificaciones.
> - Logo, fotos y videos propios. ¿Usas Meta Pixel, GA4, GTM, chat o pasarela de pago? (los cargaré sin dañar la velocidad).

---

## Qué hacer con las respuestas

- Mapear cada respuesta a una variable en `src/data/business.ts` y a los tokens de `global.css`.
- Bloques 3–6 → **mapa de movimiento** del blueprint: cada capítulo con su nivel M0–M3 y su plan de medios.
- Si falta un dato factual: `TODO_` visible en el blueprint; no publicar con TODOs.
- Si la paleta no está definida: elegir 4 hex coherentes y comprobar contraste AA con `contrast.mjs`.
- Imágenes y video: preferir los del usuario. Si se usa una fuente externa, verificar licencia, descargar en build y registrar autor y URL en `CREDITS.md`.
- Si el material fuente es un video o una secuencia larga, no avanzar al blueprint sin calcular su peso con `check-frames.mjs`.

