
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud (Project Sebelah).
 * Handles internal rewriting for client subdomain and ensures CORS is enabled for cross-subdomain RSC.
 */

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Menangani port jika di lingkungan local
  const currentHost = hostname.split(':')[0];

  const isDevEnvironment = 
    currentHost.includes('localhost') || 
    currentHost.includes('cloudworkstations.dev') || 
    currentHost.includes('vercel.app') ||
    currentHost.includes('127.0.0.1');

  if (isDevEnvironment) {
    return NextResponse.next();
  }

  // Definisi Domain & Subdomain
  const clientDomain = 'client.stscloud.id';

  // Daftar rute eksklusif Client
  const clientRoutes = ['/dashboard', '/servers', '/settings', '/auth', '/deploy', '/dev'];

  // 1. Logika Subdomain Client (Pusat Kendali & Auth)
  if (currentHost === clientDomain) {
    if (url.pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/${url.search}`, `https://${clientDomain}`));
    }

    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }

  // 2. Main Domain (stscloud.id) - Redirect rute client ke client.stscloud.id
  if (clientRoutes.some(r => url.pathname.startsWith(r))) {
    let targetPath = url.pathname;
    if (targetPath === '/dashboard') targetPath = '/';
    return NextResponse.redirect(new URL(`${targetPath}${url.search}`, `https://${clientDomain}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|img).*)',
  ],
};

