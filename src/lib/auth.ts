import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { createUser, getUserByEmail, getUserById } from './db';

// Mock crypto functions since we're not using actual bcrypt
function mockHashPassword(password: string): string {
  // This is NOT secure - in a real app, use bcrypt!
  return password + "_hashed"; 
}

function mockComparePassword(password: string, hashedPassword: string): boolean {
  // This is NOT secure - in a real app, use bcrypt!
  return hashedPassword === password + "_hashed";
}

// Session management
export async function createSession(userId: string) {
  const sessionId = nanoid();
  
  try {
    // Get existing sessions and completely unwrap the structure
    const sessions = await getSessionData() || {};
    console.log('[AUTH] Current sessions before adding new one:', Object.keys(sessions));
    
    // Add the new session at the top level
    sessions[sessionId] = {
      userId,
      createdAt: Date.now()
    };
    
    console.log(`[AUTH] Created new session (ID: ${sessionId.substring(0, 5)}...) for user: ${userId}`);
    console.log('[AUTH] Updated sessions structure:', Object.keys(sessions));
    
    // Store the flattened session data
    await setSessionData({ value: sessions });
    
    // Set session cookie - in production, use httpOnly and secure flags
    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'lax'
    });
    
    return sessionId;
  } catch (error) {
    console.error('[AUTH] Error creating session:', error);
    throw error;
  }
}

// Helper function to recursively unwrap nested value objects
function unwrapNestedValue(obj: any): any {
  // Base case: if not an object or null, return as is
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // If it has only a single 'value' property, recursively unwrap it
  if (Object.keys(obj).length === 1 && 'value' in obj) {
    return unwrapNestedValue(obj.value);
  }
  
  // Otherwise return the object as is
  return obj;
}

export async function getSessionData() {
  // In a real app, use a proper session store
  try {
    const res = await fetch(`${process.env.keymap_KV_REST_API_URL}/get/sessions`, {
      headers: {
        Authorization: `Bearer ${process.env.keymap_KV_REST_API_TOKEN}`
      }
    });
    
    if (!res.ok) return {};
    
    const data = await res.json();
    console.log('[AUTH] Raw session data from Redis:', JSON.stringify(data).substring(0, 100) + '...');
    
    // Handle the deeply nested structure that might come back from Redis
    if (data?.result) {
      if (typeof data.result === 'string') {
        try {
          // If it's a string, try to parse it
          const parsedResult = JSON.parse(data.result);
          console.log('[AUTH] Parsed result first level:', Object.keys(parsedResult));
          
          // Unwrap any level of nesting
          const unwrappedResult = unwrapNestedValue(parsedResult);
          console.log('[AUTH] After unwrapping all nesting levels:', Object.keys(unwrappedResult));
          
          return unwrappedResult;
        } catch (e) {
          console.error('[AUTH] Failed to parse session data:', e);
          return {};
        }
      } else {
        // If it's already an object, unwrap it if needed
        return unwrapNestedValue(data.result);
      }
    }
    
    return {};
  } catch (error) {
    console.error('[AUTH] Error getting session data:', error);
    return {};
  }
}

export async function setSessionData(sessions: Record<string, any>) {
  // In a real app, use a proper session store
  try {
    console.log('[AUTH] Setting session data:', JSON.stringify(sessions));
    
    const response = await fetch(`${process.env.keymap_KV_REST_API_URL}/set/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.keymap_KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: sessions })
    });
    
    if (!response.ok) {
      console.error('[AUTH] Failed to set session data, status:', response.status);
      const responseText = await response.text();
      console.error('[AUTH] Response body:', responseText);
    }
  } catch (error) {
    console.error('[AUTH] Error setting session data:', error);
    throw error;
  }
}

export async function getCurrentSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) {
      console.log('[AUTH] No session ID in cookie');
      return null;
    }
    
    console.log('[AUTH] Found session ID in cookie:', sessionId.substring(0, 5) + '...');
    
    const sessions = await getSessionData();
    console.log('[AUTH] Sessions data after unwrapping:', JSON.stringify(sessions).substring(0, 100) + '...');
    console.log('[AUTH] Available session IDs:', Object.keys(sessions));
    
    if (!sessions[sessionId]) {
      console.log('[AUTH] Session ID not found in sessions store');
      return null;
    }
    
    console.log('[AUTH] Session found, user ID:', sessions[sessionId].userId);
    return sessions[sessionId];
  } catch (error) {
    console.error('[AUTH] Error getting session:', error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  
  if (!session) return null;
  
  return getUserById(session.userId);
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (sessionId) {
      console.log(`[AUTH] Signing out session: ${sessionId.substring(0, 5)}...`);
      
      // Get sessions with proper unwrapping
      const sessions = await getSessionData() || {};
      console.log('[AUTH] Current sessions before logout:', Object.keys(sessions));
      
      if (sessions[sessionId]) {
        // Delete the session
        delete sessions[sessionId];
        
        // Save the updated sessions
        await setSessionData({ value: sessions });
        console.log('[AUTH] Updated sessions after removal:', Object.keys(sessions));
      }
      
      // Clear cookie
      cookieStore.delete('session_id');
      console.log('[AUTH] Session cookie deleted');
    }
  } catch (error) {
    console.error('[AUTH] Error signing out:', error);
  }
}

// Auth functions
export async function signUp(name: string, email: string, password: string) {
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Create new user with hashed password
  const hashedPassword = mockHashPassword(password);
  
  const newUser = await createUser({
    name,
    email,
    password: hashedPassword
  });
  
  // Create session
  await createSession(newUser.id);
  
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email
  };
}

export async function signIn(email: string, password: string) {
  // Find user by email
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const passwordMatch = mockComparePassword(password, user.password);
  
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Create session
  await createSession(user.id);
  
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

// Helper to protect routes
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Utility function to completely reset the session structure
// Only use this when the nesting gets out of control
export async function resetSessionStructure() {
  try {
    const sessions = await getSessionData();
    console.log('[AUTH] Resetting session structure. Current sessions:', Object.keys(sessions));
    
    // Create a new clean structure with just the existing sessions
    await setSessionData({ value: sessions });
    
    console.log('[AUTH] Session structure has been reset with a clean structure');
    return true;
  } catch (error) {
    console.error('[AUTH] Error resetting session structure:', error);
    return false;
  }
} 