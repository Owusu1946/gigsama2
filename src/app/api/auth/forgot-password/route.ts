import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH] Password reset functionality has been disabled');
    
    // Return a message indicating the feature is disabled
    return NextResponse.json({
      success: false,
      message: 'Password reset functionality is currently disabled.'
    }, { status: 501 });
    
  } catch (error) {
    console.error('[AUTH] Error in forgot-password route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 