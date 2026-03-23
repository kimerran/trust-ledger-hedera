import { auth } from './lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    // Protect all routes except login, public verify page, and Next.js internals
    '/((?!login|verify|_next/static|_next/image|favicon.ico).*)',
  ],
};
