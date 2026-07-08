// File: src/middleware.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Rewrite /v{n}/download/* to /download/* for any theme version
  const match = pathname.match(/^\/(v\d+)\/download\/(.+)/);
  if (match) {
    const url = new URL(`/download/${match[2]}${search}`, request.url);
    url.searchParams.set('theme', match[1]);
    return NextResponse.rewrite(url);
  }

  if (pathname !== '/' || search) {
    return NextResponse.next();
  }

  try {
    const apiUrl = new URL('/api/settings', request.url);
    const res = await fetch(apiUrl.toString(), { cache: 'no-store' });
    const data = await res.json();
    const uiTheme: string = data.data?.uiTheme || 'v1';
    const theme = /^v\d+$/.test(uiTheme) ? uiTheme : 'v1';
    return NextResponse.rewrite(new URL(`/${theme}`, request.url));
  } catch {
    return NextResponse.rewrite(new URL('/v1', request.url));
  }
}

export const config = {
  matcher: ['/', '/:theme(v\\d+)/download/:path*'],
};
