import { NextRequest, NextResponse } from 'next/server';
import { getProject, addMessage, updateSchema } from '@/lib/db';
import { getChatResponse, generateSchema, isSchemaGenerationRequest } from '@/lib/ai';

// POST /api/chat/[projectId] - Send a message and get AI response
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Properly handle route parameters to fix warnings
    const { projectId } = params;
    const { message } = await request.json();
    
    // Get the project
    const project = await getProject(projectId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Add user message to the project
    const updatedProject = await addMessage(projectId, {
      content: message,
      isUser: true
    });
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
    }
    
    // Check if this is an explicit schema generation request
    const shouldGenerateSchema = isSchemaGenerationRequest(message);
    
    // Check if this is a request to update an existing schema
    const shouldUpdateSchema = project.schema && (
      isSchemaGenerationRequest(message) || 
      (message.toLowerCase().includes('update') && message.toLowerCase().includes('schema')) ||
      (message.toLowerCase().includes('change') && message.toLowerCase().includes('schema')) ||
      (message.toLowerCase().includes('modify') && message.toLowerCase().includes('schema'))
    );
    
    // If user explicitly requested schema generation, do it before getting the chat response
    let schema = updatedProject.schema;
    if (shouldGenerateSchema || shouldUpdateSchema) {
      try {
        console.log('Generating schema based on explicit user request...');
        schema = await generateSchema(updatedProject.messages);
        await updateSchema(projectId, schema);
        console.log('Schema generated successfully');
      } catch (error) {
        console.error('Error generating schema:', error);
        // Continue without a schema if generation fails
      }

    }
    
    // Get AI response
    const aiResponse = await getChatResponse(updatedProject.messages);
    
    // Add AI response to the project
    const finalProject = await addMessage(projectId, {
      content: aiResponse,
      isUser: false
    });
    
    if (!finalProject) {
      return NextResponse.json({ error: 'Failed to add AI response' }, { status: 500 });
    }
    
    // Return the response and updated schema
    return NextResponse.json({
      response: aiResponse,
      schema: schema
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

// GET /api/chat/[projectId] - Get chat history for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    // Await params to fix Next.js warning about sync access to dynamic route params
    const { projectId } = params;
    
    // Get the project
    const project = await getProject(projectId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      messages: project.messages
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
} 
