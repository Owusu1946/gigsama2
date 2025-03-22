import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes require authentication
const protectedRoutes = ['/project'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get('session_id')?.value;
  
  // Check if user is trying to access a protected route without a session
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route);
  
  // If trying to access protected route without session, redirect to login
  if (isProtectedRoute && !sessionId) {
    const redirectUrl = new URL('/login', request.url);
    // Add the original URL as a parameter so we can redirect back after login
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If user is logged in and tries to access login/signup, redirect to home
  if (isAuthRoute && sessionId) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure the paths this middleware will run on
export const config = {
  matcher: [
    // Apply to all routes except api, static files, images, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 