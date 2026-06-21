import { NextResponse } from 'next/server';

export function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : String(error) },
    { status }
  );
}
