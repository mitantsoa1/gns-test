import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

// Créer le middleware next-intl
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Exclure les routes d'API de Better Auth du middleware next-intl
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Appliquer le middleware next-intl pour toutes les autres routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fr|en)/:path*', '/api/auth/:path*']
};
