import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../db/client';
import { pagesSeo } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, url }) => {
  await ensureDbInitialized();

  const siteUrl = process.env.SITE_URL || url.origin;

  // Retrieve all pages marked for inclusion in sitemap and not noindexed
  const indexedPages = await db
    .select()
    .from(pagesSeo)
    .where(and(eq(pagesSeo.inSitemap, true), eq(pagesSeo.noindex, false)));

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexedPages
  .map((page) => {
    const loc = `${siteUrl}${page.path === '/' ? '' : page.path}`;
    const lastmod = page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString();
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || '0.8'}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
