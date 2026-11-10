import type { APIRoute } from 'astro';
import { db, ensureDbInitialized } from '../../../db/client';
import { posts } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const GET: APIRoute = async () => {
  await ensureDbInitialized();
  const allPosts = await db.select().from(posts).orderBy(desc(posts.publishedAt));
  return new Response(JSON.stringify(allPosts), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  await ensureDbInitialized();
  try {
    const data = await request.json();

    if (!data.title || !data.content) {
      return new Response(JSON.stringify({ error: 'Title and content are required' }), { status: 400 });
    }

    const cleanSlug = data.slug ? slugify(data.slug) : slugify(data.title);

    const payload = {
      slug: cleanSlug,
      title: data.title,
      excerpt: data.excerpt || data.content.slice(0, 160).replace(/[#*`_]/g, '') + '...',
      content: data.content,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
      category: data.category || 'General',
      author: data.author || 'Infinity Team',
      status: data.status || 'published',
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      updatedAt: new Date(),
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || (data.excerpt || data.title),
      canonicalUrl: data.canonicalUrl || '',
      noindex: Boolean(data.noindex),
    };

    if (data.id) {
      // Update existing post
      await db.update(posts).set(payload).where(eq(posts.id, Number(data.id)));
      return new Response(JSON.stringify({ success: true, id: data.id, slug: cleanSlug }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Create new post
      const inserted = await db.insert(posts).values(payload).returning({ id: posts.id });
      return new Response(JSON.stringify({ success: true, id: inserted[0]?.id, slug: cleanSlug }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

