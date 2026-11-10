import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db/client';
import { siteSettings } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  await ensureDbInitialized();
  const [settings] = await db.select().from(siteSettings).limit(1);
  return new Response(JSON.stringify(settings || {}), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  await ensureDbInitialized();
  try {
    const data = await request.json();
    const [existing] = await db.select().from(siteSettings).limit(1);

    const payload = {
      siteName: data.siteName || 'Infinity Site',
      siteDescription: data.siteDescription || '',
      titleTemplate: data.titleTemplate || '%title% | %site_name%',
      defaultOgImage: data.defaultOgImage || '',
      twitterHandle: data.twitterHandle || '',
      googleVerification: data.googleVerification || '',
      bingVerification: data.bingVerification || '',
      robotsTxtCustom: data.robotsTxtCustom || 'User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml',
      headScripts: data.headScripts || '',
      bodyScripts: data.bodyScripts || '',
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(siteSettings).set(payload).where(eq(siteSettings.id, existing.id));
    } else {
      await db.insert(siteSettings).values(payload);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error updating settings' }), { status: 500 });
  }
};

