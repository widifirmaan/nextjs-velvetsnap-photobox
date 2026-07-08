// File: src/lib/utils/api-utils.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';

export function apiError(error: unknown, status = 500) {
  return NextResponse.json(
    { success: false, error: error instanceof Error ? error.message : String(error) },
    { status }
  );
}
