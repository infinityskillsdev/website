import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// Automatically selects Vercel adapter if VERCEL=1 or DEPLOY_TARGET=vercel,
// otherwise defaults to standalone Node.js (cPanel, Plesk, VPS, Docker).
const isVercel = process.env.VERCEL === '1' || process.env.DEPLOY_TARGET === 'vercel';

export default defineConfig({
  output: 'server',
  adapter: isVercel
    ? vercel()
    : node({
        mode: 'standalone',
      }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/local.db*'],
      },
    },
  },
});
