import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../db/client';
import { pagesSeo } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  await ensureDbInitialized();

  const siteUrl = process.env.SITE_URL || url.origin;

  // Retrieve public pages marked for inclusion in sitemap and not noindexed
  // Exclude /blog routes until official launch approval as requested in the brief
  const indexedPages = await db
    .select()
    .from(pagesSeo)
    .where(and(eq(pagesSeo.inSitemap, true), eq(pagesSeo.noindex, false)));

  const publicPages = indexedPages.filter(
    (page) => !page.path.startsWith('/blog') && !page.path.startsWith('/admin')
  );

  // Core static routes fallback if DB doesn't have them yet
  const corePaths = ['/', '/about', '/courses', '/partner', '/contact'];
  const presentPaths = new Set(publicPages.map((p) => p.path));

  const allEntries = [...publicPages];
  for (const p of corePaths) {
    if (!presentPaths.has(p)) {
      allEntries.push({
        id: 0,
        path: p,
        pageName: p === '/' ? 'Home' : p.slice(1),
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterCard: 'summary_large_image',
        noindex: false,
        nofollow: false,
        structuredDataType: 'WebSite',
        customSchemaJson: '',
        changefreq: 'weekly',
        priority: p === '/' ? '1.0' : '0.8',
        inSitemap: true,
        updatedAt: new Date(),
      });
    }
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
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
