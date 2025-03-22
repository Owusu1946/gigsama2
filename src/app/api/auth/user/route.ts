import { NextRequest, NextResponse } from 'next/server';
import { getSessionData } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value;
    console.log('[AUTH] GET /api/auth/user - Session ID from cookie:', sessionId ? sessionId.substring(0, 5) + '...' : 'not found');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }
    
    // Get session data from Redis
    const sessions = await getSessionData();
    console.log('[AUTH] Sessions data after unwrapping:', JSON.stringify(sessions).substring(0, 100) + '...');
    console.log('[AUTH] Available session IDs:', Object.keys(sessions));
    
    const session = sessions[sessionId];
    console.log('[AUTH] Session found for ID:', sessionId.substring(0, 5) + '...', 'Result:', !!session);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' }, 
        { status: 401 }
      );
    }
    
    // Get user from database
    const userId = session.userId;
    console.log('[AUTH] User ID from session:', userId);
    
    const user = await getUserById(userId);
    console.log('[AUTH] User found for ID:', userId, 'Result:', !!user);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Only return safe user data (not password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('[AUTH] Error getting user:', error);
    
    return NextResponse.json(
      { error: 'Failed to get user data' }, 
      { status: 500 }
    );
  }
} 