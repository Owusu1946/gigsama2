import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getUserByEmail } from '@/lib/db';
import { setSessionData, getSessionData } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }
    
    // Verify password (simple check for demo)
    const hashedPassword = password + "_hashed";
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }
    
    // Generate session ID
    const sessionId = nanoid();
    
    // Get existing sessions with any nested structure unwrapped
    const sessions = await getSessionData() || {};
    console.log('[AUTH] Current sessions before login:', Object.keys(sessions));
    
    // Add the new session at the top level
    sessions[sessionId] = {
      userId: user.id,
      createdAt: Date.now()
    };
    
    console.log('[AUTH] Session keys after adding new session:', Object.keys(sessions));
    
    // Always store with a simple, single-level nesting structure
    try {
      await setSessionData({ value: sessions });
      console.log('[AUTH] Created session for user:', user.id, 'with ID:', sessionId);
    } catch (err) {
      console.error('[AUTH] Failed to create session:', err);
    }
    
    // Create response with user data
    const response = NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    
    // Set cookie in the response
    response.cookies.set({
      name: 'session_id',
      value: sessionId,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax'
    });
    
    return response;
  } catch (error: any) {
    console.error('[AUTH] Error signing in:', error);
    
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
} 