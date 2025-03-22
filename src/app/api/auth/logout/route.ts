import { NextRequest, NextResponse } from 'next/server';
import { getSessionData, setSessionData } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (sessionId) {
      // Delete session from Redis store
      try {
        const sessions = await getSessionData() || {};
        console.log('[AUTH] Current sessions before logout:', Object.keys(sessions));
        
        if (sessions[sessionId]) {
          // Delete the session
          delete sessions[sessionId];
          
          // Save with the consistent structure
          await setSessionData({ value: sessions });
          console.log('[AUTH] Updated sessions after removal:', Object.keys(sessions));
        } else {
          console.log('[AUTH] Session not found in store:', sessionId.substring(0, 5) + '...');
        }
      } catch (err) {
        console.error('[AUTH] Error deleting session from Redis:', err);
      }
    }
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Clear all authentication-related cookies
    response.cookies.delete('session_id');
    
    // Clear any other authentication cookies that might be set
    // List of potential auth-related cookies to clear
    const authCookies = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      'auth-token',
      'refresh-token',
      'user-info'
    ];
    
    // Clear each potential cookie
    authCookies.forEach(cookieName => {
      if (request.cookies.has(cookieName)) {
        console.log(`[AUTH] Clearing additional cookie: ${cookieName}`);
        response.cookies.delete(cookieName);
      }
    });
    
    console.log('[AUTH] All authentication cookies have been cleared');
    
    return response;
  } catch (error) {
    console.error('[AUTH] Error signing out:', error);
    
    return NextResponse.json(
      { error: 'Failed to sign out' }, 
      { status: 500 }
    );
  }
} 