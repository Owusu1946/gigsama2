import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder route - in a real application, you would:
// 1. Check the token in your database to see if it exists and is not expired
// 2. Return appropriate status codes based on validity

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH] Password reset functionality has been disabled');
    
    // Return a message indicating the feature is disabled
    return NextResponse.json({
      success: false,
      message: 'Password reset functionality is currently disabled.'
    }, { status: 501 });
    
  } catch (error) {
    console.error('[AUTH] Error in verify-reset-token route:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 