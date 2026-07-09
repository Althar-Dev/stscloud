
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview Traffic Controller STSCloud (SValePay Architecture).
 * Internal Rewriting for Subdomains with Sub-path support.
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
  const clientDomain = 'client.stscloud.id';
  const deployDomain = 'deploy.stscloud.id';
  const devDomain = 'dev.stscloud.id';

  // Routes for explicit routing
  const clientRoutes = ['/dashboard', '/servers', '/settings', '/auth'];

  // 1. Client Subdomain (Panel & Dashboard)
  if (currentHost === clientDomain) {
    if (url.pathname.startsWith('/deploy')) {
      return NextResponse.redirect(new URL(url.pathname.replace('/deploy', '') || '/', `https://${deployDomain}`));
    }
    if (url.pathname.startsWith('/dev')) {
      return NextResponse.redirect(new URL(url.pathname.replace('/dev', '') || '/', `https://${devDomain}`));
    }
    
    // Internal Map root to /dashboard
    const internalPath = url.pathname === '/' ? '/dashboard' : url.pathname;
    return NextResponse.rewrite(new URL(internalPath, request.url));
  }

  // 2. Deploy Subdomain (Server Setup)
  if (currentHost === deployDomain) {
    if (clientRoutes.some(r => url.pathname.startsWith(r))) {
      return NextResponse.redirect(new URL(url.pathname === '/dashboard' ? '/' : url.pathname, `https://${clientDomain}`));
    }
    if (url.pathname.startsWith('/dev')) {
      return NextResponse.redirect(new URL(url.pathname.replace('/dev', '') || '/', `https://${devDomain}`));
    }
    
    // Internal Map root to /deploy
    const internalPath = url.pathname === '/' ? '/deploy' : url.pathname;
    return NextResponse.rewrite(new URL(internalPath, request.url));
  }

  // 3. Dev Subdomain (Console & Infrastructure Docs)
  if (currentHost === devDomain) {
    if (clientRoutes.some(r => url.pathname.startsWith(r)) || url.pathname.startsWith('/deploy')) {
      return NextResponse.redirect(new URL('/', `https://${clientDomain}`));
    }
    
    // Internal Map root or subpaths to /dev folder
    // /docs -> /dev/docs
    const internalPath = `/dev${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(new URL(internalPath, request.url));
  }

  // 4. Fallback from root (stscloud.id) to proper subdomain
  if (url.pathname.startsWith('/dev')) {
    return NextResponse.redirect(new URL(url.pathname.replace('/dev', '') || '/', `https://${devDomain}`));
  }
  if (clientRoutes.some(r => url.pathname.startsWith(r))) {
    const target = url.pathname === '/dashboard' ? '/' : url.pathname;
    return NextResponse.redirect(new URL(target, `https://${clientDomain}`));
  }
  if (url.pathname.startsWith('/deploy')) {
    return NextResponse.redirect(new URL(url.pathname.replace('/deploy', '') || '/', `https://${deployDomain}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|img).*)'],
};
