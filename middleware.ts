import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* except /admin (the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
