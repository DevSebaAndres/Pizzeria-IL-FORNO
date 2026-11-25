# Entrevista de datos reales (SEO / AEO / GEO)

Usar cuando se necesitan los datos del negocio para construir o auditar la parte de descubribilidad. Si esta skill se usa sola, presentarlos en un único mensaje, en el idioma del usuario. Si se usa dentro de `cinematic-fast-web`, se añaden al final de su entrevista como bloques 9 y 10.

Regla: **estos datos deben ser reales**. Si falta alguno, dejar `TODO_` visible y pedirlo; nunca inventar teléfonos, direcciones, años de trayectoria, calificaciones, garantías ni tiempos de respuesta.

---

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

- Volcarlas en `src/data/business.ts` (template `business.example.ts`): de ahí salen el HTML visible, el footer, el enlace de WhatsApp, el JSON-LD y la FAQ.
- Modo **local** si hay dirección o zona de servicio física; modo **general** si es una marca o servicio online.
- Si hay Google Business Profile, el NAP del sitio debe ser idéntico carácter por carácter.
- Los pixels/analytics/chat declarados se pasan a `web-performance-design` para cargarlos fuera del camino crítico.
