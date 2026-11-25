// src/scripts/frame-sequence.js — motor M1 de secuencia de frames atada al scroll.
// Plantilla propia, probada solo con un smoke test en Node (sin navegador): validar visualmente en cada proyecto.
//
// Contrato de marcado (ver templates/FrameSequence.astro):
//   <section data-frame-seq data-base="/frames/v1/d-" data-count="120" data-ext="avif"
//            data-base-mobile="/frames/v1/m-" data-count-mobile="72"      (opcionales)
//            data-pad="4" data-stride="4" data-window="8">
//     <div class="seq-pin"><img data-first-frame …><canvas aria-hidden="true"></canvas></div>
//     … capítulos …
//   </section>
// Nombres de frame: `${base}${NNNN}.${ext}` con numeración desde 0001.
//
// Reglas que respeta (ver references/frame-sequence.md):
//   - No hace nada sin la clase html.js-motion (sin JS o con prefers-reduced-motion).
//   - Listener de scroll `passive`, activo solo mientras la escena es visible.
//   - Un solo requestAnimationFrame por cambio de scroll; la geometría se lee fuera del bucle.
//   - Mantiene objetos Image (no createImageBitmap) y pide decode() solo de una ventana de frames.
//   - Concurrencia de carga limitada; prioriza por cercanía al frame actual.
//   - Devuelve destroy() para limpiar.

const MAX_CONCURRENT = 6;
const MAX_DPR = 1.5;

export function initFrameSequence(root) {
  const canvas = root.querySelector('canvas');
  if (!canvas) return () => {};
  if (!document.documentElement.classList.contains('js-motion')) return () => {};

  const ctx = canvas.getContext('2d', { alpha: false });
  const mobileMq = window.matchMedia('(max-width: 767px)');
  let session = null;

  function readConfig() {
    const d = root.dataset;
    const mobile = mobileMq.matches && d.baseMobile;
    return {
      base: mobile ? d.baseMobile : d.base,
      count: Number(mobile ? d.countMobile : d.count),
      ext: d.ext || 'avif',
      pad: Number(d.pad || 4),
      stride: Math.max(1, Number(d.stride || 4)),
      win: Math.max(1, Number(d.window || 8)),
    };
  }

  function start() {
    const cfg = readConfig();
    if (!cfg.base || !cfg.count) return null;

    const imgs = new Array(cfg.count);
    const loaded = new Array(cfg.count).fill(false);
    const strideSet = new Set();
    for (let i = 0; i < cfg.count; i++) if (i % cfg.stride === 0 || i === cfg.count - 1) strideSet.add(i);
    let inflight = 0;
    let queue = [];
    let started = false;
    let current = -1;
    let lastY = window.scrollY;
    let top = 0;
    let range = 1;
    let scheduled = false;
    let active = false;
    let destroyed = false;

    const url = (i) => `${cfg.base}${String(i + 1).padStart(cfg.pad, '0')}.${cfg.ext}`;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    function pump() {
      while (!destroyed && started && inflight < MAX_CONCURRENT && queue.length) {
        const i = queue.shift();
        if (imgs[i]) continue;
        const im = new Image();
        im.decoding = 'async';
        imgs[i] = im;
        inflight++;
        const done = (ok) => {
          inflight--;
          loaded[i] = ok;
          if (ok && i === current) draw(current);
          pump();
        };
        im.onload = () => done(true);
        im.onerror = () => done(false);
        im.src = url(i);
      }
    }

    function enqueueAll() {
      if (destroyed || started) return;
      started = true;
      const first = [];
      const rest = [];
      for (let i = 0; i < cfg.count; i++) (strideSet.has(i) ? first : rest).push(i);
      queue = [...first, ...rest];
      if (current >= 0) prioritize(current);
      pump();
    }

    function prioritize(center) {
      if (!started) return;
      const stridePending = queue.filter((i) => strideSet.has(i) && !imgs[i]);
      const near = [];
      for (let d = 0; d <= cfg.win; d++) {
        for (const i of [center - d, center + d]) {
          if (i >= 0 && i < cfg.count && !imgs[i] && !strideSet.has(i) && !near.includes(i)) near.push(i);
        }
      }
      const others = queue.filter((i) => !strideSet.has(i) && !near.includes(i) && !imgs[i]);
      queue = [...stridePending, ...near, ...others];
      pump();
      for (let d = -cfg.win; d <= cfg.win; d++) {
        const im = imgs[center + d];
        if (im && loaded[center + d] && im.decode) im.decode().catch(() => {});
      }
    }

    function nearestLoaded(i) {
      for (let d = 0; d < cfg.count; d++) {
        if (i - d >= 0 && loaded[i - d]) return i - d;
        if (i + d < cfg.count && loaded[i + d]) return i + d;
      }
      return -1;
    }

    function draw(i) {
      const k = nearestLoaded(i);
      if (k < 0) return;
      const im = imgs[k];
      const cw = canvas.width, ch = canvas.height;
      const iw = im.naturalWidth || cw, ih = im.naturalHeight || ch;
      const scale = Math.max(cw / iw, ch / ih); // cover
      const w = iw * scale, h = ih * scale;
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
      root.classList.add('is-ready');
    }

    function measure() { // lectura de layout: solo al activar y en resize, nunca en el bucle de scroll
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      top = root.getBoundingClientRect().top + window.scrollY;
      range = Math.max(1, root.offsetHeight - window.innerHeight);
      if (current >= 0) draw(current);
    }

    function frame() {
      scheduled = false;
      const progress = clamp((lastY - top) / range, 0, 1);
      const idx = Math.round(progress * (cfg.count - 1));
      if (idx === current) return;
      current = idx;
      prioritize(idx);
      draw(idx);
    }

    function onScroll() {
      lastY = window.scrollY; // solo se guarda; el trabajo ocurre en rAF
      if (!scheduled) { scheduled = true; requestAnimationFrame(frame); }
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !active) {
        active = true;
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        lastY = window.scrollY;
        scheduled = true;
        requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && active) {
        active = false;
        window.removeEventListener('scroll', onScroll);
      }
    }, { rootMargin: '200px 0px' });
    io.observe(root);

    const ro = new ResizeObserver(() => { if (active) measure(); });
    ro.observe(root);

    const begin = () => (window.requestIdleCallback ? window.requestIdleCallback(enqueueAll) : setTimeout(enqueueAll, 200));
    // Los frames empiezan a pedirse tras el LCP (evento load), nunca antes.
    if (document.readyState === 'complete') begin(); else window.addEventListener('load', begin, { once: true });

    return function destroy() {
      destroyed = true;
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      ro.disconnect();
    };
  }

  session = start();
  const onBreakpoint = () => { if (session) session(); session = start(); };
  mobileMq.addEventListener('change', onBreakpoint);

  return function destroy() {
    mobileMq.removeEventListener('change', onBreakpoint);
    if (session) session();
  };
}

