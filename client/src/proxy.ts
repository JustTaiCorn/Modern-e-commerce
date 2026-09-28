import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/login',
  '/user/login',
  '/register',
  '/user/signup',
  '/forgot-password',
  '/user/reset-password',
  '/user/authenticate',
];
const protectedPaths = ['/profile', '/orders', '/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasTokens =
    request.cookies.get('access_token') || request.cookies.get('refresh_token');
  const isAuthenticated = !!hasTokens;

  // Skip proxy for non-relevant paths (like api, _next, static files)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect authenticated users trying to access auth pages
  if (isAuthenticated && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users trying to access protected pages
  if (
    !isAuthenticated &&
    protectedPaths.some((path) => pathname.startsWith(path))
  ) {
    const loginUrl = new URL('/user/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
