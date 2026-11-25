#!/usr/bin/env node

/**
 * measure-scroll.mjs — web-performance-design-v2.0
 *
 * Mide la FLUIDEZ del scroll de una página (lo que Lighthouse no mide) con Playwright + Chromium.
 *
 * QUÉ HACE
 *   Abre la URL en un contexto emulado, ralentiza la CPU (perfil mobile: 4×), recorre la página de arriba
 *   abajo con un scroll automático a velocidad constante y registra, por cada requestAnimationFrame, el
 *   intervalo entre frames. Si el navegador lo soporta, registra también Long Animation Frames (LoAF).
 *
 * MÉTRICAS Y TOPES (criterios propios de la skill, no normas oficiales; sobrescribibles)
 *   mobile : p95 del intervalo ≤ 33.4 ms (≈ 30 FPS con CPU 4×) · frames > 50 ms ≤ 2 % · bloqueo LoAF total ≤ 500 ms
 *   desktop: p95 del intervalo ≤ 20 ms   · frames > 50 ms ≤ 1 % · bloqueo LoAF total ≤ 200 ms
 *
 * LIMITACIONES (leer antes de interpretar)
 *   - Chromium headless renderiza por software (sin GPU real): el canvas 2D y el compositor pueden rendir distinto
 *     que en un teléfono. Es una señal relativa para detectar regresiones, no una garantía de 60 FPS en un dispositivo.
 *   - La ralentización de CPU de 4× aproxima un móvil de gama media; no lo sustituye. Confirmar en un dispositivo real.
 *   - LoAF solo existe en Chromium. Safari y Firefox no se miden aquí.
 *   - Mide un recorrido continuo de arriba abajo; no cubre interacciones, saltos por ancla ni scroll inverso.
 *
 * REQUISITOS
 *   npm i -D playwright && npx playwright install chromium     (el script no instala nada)
 *
 * USO
 *   node scripts/measure-scroll.mjs --url http://localhost:4321 [--profile mobile|desktop] [--speed 1200]
 *        [--cpu 4] [--runs 1] [--max-p95 33.4] [--max-jank-pct 2] [--max-blocking-ms 500] [--wait 1500]
 * CÓDIGOS DE SALIDA
 *   0 dentro de los topes · 1 tope excedido · 2 entrada inválida · 3 herramienta ausente (Playwright/Chromium)
 */

const argv = process.argv.slice(2);
const flags = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { flags[argv[i].slice(2)] = argv[i + 1]; i++; }

const PROFILES = {
  mobile: { viewport: { width: 390, height: 844 }, dpr: 2, cpu: 4, p95: 33.4, jankPct: 2, blockingMs: 500, isMobile: true },
  desktop: { viewport: { width: 1280, height: 800 }, dpr: 1, cpu: 1, p95: 20, jankPct: 1, blockingMs: 200, isMobile: false },
};
const profileName = flags.profile ?? 'mobile';
const P = PROFILES[profileName];
if (!P) { console.error(`ERROR: perfil desconocido "${profileName}" (mobile o desktop)`); process.exit(2); }
if (!flags.url || !/^https?:\/\//i.test(flags.url)) {
  console.error('ERROR: indicar --url http://localhost:4321 (el sitio debe estar sirviéndose, por ejemplo con "npx astro preview").');
  process.exit(2);
}

const cfg = {
  url: flags.url,
  speed: Number(flags.speed ?? 1200),
  cpu: Number(flags.cpu ?? P.cpu),
  runs: Math.max(1, Number(flags.runs ?? 1)),
  maxP95: Number(flags['max-p95'] ?? P.p95),
  maxJankPct: Number(flags['max-jank-pct'] ?? P.jankPct),
  maxBlockingMs: Number(flags['max-blocking-ms'] ?? P.blockingMs),
  waitMs: Number(flags.wait ?? 1500),
};

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('HERRAMIENTA AUSENTE: no se pudo cargar "playwright".\nInstalar con: npm i -D playwright && npx playwright install chromium');
  process.exit(3);
}

const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };

