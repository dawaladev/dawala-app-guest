import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = ['id', 'en'].every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Try to get preferred locale from cookie (fallback to 'id')
    const preferredLocale = request.cookies.get('preferred-locale')?.value || 'id';
    const validLocale = ['id', 'en'].includes(preferredLocale) ? preferredLocale : 'id';
    
    return NextResponse.redirect(
      new URL(`/${validLocale}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), api, static files, and images
    '/((?!_next|api|favicon.ico|images|.*\\.).*)',
  ],
};
