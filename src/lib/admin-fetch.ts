export function adminFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_session_token') : null;
  const headers = new Headers(opts.headers);
  if (token) headers.set('Authorization', 'Bearer ' + token);
  return fetch(url, { ...opts, headers });
}
