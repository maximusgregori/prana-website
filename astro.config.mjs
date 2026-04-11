import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://constanceit.github.io/prana-website',
  integrations: [sitemap()],
});
