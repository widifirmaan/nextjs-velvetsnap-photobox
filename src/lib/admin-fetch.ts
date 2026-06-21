import { STORAGE_KEYS } from './constants';

export function adminFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN) : null;
  const headers = new Headers(opts.headers);
  if (token) headers.set('Authorization', 'Bearer ' + token);
  return fetch(url, { ...opts, headers });
}
