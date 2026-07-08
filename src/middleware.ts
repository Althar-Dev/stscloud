
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud (Project Sebelah).
 * Mengatur perutean otomatis antar subdomain tanpa pengecekan session di middleware.
 * 
 * PENTING AGAR TIDAK LOGIN ULANG:
 * Pastikan saat proses Login, Cookie 'sts_session' diset dengan properti:
 * { domain: '.stscloud.id', path: '/', secure: true }
 */

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Menangani port jika di lingkungan local (e.g. localhost:3000)
  const currentHost = hostname.split(':')[0];

  const isDevEnvironment = 
    currentHost.includes('localhost') || 
    currentHost.includes('cloudworkstations.dev') || 
    currentHost.includes('vercel.app') ||
    currentHost.includes('127.0.0.1');

  if (isDevEnvironment) {
    return NextResponse.next();
  }

  // Definisi Domain
  const rootDomain = 'stscloud.id';
  const clientDomain = 'client.stscloud.id';
  const deployDomain = 'deploy.stscloud.id';
  const devDomain = 'dev.stscloud.id';

  // 1. Logika Subdomain Client
  if (currentHost === clientDomain) {
    // Jika akses /deploy, pindahkan ke subdomain deploy (Tanpa Prefix)
    if (url.pathname.startsWith('/deploy')) {
      const remainingPath = url.pathname.replace(/^\/deploy/, '') || '/';
      return NextResponse.redirect(new URL(`${remainingPath}${url.search}`, `https://${deployDomain}`));
    }

    // Jika akses /dashboard secara eksplisit, bersihkan prefix (redirect ke root client)
    if (url.pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/${url.search}`, `https://${clientDomain}`));
    }

    // Map root ke dashboard secara internal (Hapus prefix dari pandangan user)
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }

  // 2. Logika Subdomain Deploy
  if (currentHost === deployDomain) {
    // Jika akses rute client, pindahkan ke subdomain client
    const clientRoutes = ['/dashboard', '/servers', '/settings'];
    if (clientRoutes.some(route => url.pathname.startsWith(route))) {
      let targetPath = url.pathname;
      // Jika itu dashboard, arahkan ke root client domain
      if (targetPath === '/dashboard') targetPath = '/';
      return NextResponse.redirect(new URL(`${targetPath}${url.search}`, `https://${clientDomain}`));
    }

    // Jika akses /deploy secara eksplisit di subdomain deploy, bersihkan prefix
    if (url.pathname === '/deploy') {
      return NextResponse.redirect(new URL(`/${url.search}`, `https://${deployDomain}`));
    }

    // Map root ke folder deploy secara internal
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/deploy', request.url));
    }
    
    return NextResponse.next();
  }

  // 3. Logika Subdomain Dev
  if (currentHost === devDomain) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dev', request.url));
    }
    return NextResponse.next();
  }

  // 4. Force Redirect rute dari root domain (stscloud.id) ke subdomain yang benar
  if (url.pathname.startsWith('/dashboard')) {
     return NextResponse.redirect(new URL(`/${url.search}`, `https://${clientDomain}`));
  }

  if (url.pathname.startsWith('/servers') || url.pathname.startsWith('/settings')) {
     return NextResponse.redirect(new URL(`${url.pathname}${url.search}`, `https://${clientDomain}`));
  }

  if (url.pathname.startsWith('/deploy')) {
    const remainingPath = url.pathname.replace(/^\/deploy/, '') || '/';
    return NextResponse.redirect(new URL(`${remainingPath}${url.search}`, `https://${deployDomain}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|img).*)',
  ],
};
