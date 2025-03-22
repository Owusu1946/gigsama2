import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject, getUserProjects } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/projects - Get all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check session directly from cookie
    const sessionId = request.cookies.get('session_id')?.value;
    console.log('[API] GET /api/projects - Session ID in cookie:', sessionId ? sessionId.substring(0, 5) + '...' : 'none');
    
    // Try to get the authenticated user
    const user = await getCurrentUser();
    console.log('[API] GET /api/projects - User authenticated:', !!user, user ? `(ID: ${user.id})` : '');
    
    // If authenticated, get only the user's projects
    if (user) {
      console.log('[API] Getting projects for user:', user.id);
      const userProjects = await getUserProjects(user.id);
      console.log('[API] Found user projects:', userProjects.length);
      return NextResponse.json(userProjects);
    } else {
      // If not authenticated, return 401 Unauthorized
      console.log('[API] No authenticated user, returning 401 Unauthorized');
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in or sign up to view and create projects'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('[API] Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title } = data;
    
    // Check session directly from cookie
    const sessionId = request.cookies.get('session_id')?.value;
    console.log('[API] POST /api/projects - Session ID in cookie:', sessionId ? sessionId.substring(0, 5) + '...' : 'none');
    
    // Try to get the authenticated user
    const user = await getCurrentUser();
    console.log('[API] POST /api/projects - User authenticated:', !!user, user ? `(ID: ${user.id})` : '');
    
    // Require authentication to create projects
    if (!user) {
      console.log('[API] No authenticated user, returning 401 Unauthorized');
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in or sign up to create projects'
      }, { status: 401 });
    }
    
    // Create project with user ID
    const newProject = await createProject(title, user.id);
    console.log('[API] Created project with ID:', newProject.id, 'for user:', user.id);
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
} 