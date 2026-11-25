#!/usr/bin/env node

/**
 * Calculadora de contraste WCAG 2.1 (AA / AAA)
 * Uso: node scripts/contrast.mjs "#texto/#fondo" "#texto2/#acento" ...
 */

function parseHex(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) {
    throw new Error(`Color hexadecimal no válido: ${hex}`);
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function sRGBtoLin(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getLuminance(rgb) {
  const r = sRGBtoLin(rgb.r);
  const g = sRGBtoLin(rgb.g);
  const b = sRGBtoLin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(hex1, hex2) {
  const l1 = getLuminance(parseHex(hex1));
  const l2 = getLuminance(parseHex(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Uso: node scripts/contrast.mjs "#texto/#fondo" ["#texto2/#acento" ...]');
  process.exit(1);
}

console.log('\n🎨 Auditoría de Contraste WCAG 2.1 (Nivel AA: 4.5:1 normal, 3.0:1 grande/UI)\n');

let allPassed = true;

for (const pair of args) {
  const [fg, bg] = pair.split(/[/:]/);
  if (!fg || !bg) {
    console.error(`Formato inválido: "${pair}". Use "#texto/#fondo" o "#texto:#fondo"`);
    allPassed = false;
    continue;
  }

  try {
    const ratio = getContrast(fg, bg);
    const passAA = ratio >= 4.5;
    const passAALarge = ratio >= 3.0;
    const status = passAA ? '✅ AA (Normal y Grande)' : passAALarge ? '⚠️  AA Solo Texto Grande/UI' : '❌ Falla AA';
    
    if (!passAALarge) allPassed = false;
    
    console.log(`Par: ${fg} sobre ${bg} -> Ratio: ${ratio.toFixed(2)}:1 | ${status}`);
  } catch (err) {
    console.error(`Error procesando par ${pair}:`, err.message);
    allPassed = false;
  }
}

console.log('');
if (!allPassed) {
  console.log('⚠️  Al menos un par no alcanza el nivel mínimo AA.');
  process.exit(1);
} else {
  console.log('✨ Todos los pares evaluados cumplen con las pautas de accesibilidad.');
  process.exit(0);
}

