# Entrevista de datos reales v2.0 (SEO / AEO / GEO + Catálogo y Scrollytelling)

> **Última verificación:** 2026-11-10 · **Revalidar cada:** 180 días

Usar cuando se necesitan los datos fácticos del proyecto para construir o auditar `src/data/business.ts` y el contenido de descubribilidad. Si se usa dentro de `cinematic-fast-web-v2.0`, estos puntos corresponden a los bloques 3, 9 y 10 de `entrevista-v2.md`.

Regla innegociable: **todos estos datos deben ser reales**. Si falta alguno, dejar `TODO_` visible en `business.ts` y preguntarlo al usuario; nunca inventar teléfonos, direcciones, precios, especificaciones técnicas, años de trayectoria, calificaciones ni garantías.

---

> **A. 📍 Identidad y modo del proyecto**
> - Nombre real del negocio o marca (sin palabras clave añadidas), dominio y país/idioma principal (`es-AR`, `es-ES`, etc.).
> - Modo: **local** (atención en zona física), **general** (marca o servicio online) o **product** (catálogo de productos/modelos, descargas o e-commerce).
> - Correo de contacto, WhatsApp/teléfono real (si aplica) y perfiles oficiales (`sameAs`: Instagram, Google Maps, etc.).
>
> **B. 🏘️ Si es modo `local`**
> - Dirección física o base de operaciones, ciudad principal y 3–6 barrios/zonas realmente cubiertos.
> - Horarios reales de atención y enlace al perfil de Google Business Profile + coordenadas (`lat`, `lng` con ≥ 5 decimales).
>
> **C. 🏎️ Si es modo `product` (catálogo / coleccionismo / e-commerce)**
> - Lista de productos o modelos del catálogo inicial: nombre exacto, año/década, país de origen y datos técnicos verificables (por ejemplo: motor, potencia, diseñador o dimensiones).
> - Modalidades de venta o descarga (por ejemplo, versión "El Lienzo" line-art vs "El Render" póster personalizado): **precio real, moneda (`ARS`, `USD`, etc.) y disponibilidad** de cada una. (Si aún no hay precios definidos, se muestran como consulta y no se emite `Offer` con precio inventado).
> - Alcance de entrega (descarga digital inmediata, envío físico por país/región, plazos reales).
>
> **D. 🎞️ Datos fácticos para los capítulos del Scrollytelling**
> - Los 3 a 5 hitos o datos técnicos reales que acompañarán cada capítulo de la escena animada (para redactar los `<ol class="seq-chapters">` con hechos citables).
>
> **E. ❓ FAQ y pruebas verificables**
> - 5 a 8 preguntas reales que hacen los clientes (precios, formatos, envíos, tiempos, garantías, personalización).
> - Diferencial verificable (resolución de archivo, gramaje de papel, garantía escrita, años de experiencia o certificaciones reales).

---

## Qué hacer con las respuestas

1. Volcarlas en `src/data/business.ts` (`templates/business.example.ts`).
2. Si algún precio, teléfono, dirección o dato técnico no está confirmado, mantener `TODO_` y **no dar por superada la verificación de `check-seo.mjs`** hasta que el cliente lo confirme o decida omitir ese campo opcional.

