#!/usr/bin/env node
// scripts/contrast.mjs — ratio de contraste WCAG 2.x entre pares de colores hex.
// Uso: node scripts/contrast.mjs "#1a1a2e/#ffffff" "#0d6efd/#ffffff" ...   (texto/fondo)
// Umbrales AA: texto normal 4.5:1 · texto grande (≥18px, o ≥14px bold) 3:1 · UI/iconos funcionales 3:1.
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const rgb = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Hex inválido: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = (hex) => { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

if (process.argv[1].endsWith('contrast.mjs')) {
  const pairs = process.argv.slice(2);
  if (!pairs.length) { console.error('Uso: node scripts/contrast.mjs "#texto/#fondo" …'); process.exit(2); }
  let fail = 0;
  for (const p of pairs) {
    const [fg, bg] = p.split('/');
    const r = ratio(fg, bg);
    const normal = r >= 4.5, large = r >= 3;
    if (!normal) fail++;
    console.log(`${fg} sobre ${bg}: ${r.toFixed(2)}:1  texto normal ${normal ? '✔' : '✖'} · texto grande/UI ${large ? '✔' : '✖'}`);
  }
  process.exit(fail ? 1 : 0);
}
