
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Middleware untuk manajemen multi-subdomain STSCloud.
 * Mengatur perutean otomatis untuk client.stscloud.id, deploy.stscloud.id, dan dev.stscloud.id.
 */

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - img (public images)
     * - lottie (lottie files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|img|lottie).*)',
  ],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Abaikan jika ini adalah domain workspace (Cloud Workstations) atau localhost
  // Hal ini memastikan alur pengembangan di Firebase Studio tidak terganggu.
  if (
    hostname.includes('cloudworkstations.dev') || 
    hostname.includes('localhost') || 
    hostname.includes('127.0.0.1')
  ) {
    return NextResponse.next();
  }

  // 2. Deteksi Subdomain
  // Asumsi domain produksi adalah stscloud.id
  const parts = hostname.split('.');
  
  // Jika hostname memiliki subdomain (e.g. client.stscloud.id -> parts.length === 3)
  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();

    // client.stscloud.id -> Tampilkan Dashboard saat mengakses root subdomain
    if (subdomain === 'client' && url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard', request.url));
    }

    // deploy.stscloud.id -> Tampilkan Halaman Deploy saat mengakses root subdomain
    if (subdomain === 'deploy' && url.pathname === '/') {
      return NextResponse.rewrite(new URL('/deploy', request.url));
    }

    // dev.stscloud.id -> Tampilkan Dev Console saat mengakses root subdomain
    if (subdomain === 'dev' && url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dev', request.url));
    }
  }

  // Jika tidak ada subdomain atau rute spesifik, lanjutkan secara normal (Landing Page)
  return NextResponse.next();
}
