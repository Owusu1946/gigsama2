import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db';

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const projects = await getProjects();
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title } = data;
    
    const newProject = await createProject(title);
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
} 