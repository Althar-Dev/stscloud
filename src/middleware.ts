
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud (Architecture).
 * Handles internal rewriting for subdomains and ensures query parameters are preserved.
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

  if (isDevEnvironment) {
    return NextResponse.next();
  }

  // Domain Config
  const rootDomain = 'stscloud.id';
  const clientDomain = 'client.stscloud.id';
  const deployDomain = 'deploy.stscloud.id';
  const devDomain = 'dev.stscloud.id';

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
    
    // Internal Map root to /dashboard, but keep path if it's already specific
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/dashboard${url.search}`, request.url));
    }
    return NextResponse.next();
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
    
    // Map / to /deploy internally if not already there
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/deploy${url.search}`, request.url));
    }
    return NextResponse.next();
  }

  // 3. Dev Subdomain (Console & Infrastructure Docs)
  if (currentHost === devDomain) {
    if (clientRoutes.some(r => url.pathname.startsWith(r)) || url.pathname.startsWith('/deploy')) {
      return NextResponse.redirect(new URL(`${url.pathname === '/dashboard' ? '/' : url.pathname}${url.search}`, `https://${clientDomain}`));
    }
    
    // Crucial: Avoid double /dev prefixing
    // If the path is '/' -> rewrite to '/dev'
    // If the path is '/docs' -> rewrite to '/dev/docs'
    // If the path is already '/dev' -> do nothing (let it pass to filesystem)
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/dev${url.search}`, request.url));
    }
    if (!url.pathname.startsWith('/dev')) {
      return NextResponse.rewrite(new URL(`/dev${url.pathname}${url.search}`, request.url));
    }
    
    return NextResponse.next();
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|img).*)'],
};
