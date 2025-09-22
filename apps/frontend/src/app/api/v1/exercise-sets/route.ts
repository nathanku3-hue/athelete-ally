import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Exercise sets endpoint - coming soon',
    data: [] 
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Exercise sets creation - coming soon',
    data: null 
  });
}
