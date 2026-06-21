import { STORAGE_KEYS } from './constants';

export function adminFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN) : null;
  const headers = new Headers(opts.headers);
  if (token) headers.set('Authorization', 'Bearer ' + token);
  return fetch(url, { ...opts, headers });
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_IS_ROOT);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_USERNAME);
  localStorage.removeItem(STORAGE_KEYS.ACCOUNT);
}
