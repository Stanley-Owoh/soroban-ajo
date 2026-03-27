import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  matcher: [
    // Match all pathnames except Next.js internals, API routes, and static files
    '/((?!api|_next|static|.*\\..*).*)',
  ],
};
