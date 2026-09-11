
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud (Architecture).
 * Handles internal rewriting for client subdomain and ensures CORS is enabled for cross-subdomain RSC.
 */

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const currentHost = hostname.split(':')[0];

  const isDevEnvironment = 
    currentHost.includes('localhost') || 
    currentHost.includes('cloudworkstations.dev') || 
    currentHost.includes('vercel.app') ||
    currentHost.includes('127.0.0.1');

  // Basic response headers for all requests
  const response = NextResponse.next();

  if (isDevEnvironment) {
    return response;
  }

  // Domain Config
  const clientDomain = 'client.stscloud.id';

  // Add CORS headers to support cross-subdomain RSC data fetching
  response.headers.set('Access-Control-Allow-Origin', `https://${clientDomain}`);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-sts-server-id, x-sts-sub-path');

  // Client Application Routes
  const clientRoutes = ['/dashboard', '/servers', '/settings', '/auth', '/deploy', '/dev'];

  // 1. Client Subdomain (Panel, Dashboard, Auth & Apps)
  if (currentHost === clientDomain) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/dashboard${url.search}`, request.url));
    }
    return response;
  }

  // 2. Main Domain (stscloud.id) - Redirect client routes to client.stscloud.id (Landing page stays at '/')
  if (clientRoutes.some(r => url.pathname.startsWith(r))) {
    let targetPath = url.pathname;
    if (targetPath === '/dashboard') targetPath = '/';
    return NextResponse.redirect(new URL(`${targetPath}${url.search}`, `https://${clientDomain}`));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|img).*)'],
};

