import { defineMiddleware } from 'astro:middleware';
import { db, ensureDbInitialized } from './db/client';
import { redirects } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidSession, SESSION_COOKIE_NAME } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const method = context.request.method;

  // 1. ADMIN AUTHENTICATION RESTRICTION
  if (pathname.startsWith('/admin')) {
    // Allow public access ONLY to /admin/login
    if (pathname === '/admin/login' || pathname === '/admin/login/') {
      // If already logged in, redirect straight to /admin/seo
      const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (isValidSession(token)) {
        return context.redirect('/admin/seo');
      }
      return next();
    }

    // Protect all other /admin routes
    const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!isValidSession(token)) {
      const redirectUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
      return context.redirect(redirectUrl);
    }
  }

  // 2. PROTECT ADMIN API ENDPOINTS (Block unauthorized mutations)
  if (
    (pathname.startsWith('/api/seo') || pathname.startsWith('/api/blog')) &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  ) {
    const token = context.cookies.get(SESSION_COOKIE_NAME)?.value || context.request.headers.get('authorization')?.replace('Bearer ', '');
    if (!isValidSession(token)) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Admin login required.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Skip static assets and internal paths from redirect check
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_astro') ||
    pathname.includes('.')
  ) {
    return next();
  }

  // 3. 301 / 302 DYNAMIC REDIRECT ENGINE
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
