import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
  response.headers.set('Content-Type', 'application/json');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
