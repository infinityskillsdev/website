import type { APIRoute } from 'astro';
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password } = await request.json();

    if (!verifyPassword(password)) {
      return new Response(JSON.stringify({ error: 'Invalid admin password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = createSessionToken();

    // Set secure HTTP-only cookie valid for 7 days
    cookies.set(SESSION_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

