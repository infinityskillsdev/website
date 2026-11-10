import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db/client';
import { posts } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params }) => {
  await ensureDbInitialized();
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });
  }

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) {
    return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  await ensureDbInitialized();
  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });
  }

  await db.delete(posts).where(eq(posts.id, id));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

