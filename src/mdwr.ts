
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud (Project Sebelah).
 * Mengatur isolasi rute antar subdomain untuk mencegah kebocoran akses (e.g. /dev di subdomain client).
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
  const deployDomain = 'deploy.stscloud.id';
  const devDomain = 'dev.stscloud.id';

  // Daftar rute eksklusif Client
  const clientRoutes = ['/dashboard', '/servers', '/settings', '/auth', '/deploy'];

  // 1. Logika Subdomain Client (Pusat Kendali & Auth)
  if (currentHost === clientDomain) {
    // Larang akses ke /dev (Pindahkan ke subdomain dev)
    if (url.pathname.startsWith('/dev')) {
      const remainingPath = url.pathname.replace(/^\/dev/, '') || '/';
      return NextResponse.redirect(new URL(`${remainingPath}${url.search}`, `https://${devDomain}`));
    }

    // Jika akses /dashboard secara eksplisit, bersihkan prefix (redirect ke root client)
    if (url.pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/${url.search}`, `https://${clientDomain}`));
    }

    // Map root ke dashboard secara internal (Hide /dashboard dari URL)
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }

  // 2. Logika Subdomain Deploy (Legacy - Redirect ke Client)
  if (currentHost === deployDomain) {
    const targetPath = url.pathname === '/' ? '/deploy' : url.pathname;
    return NextResponse.redirect(new URL(`${targetPath}${url.search}`, `https://${clientDomain}`));
  }

  // 3. Logika Subdomain Dev (Developer Sandbox)
  if (currentHost === devDomain) {
    // Larang akses ke rute Client
    if (clientRoutes.some(route => url.pathname.startsWith(route))) {
      const target = url.pathname === '/dashboard' ? '/' : url.pathname;
      return NextResponse.redirect(new URL(target, `https://${clientDomain}`));
    }

    // Map root ke folder dev secara internal
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dev', request.url));
    }
    return NextResponse.next();
  }

  // 4. Force Redirect rute dari root domain (stscloud.id) ke subdomain yang tepat
  
  // Rute Dev
  if (url.pathname.startsWith('/dev')) {
    const remainingPath = url.pathname.replace(/^\/dev/, '') || '/';
    return NextResponse.redirect(new URL(`${remainingPath}${url.search}`, `https://${devDomain}`));
  }

  // Rute Client / Auth / Deploy
  if (clientRoutes.some(r => url.pathname.startsWith(r))) {
    let targetPath = url.pathname;
    if (targetPath === '/dashboard') targetPath = '/';
    return NextResponse.redirect(new URL(`${targetPath}${url.search}`, `https://${clientDomain}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for internal Next.js and assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|img).*)',
  ],
};
