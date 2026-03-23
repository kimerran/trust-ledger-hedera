import { auth } from './lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  if (!req.auth) {
    const host = req.headers.get('x-forwarded-host') ?? req.nextUrl.host;
    const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
    return NextResponse.redirect(new URL('/login', `${proto}://${host}`));
  }
});

export const config = {
  matcher: [
    // Protect all routes except login, public verify page, and Next.js internals
    '/((?!login|verify|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
