
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud.
 * Mengelola perutean subdomain menggunakan Internal Rewriting untuk menjaga sesi.
 */

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const session = request.cookies.get('sts_session');

  // Bypass untuk lingkungan pengembangan lokal
  const isDevEnvironment = 
    hostname.includes('localhost') || 
    hostname.includes('cloudworkstations.dev') || 
    hostname.includes('127.0.0.1');

  if (isDevEnvironment) {
    return NextResponse.next();
  }

  // Definisi Domain Utama dan Subdomain
  const rootDomain = 'stscloud.id';
  const clientDomain = 'client.stscloud.id';
  const deployDomain = 'deploy.stscloud.id';
  const devDomain = 'dev.stscloud.id';

  const isClientHost = hostname === clientDomain;
  const isDeployHost = hostname === deployDomain;
  const isDevHost = hostname === devDomain;

  // 1. Logika Subdomain Client (Dashboard & Servers)
  if (isClientHost) {
    if (!session && url.pathname !== '/auth') {
      return NextResponse.redirect(new URL('/auth?type=login', `https://${rootDomain}`));
    }
    // Map root subdomain ke /dashboard secara internal
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Logika Subdomain Deploy
  if (isDeployHost) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/deploy', request.url));
    }
    return NextResponse.next();
  }

  // 3. Logika Subdomain Dev (Developer Console)
  if (isDevHost) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dev', request.url));
    }
    return NextResponse.next();
  }

  // 4. Dashboard Enforcement (Redirect dari Domain Utama ke Subdomain)
  const protectedRoutes = ['/dashboard', '/servers', '/settings'];
  if (protectedRoutes.some(route => url.pathname.startsWith(protectedRoutes[0]))) {
     return NextResponse.redirect(new URL('/', `https://${clientDomain}`));
  }

  if (url.pathname.startsWith('/deploy')) {
    return NextResponse.redirect(new URL('/', `https://${deployDomain}`));
  }

  if (url.pathname.startsWith('/dev')) {
    return NextResponse.redirect(new URL('/', `https://${devDomain}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|img|lottie).*)',
  ],
};
