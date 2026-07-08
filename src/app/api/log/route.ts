// File: src/app/api/log/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { level = 'info', message, data } = await request.json();
    const timestamp = new Date().toISOString();
    const prefix = `[AI-Remove-BG] [${timestamp}] [${level.toUpperCase()}]`;
    if (data) {
      console.log(prefix, message, JSON.stringify(data));
    } else {
      console.log(prefix, message);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('/api/log error:', e);
    return NextResponse.json({ success: false });
  }
}
