import { defineMiddleware } from 'astro:middleware';
import { db, ensureDbInitialized } from './db/client';
import { redirects } from './db/schema';
import { eq, and } from 'drizzle-orm';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Skip static assets, api routes, and admin pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_astro') ||
    pathname.includes('.')
  ) {
    return next();
  }

  try {
    await ensureDbInitialized();
    const cleanPath = pathname === '' ? '/' : (pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname);

    const [rule] = await db
      .select()
      .from(redirects)
      .where(and(eq(redirects.sourcePath, cleanPath), eq(redirects.enabled, true)))
      .limit(1);

    if (rule) {
      return context.redirect(rule.targetPath, rule.statusCode as 301 | 302);
    }
  } catch (err) {
    console.error('Middleware redirect check error:', err);
  }

  return next();
});
