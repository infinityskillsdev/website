import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db/client';
import { pagesSeo } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  await ensureDbInitialized();
  const pages = await db.select().from(pagesSeo).orderBy(pagesSeo.path);
  return new Response(JSON.stringify(pages), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  await ensureDbInitialized();
  try {
    const data = await request.json();

    if (!data.path) {
      return new Response(JSON.stringify({ error: 'Path is required' }), { status: 400 });
    }

    // Clean path
    const cleanPath = data.path === '' ? '/' : (data.path.startsWith('/') ? data.path : `/${data.path}`);

    const existing = await db.select().from(pagesSeo).where(eq(pagesSeo.path, cleanPath)).limit(1);

    const payload = {
      path: cleanPath,
      pageName: data.pageName || cleanPath,
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
      keywords: data.keywords || '',
      canonicalUrl: data.canonicalUrl || '',
      ogTitle: data.ogTitle || '',
      ogDescription: data.ogDescription || '',
      ogImage: data.ogImage || '',
      twitterCard: data.twitterCard || 'summary_large_image',
      noindex: Boolean(data.noindex),
      nofollow: Boolean(data.nofollow),
      structuredDataType: data.structuredDataType || 'WebSite',
      customSchemaJson: data.customSchemaJson || '',
      changefreq: data.changefreq || 'weekly',
      priority: data.priority || '0.8',
      inSitemap: Boolean(data.inSitemap ?? true),
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db.update(pagesSeo).set(payload).where(eq(pagesSeo.path, cleanPath));
    } else {
      await db.insert(pagesSeo).values(payload);
    }

    return new Response(JSON.stringify({ success: true, path: cleanPath }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Database write error' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  await ensureDbInitialized();
  try {
    const { path } = await request.json();
    if (!path || path === '/') {
      return new Response(JSON.stringify({ error: 'Cannot delete homepage' }), { status: 400 });
    }

    await db.delete(pagesSeo).where(eq(pagesSeo.path, path));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
