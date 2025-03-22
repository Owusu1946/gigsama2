import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse, generateSchema, isSchemaGenerationRequest } from '@/lib/ai';

// POST /api/chat/guest - Handle guest mode chat (doesn't save to database)
export async function POST(request: NextRequest) {
  try {
    const { message, messages = [] } = await request.json();
    
    // Add the user message to the conversation history
    const updatedMessages = [
      ...messages,
      {
        content: message,
        isUser: true,
        timestamp: Date.now()
      }
    ];
    
    // Check if this is an explicit schema generation request
    const shouldGenerateSchema = isSchemaGenerationRequest(message);
    
    // Initialize schema variable
    let schema = null;
    
    // If user explicitly requested schema generation, generate it
    if (shouldGenerateSchema) {
      try {
        console.log('[GUEST] Generating schema based on explicit user request...');
        schema = await generateSchema(updatedMessages);
        console.log('[GUEST] Schema generated successfully');
      } catch (error) {
        console.error('[GUEST] Error generating schema:', error);
        // Continue without a schema if generation fails
      }
    }
    
    // Get AI response
    const aiResponse = await getChatResponse(updatedMessages);
    
    // Add AI response to the messages
    const finalMessages = [
      ...updatedMessages,
      {
        content: aiResponse,
        isUser: false,
        timestamp: Date.now()
      }
    ];
    
    // Return the response, updated messages, and schema
    return NextResponse.json({
      response: aiResponse,
      messages: finalMessages,
      schema: schema
    });
  } catch (error) {
    console.error('[GUEST] Error processing chat message:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
} 