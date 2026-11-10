// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://skalapro.or.id',
  output: 'static',
  adapter: vercel(),
  // Skema URL diseragamkan tanpa garis miring akhir supaya canonical, og:url,
  // dan sitemap memakai bentuk yang sama. Struktur build tetap "directory"
  // (program/index.html), dan seluruh link internal situs sudah tanpa slash.
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Vite menolak Host yang tidak dikenal (403 "Blocked request"), jadi
      // preview via Cloudflare quick tunnel harus di-allowlist. Entri berawalan
      // "." dicocokkan sebagai suffix domain, sehingga tetap aman untuk
      // hostname tunnel yang berganti setiap restart. Hanya berlaku saat dev.
      allowedHosts: ['.trycloudflare.com']
    }
  }
});