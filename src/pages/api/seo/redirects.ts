import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db/client';
import { redirects } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  await ensureDbInitialized();
  const list = await db.select().from(redirects).orderBy(redirects.sourcePath);
  return new Response(JSON.stringify(list), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  await ensureDbInitialized();
  try {
    const data = await request.json();
    if (!data.sourcePath || !data.targetPath) {
      return new Response(JSON.stringify({ error: 'Source and target paths are required' }), { status: 400 });
    }

    const payload = {
      sourcePath: data.sourcePath,
      targetPath: data.targetPath,
      statusCode: Number(data.statusCode) || 301,
      enabled: Boolean(data.enabled ?? true),
      updatedAt: new Date(),
    };

    const existing = await db.select().from(redirects).where(eq(redirects.sourcePath, data.sourcePath)).limit(1);

    if (existing.length > 0) {
      await db.update(redirects).set(payload).where(eq(redirects.sourcePath, data.sourcePath));
    } else {
      await db.insert(redirects).values(payload);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  await ensureDbInitialized();
  try {
    const { sourcePath } = await request.json();
    await db.delete(redirects).where(eq(redirects.sourcePath, sourcePath));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
