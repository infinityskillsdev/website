import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../db/client';
import { siteSettings } from '../db/schema';

export const GET: APIRoute = async ({ url }) => {
  await ensureDbInitialized();

  const siteUrl = process.env.SITE_URL || url.origin;
  const [settings] = await db.select().from(siteSettings).limit(1);

  let robotsContent = settings?.robotsTxtCustom || 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /blog\nDisallow: /api/';

  // Ensure /blog and /admin are disallowed while blog is hidden
  if (!robotsContent.includes('Disallow: /blog')) {
    robotsContent += '\nDisallow: /blog';
  }
  if (!robotsContent.includes('Disallow: /admin')) {
    robotsContent += '\nDisallow: /admin';
  }

  // Ensure Sitemap line exists with absolute URL
  if (!robotsContent.includes('Sitemap:')) {
    robotsContent += `\n\nSitemap: ${siteUrl}/sitemap.xml`;
  } else {
    robotsContent = robotsContent.replace('Sitemap: /sitemap.xml', `Sitemap: ${siteUrl}/sitemap.xml`);
  }

  return new Response(robotsContent.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
