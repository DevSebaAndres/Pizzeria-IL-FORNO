// astro.config.mjs — Astro + Tailwind v4 (plugin de Vite) + sitemap. Salida 100 % estática.
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://TODO-DOMINIO.com',   // imprescindible: canonical, sitemap y OG usan esta URL
  output: 'static',
  trailingSlash: 'always',            // elegir una convención y respetarla en canonical/sitemap
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
