import { NextResponse } from 'next/server';
import { debug, info, error, warn } from './utils/logger';

export async function middleware(request) {
  const searchId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  // Create a logger object for compatibility
  const log = {
    debug,
    info,
    error,
    warn
  };

  // Log request
  log.info(`[${searchId}] API Request`, {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers)
  });

  // Process request
  const response = NextResponse.next();

  // Set CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
    response.headers.set('Content-Type', 'application/json');
  }

  // Log response time
  const duration = Date.now() - startTime;
  log.info(`[${searchId}] API Response`, {
    status: response.status,
    duration
  });

  return response;
}

export const config = {
  matcher: ['/api/:path*']
};
