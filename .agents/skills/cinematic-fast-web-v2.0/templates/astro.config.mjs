// astro.config.mjs — v2.0
// Astro (HTML estático) + Tailwind v4 (plugin de Vite) + islas React + sitemap.
// React solo se hidrata donde se use `client:visible` / `client:idle` (nivel M3).
// Quitar `react()` si el proyecto no tiene ninguna pieza con estado real (ver references/matriz-stack.md).
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://TODO-DOMINIO.com',   // imprescindible: canonical, sitemap y OG usan esta URL
  output: 'static',
  trailingSlash: 'always',            // elegir una convención y respetarla en canonical/sitemap
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});

