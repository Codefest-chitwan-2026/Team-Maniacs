import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page to always be accessible
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect all other admin UI and admin API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminId = req.cookies.get('satark_admin_id')?.value || '';

    // If no admin cookie, redirect to login
    if (!adminId) {
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
