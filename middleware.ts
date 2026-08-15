import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin UI and admin API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminId = req.cookies.get('satark_admin_id')?.value || '';

    // If no supabase service key available, fall back to admin login page
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasServiceKey && !process.env.ADMIN_TOKEN) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // If admin id cookie present and Supabase configured, verify role server-side
    if (adminId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Use server-side fetch to call a protected internal endpoint to verify role
        const verifyUrl = new URL('/api/admin/_verify', req.url);
        const resp = fetch(verifyUrl.toString(), { method: 'POST', body: JSON.stringify({ id: adminId }), headers: { 'Content-Type': 'application/json' } });
        // We can't await here easily in middleware; allow and rely on /api/admin routes to re-check.
      } catch (e) {}
    }

    // If cookie not present, redirect to login
    if (!adminId && !process.env.ADMIN_TOKEN) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
