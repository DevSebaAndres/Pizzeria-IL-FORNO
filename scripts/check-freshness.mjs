#!/usr/bin/env node
// scripts/check-freshness.mjs — avisa qué guías de la skill superaron su plazo de revalidación.
// Uso: node scripts/check-freshness.mjs [carpeta-de-la-skill=.]   (busca references/*.md)
// Cada guía debe tener una línea:  > **Última verificación:** AAAA-MM-DD · **Revalidar cada:** N días
// Sale con código 1 si hay guías vencidas o sin marcador.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';
const dir = join(root, 'references');
if (!existsSync(dir)) { console.error(`No existe ${dir}`); process.exit(2); }
const today = process.env.FRESHNESS_TODAY ? new Date(process.env.FRESHNESS_TODAY) : new Date();
let bad = 0;
for (const f of readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
  const t = readFileSync(join(dir, f), 'utf8');
  const date = t.match(/Última verificación:\**\s*(\d{4}-\d{2}-\d{2})/)?.[1];
  const every = +(t.match(/Revalidar cada:\**\s*(\d+)\s*d/)?.[1] ?? 0);
  if (!date || !every) { console.log(`– ${f}: sin marcador de verificación (guía de procedimiento o falta el marcador)`); continue; }
  const age = Math.floor((today - new Date(date)) / 86400000);
  const left = every - age;
  if (left < 0) { bad++; console.log(`✖ ${f}: verificada ${date} (hace ${age} d); VENCIDA por ${-left} d (plazo ${every} d). Revalidar contra fuentes primarias.`); }
  else console.log(`✔ ${f}: verificada ${date} (hace ${age} d); vigente ${left} d más (plazo ${every} d).`);
}
process.exit(bad ? 1 : 0);
