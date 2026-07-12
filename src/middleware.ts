
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud (Architecture).
 * Handles internal rewriting for subdomains and ensures CORS is enabled for cross-subdomain RSC.
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
  const deployDomain = 'deploy.stscloud.id';
  const devDomain = 'dev.stscloud.id';

  // Add CORS headers to support cross-subdomain RSC data fetching
  response.headers.set('Access-Control-Allow-Origin', `https://${clientDomain}`);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-sts-server-id, x-sts-sub-path');

  // Routes for explicit routing
  const clientRoutes = ['/dashboard', '/servers', '/settings', '/auth'];

  // 1. Client Subdomain (Panel & Dashboard)
  if (currentHost === clientDomain) {
    if (url.pathname.startsWith('/deploy')) {
      const target = url.pathname.replace('/deploy', '') || '/';
      return NextResponse.redirect(new URL(`${target}${url.search}`, `https://${deployDomain}`));
    }
    if (url.pathname.startsWith('/dev')) {
      const target = url.pathname.replace('/dev', '') || '/';
      return NextResponse.redirect(new URL(`${target}${url.search}`, `https://${devDomain}`));
    }
    
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/dashboard${url.search}`, request.url));
    }
    return response;
  }

  // 2. Deploy Subdomain (Server Setup)
  if (currentHost === deployDomain) {
    if (clientRoutes.some(r => url.pathname.startsWith(r))) {
      const target = url.pathname === '/dashboard' ? '/' : url.pathname;
      return NextResponse.redirect(new URL(`${target}${url.search}`, `https://${clientDomain}`));
    }
    if (url.pathname.startsWith('/dev')) {
      const target = url.pathname.replace('/dev', '') || '/';
      return NextResponse.redirect(new URL(`${target}${url.search}`, `https://${devDomain}`));
    }
    
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/deploy${url.search}`, request.url));
    }
    return response;
  }

  // 3. Dev Subdomain (Console & Infrastructure Docs)
  if (currentHost === devDomain) {
    if (clientRoutes.some(r => url.pathname.startsWith(r)) || url.pathname.startsWith('/deploy')) {
      return NextResponse.redirect(new URL(`${url.pathname === '/dashboard' ? '/' : url.pathname}${url.search}`, `https://${clientDomain}`));
    }
    
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/dev${url.search}`, request.url));
    }
    if (!url.pathname.startsWith('/dev')) {
      return NextResponse.rewrite(new URL(`/dev${url.pathname}${url.search}`, request.url));
    }
    
    return response;
  }

  // 4. Fallback from root (stscloud.id) to proper subdomain
  if (url.pathname.startsWith('/dev')) {
    const target = url.pathname.replace('/dev', '') || '/';
    return NextResponse.redirect(new URL(`${target}${url.search}`, `https://${devDomain}`));
  }
  if (clientRoutes.some(r => url.pathname.startsWith(r))) {
    const target = url.pathname === '/dashboard' ? '/' : url.pathname;
    return NextResponse.redirect(new URL(`${target}${url.search}`, `https://${clientDomain}`));
  }
  if (url.pathname.startsWith('/deploy')) {
    const target = url.pathname.replace('/deploy', '') || '/';
    return NextResponse.redirect(new URL(`${target}${url.search}`, `https://${deployDomain}`));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|img).*)'],
};
