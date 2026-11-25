# Entrevista de personalización (Fase 1)

Presentar TODO en un único mensaje, en el idioma del usuario. No escribir código hasta tener las respuestas. Omitir lo que el usuario ya haya contestado.

---

> 🎬 **Vamos a construir tu web: cinematográfica, rapidísima y lista para Google y para buscadores con IA.**
> Responde lo que puedas; lo que no sepas, lo decido yo con criterio de marca. Los datos de los bloques 9 y 10 los necesito **reales** (no los invento).
>
> **1. 🏢 Tu negocio**
> - Nombre y una frase de qué hace o vende.
> - ¿Es un negocio con zona física de atención (local) o una marca/servicio online (general)?
>
> **2. 🎨 Universo visual**
> - 2 conceptos que definan tu marca (ej.: "Minimalismo japonés" / "Ritual industrial").
> - ¿Entre qué dos mundos está tu marca? (ej.: "entre un laboratorio y una galería de moda").
>
> **3. 🎨️ Paleta**
> Principal, Acento, Fondo y Texto (nombre + hex). Si no tienes, describe la sensación ("oscuro y dorado", "tierra y crema") y la creo yo.
>
> **4. 🖼️ Hero (portada)**
> - Titular en dos partes: Sans sobria + Serif itálica (ej.: "El arte de lo" / "permanente.").
> - Tagline corto tipo código (ej.: "// Diseño único. Piel como lienzo.").
> - Texto del botón principal (ej.: "Reserva tu sesión").
> - Qué ambiente debe mostrar la imagen. Si tienes fotos propias, mejor: pásamelas.
>
> **5. 📊 Dashboard interactivo (3 tarjetas)**
> - Nombre temático del bloque.
> - Tarjeta 1 (clasificador): 3 elementos/servicios que rotan.
> - Tarjeta 2 (feed): 3 mensajes de proceso que se "escriben solos" y el estado en vivo (ej.: "Sala abierta").
> - Tarjeta 3 (protocolo semanal): texto del botón final.
>
> **6. 📜 Manifiesto**
> - Frase del "sector convencional" vs. tu contrapropuesta.
> - 3 valores separados por ` · `.
>
> **7. 🗂️ Servicios/productos estrella (3)**
> Para cada uno: nombre, descripción de 1–2 frases y qué sensación visual evoca (para diseñar su SVG animado único).
>
> **8. 💎 Planes + footer**
> - ¿Planes de precio/membresía? (3 niveles: nombre y beneficio). Si no hay, usaré un módulo de lista VIP.
> - 4 enlaces útiles para el footer, estado operativo ("Estudio activo") y dirección/email/redes.
>
> **9. 📍 Datos reales para SEO / AEO** *(imprescindibles)*
> - Dominio (existente o deseado) y país/idioma principal.
> - **Modo local:** dirección o base de operaciones, teléfono/WhatsApp con código de país, ciudad principal y 3–6 barrios/zonas atendidas, horarios, enlace al perfil de Google Business Profile.
> - Servicio principal (lo que la gente busca en Google) y 3–5 sub-servicios.
> - El principal dolor del cliente y tu diferencial **verificable** (garantía, tiempo de respuesta, certificaciones).
> - 5 preguntas que tus clientes te hacen siempre (para la FAQ).
>
> **10. ✅ Pruebas y activos reales**
> - Años de trayectoria, calificación real en Google (si quieres mostrarla), logos de clientes, certificaciones.
> - Logo, fotos propias, videos. ¿Usas Meta Pixel, GA4, GTM o un chat? (los cargaré sin dañar la velocidad).

---

## Qué hacer con las respuestas

- Mapear cada respuesta a una variable en `src/data/business.ts` y a los tokens de `global.css`.
- Si falta un dato factual: `TODO_` visible en el blueprint; no publicar con TODOs.
- Si la paleta no está definida: elegir 4 hex coherentes y comprobar contraste AA (≥ 4.5:1 en texto normal).
- Imágenes: preferir las del usuario. Si se usa Unsplash, verificar que cada URL responde 200, descargar en build y registrar autor/URL en `CREDITS.md`.
