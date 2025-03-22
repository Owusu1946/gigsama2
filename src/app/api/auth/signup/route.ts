import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createUser, getUserByEmail } from '@/lib/db';
import { setSessionData, getSessionData } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' }, 
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 409 }
      );
    }
    
    // Create new user with hashed password
    const hashedPassword = password + "_hashed"; // Not secure, just for demo
    
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword
    });
    
    // Generate session ID
    const sessionId = nanoid();
    
    // Get existing sessions with any nested structure unwrapped
    const sessions = await getSessionData() || {};
    console.log('[AUTH] Current sessions before signup:', Object.keys(sessions));
    
    // Add the new session at the top level
    sessions[sessionId] = {
      userId: newUser.id,
      createdAt: Date.now()
    };
    
    console.log('[AUTH] Session keys after adding new session:', Object.keys(sessions));
    
    // Always store with a simple, single-level nesting structure
    try {
      await setSessionData({ value: sessions });
      console.log('[AUTH] Created session for new user:', newUser.id, 'with ID:', sessionId);
    } catch (err) {
      console.error('[AUTH] Failed to create session:', err);
    }
    
    // Create response with user data
    const response = NextResponse.json({ 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    }, { status: 201 });
    
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
    console.error('[AUTH] Error signing up:', error);
    
    return NextResponse.json(
      { error: 'Failed to create account' }, 
      { status: 500 }
    );
  }
} 