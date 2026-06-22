import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except Next.js internals, static files, and API routes
  matcher: [
    '/',
    '/(es|en)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ]
};
