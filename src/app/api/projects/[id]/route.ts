import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, deleteProject } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Extract ID from URL path instead of using params
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    
    const project = await getProject(id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Check if it's a view request
    const isViewRequest = url.pathname.includes('/view/') || 
      request.headers.get('referer')?.includes('/view/')
    
    // Get current user
    const user = await getCurrentUser()
    
    // For view requests, only return the schema and title (read-only data)
    if (isViewRequest) {
      return NextResponse.json({
        id: project.id,
        title: project.title,
        schema: project.schema
      })
    }
    
    // For non-view requests, require authentication if the project has an owner
    if (project.userId && project.userId !== user?.id) {
      return NextResponse.json(
        { error: 'You do not have permission to access this project' }, 
        { status: 401 }
      )
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Extract ID from URL path instead of using params
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    
    const project = await getProject(id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Check if user is authenticated and is the owner
    const user = await getCurrentUser()
    
    if (project.userId && project.userId !== user?.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this project' }, 
        { status: 401 }
      )
    }
    
    const data = await request.json()
    const updatedProject = await updateProject(id, data)
    
    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from URL path instead of using params
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    
    const project = await getProject(id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    // Check if user is authenticated and is the owner
    const user = await getCurrentUser()
    
    if (project.userId && project.userId !== user?.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this project' }, 
        { status: 401 }
      )
    }
    
    const success = await deleteProject(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete project' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' }, 
      { status: 500 }
    )
  }
}