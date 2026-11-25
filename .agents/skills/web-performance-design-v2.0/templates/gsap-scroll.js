// src/scripts/gsap-scroll.js — cargador único M2 para GSAP + ScrollTrigger.
// Plantilla propia, probada con smoke test en Node: validar visualmente en cada proyecto.
//
// Reglas que cumple (ver references/gsap-patterns.md):
//   - No hace nada si falta `html.js-motion` o si `prefers-reduced-motion: reduce` está activo.
//   - Importa `gsap` y `gsap/ScrollTrigger` de forma DINÁMICA (`import()`), generando un único chunk diferido
//     fuera del presupuesto de JS crítico (≤ 15 KB gzip).
//   - Configura `ScrollTrigger.config({ ignoreMobileResize: true })` una sola vez.
//   - Envuelve las escenas en `gsap.matchMedia()` para limpiar automáticamente al cambiar de breakpoint
//     o al activarse `prefers-reduced-motion: reduce`.

let gsapPromise = null;

export function loadGsap() {
  if (!gsapPromise) {
    gsapPromise = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, stMod]) => {
      const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default || stMod;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap, ScrollTrigger };
    });
  }
  return gsapPromise;
}

/**
 * Registra una escena M2 cuando se acerca al viewport (o en idle tras load).
 * @param {HTMLElement} root Contenedor de la escena
 * @param {(ctx: { gsap: any, ScrollTrigger: any, isDesktop: boolean, isMobile: boolean, root: HTMLElement }) => void} setup
 * @returns {() => void} Función destroy()
 */
export function initGsapScene(root, setup) {
  if (!root || typeof setup !== 'function') return () => {};
  if (!document.documentElement.classList.contains('js-motion')) return () => {};

  let mm = null;
  let cancelled = false;

  async function mount() {
    const { gsap, ScrollTrigger } = await loadGsap();
    if (cancelled) return;
    mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        isMobile: '(max-width: 767px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, isMobile, reduceMotion } = context.conditions;
        if (reduceMotion) return;
        setup({ gsap, ScrollTrigger, isDesktop, isMobile, root });
      },
      root
    );
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        io.disconnect();
        mount();
      }
    },
    { rootMargin: '400px 0px' }
  );
  io.observe(root);

  return function destroy() {
    cancelled = true;
    io.disconnect();
    if (mm) mm.revert();
  };
}