async function runOnce(browser) {
  const context = await browser.newContext({
    viewport: P.viewport, deviceScaleFactor: P.dpr, isMobile: P.isMobile, hasTouch: P.isMobile,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  if (cfg.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cfg.cpu });

  await page.goto(cfg.url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(cfg.waitMs); // deja pasar la carga diferida (GSAP, frames) antes de medir

  const data = await page.evaluate(async ({ speed }) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const loaf = [];
    const loafSupported = !!(window.PerformanceObserver && PerformanceObserver.supportedEntryTypes
      && PerformanceObserver.supportedEntryTypes.includes('long-animation-frame'));
    let obs = null;
    const t0 = performance.now();
    if (loafSupported) {
      obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (e.startTime >= t0) loaf.push({ d: e.duration, b: e.blockingDuration });
      });
      obs.observe({ type: 'long-animation-frame', buffered: true });
    }
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const deltas = [];
    await new Promise((resolve) => {
      let last = performance.now();
      let y = 0;
      const guard = setTimeout(resolve, 120000);
      function step(now) {
        deltas.push(now - last); last = now;
        y += (speed * deltas[deltas.length - 1]) / 1000;
        window.scrollTo(0, Math.min(y, maxY));
        if (y >= maxY) { clearTimeout(guard); resolve(); } else requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
    await new Promise((r) => setTimeout(r, 300)); // deja entregar las últimas entradas LoAF
    if (obs) obs.disconnect();
    return { deltas: deltas.slice(1), loaf, loafSupported, maxY, innerHeight: window.innerHeight };
  }, { speed: cfg.speed });

  await context.close();
  return data;
}

let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  console.error(`HERRAMIENTA AUSENTE: Chromium no se pudo iniciar (${String(e.message).split('\n')[0]}).\nEjecutar: npx playwright install chromium`);
  process.exit(3);
}

const runs = [];
try {
  for (let i = 0; i < cfg.runs; i++) runs.push(await runOnce(browser));
} finally {
  await browser.close();
}

console.log(`\nFluidez de scroll — ${cfg.url}`);
console.log(`Perfil: ${profileName} · viewport ${P.viewport.width}×${P.viewport.height} · CPU ${cfg.cpu}× · ${cfg.speed} px/s · ${cfg.runs} corrida(s)`);
let failed = false;
const summaries = [];
runs.forEach((r, idx) => {
  if (r.maxY < r.innerHeight) console.log(`  AVISO corrida ${idx + 1}: la página casi no tiene recorrido de scroll (${Math.round(r.maxY)} px); la medición no es representativa.`);
  const d = r.deltas;
  const p50 = pct(d, 50), p95 = pct(d, 95), p99 = pct(d, 99);
  const jank = d.filter((x) => x > 50).length;
  const jankPct = (jank / d.length) * 100;
  const blocking = r.loaf.reduce((s, e) => s + e.b, 0);
  summaries.push({ p95, jankPct, blocking, supported: r.loafSupported });
  console.log(`\nCorrida ${idx + 1}: ${d.length} frames · recorrido ${Math.round(r.maxY)} px`);
  console.log(`  intervalo p50 ${p50.toFixed(1)} ms · p95 ${p95.toFixed(1)} ms · p99 ${p99.toFixed(1)} ms · máx ${Math.max(...d).toFixed(1)} ms`);
  console.log(`  frames > 50 ms: ${jank} (${jankPct.toFixed(1)} %)`);
  console.log(r.loafSupported
    ? `  Long Animation Frames: ${r.loaf.length} · bloqueo total ${blocking.toFixed(0)} ms`
    : '  Long Animation Frames: no disponible en este navegador (solo se evalúa el intervalo entre frames).');
});

// El resultado usa la PEOR corrida
const worst = {
  p95: Math.max(...summaries.map((s) => s.p95)),
  jankPct: Math.max(...summaries.map((s) => s.jankPct)),
  blocking: Math.max(...summaries.map((s) => s.blocking)),
  supported: summaries.every((s) => s.supported),
};
const verdicts = [
  { name: 'p95 del intervalo entre frames', ok: worst.p95 <= cfg.maxP95, shown: `${worst.p95.toFixed(1)} ms`, limit: `${cfg.maxP95} ms` },
  { name: 'Frames > 50 ms', ok: worst.jankPct <= cfg.maxJankPct, shown: `${worst.jankPct.toFixed(1)} %`, limit: `${cfg.maxJankPct} %` },
];
if (worst.supported) verdicts.push({ name: 'Bloqueo LoAF total', ok: worst.blocking <= cfg.maxBlockingMs, shown: `${worst.blocking.toFixed(0)} ms`, limit: `${cfg.maxBlockingMs} ms` });

console.log('\nVeredicto (peor corrida):');
for (const v of verdicts) { if (!v.ok) failed = true; console.log(`  ${v.ok ? 'OK    ' : 'EXCEDE'} ${v.name.padEnd(34)} ${v.shown.padStart(10)}  (tope ${v.limit})`); }
console.log('\nNota: Chromium headless usa render por software y CPU emulada; es una señal relativa. Confirmar en un dispositivo móvil real.');
console.log(failed ? 'RESULTADO: scroll por encima de los topes. Diagnosticar con el panel Performance y la tabla de stack-performance.md §10.' : 'RESULTADO: dentro de los topes de este perfil.');
process.exit(failed ? 1 : 0);

