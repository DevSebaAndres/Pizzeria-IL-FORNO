---
trigger: model_decision
description: Master Prompt v1.0 para proyectos web y landings estáticas ultrarrápidas ("cero JS" propio) con Astro + Tailwind v4 + CSS moderno.
---

# Master Prompt v1.0 — Sitios Estáticos Ultrarrápidos ("Cero JS")

Para cualquier tarea de un proyecto bajo la **batería v1.0** (sitios estáticos ultrarrápidos sin scrollytelling de secuencia de frames, sin GSAP y sin islas React):

- Activa **`cinematic-fast-web`** para construir sitios completos. Usa **`web-discoverability`** para SEO/AEO/GEO y **`web-performance-design`** para stack, visual, UX/UI y performance (presupuesto `JS propio ≤ 15 KB gzip total`, cero JS por defecto).
- Antes de aplicar reglas de Google, schema, rastreadores de IA o Lighthouse, ejecuta `check-freshness.mjs`; si una guía está vencida, revalida en la fuente primaria o avisa `"regla no reverificada hoy"`.
- Nunca inventes datos del negocio: usa `TODO_` y pregúntame.
- No avances de fase sin mi aprobación explícita.
- No afirmes scores ni cumplimiento sin ejecutar los scripts y mostrar su salida.
- El HTML exportado desde Stitch es referencia visual, no código de producción.

---

## Comprobar que las skills v1.0 se detectan

Prompt de prueba:

```text
Lista las skills de la batería v1.0 disponibles en este proyecto (cinematic-fast-web, web-performance-design, web-discoverability) y para cada una dime su nombre, cuándo se activa y qué scripts incluye. No ejecutes nada todavía.
```

**Esperado:** las tres skills v1.0 aparecen. Si no, revisar la carpeta y el `name`/`description` del `SKILL.md`.

## Chequeo de vigencia (v1.0)

```text
Ejecuta node .agents/skills/web-discoverability/scripts/check-freshness.mjs y node .agents/skills/web-performance-design/scripts/check-freshness.mjs y muéstrame la salida completa. Si alguna guía está vencida, dime qué reglas dependen de ella antes de continuar.
```

## Auditoría integral antes de cerrar (v1.0)

```bash
node .agents/skills/cinematic-fast-web/scripts/verify-all.mjs \
  --dist ./dist \
  --pairs "#111111:#FFFFFF"
```

**Criterio de salida:** las 3 skills v1.0 detectadas, MCP de Stitch conectado (o plan manual definido) y guías vigentes.
