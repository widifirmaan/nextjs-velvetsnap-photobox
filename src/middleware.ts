import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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
  matcher: '/',
};
