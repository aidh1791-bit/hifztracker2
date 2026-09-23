import { auth } from '../lib/firebase';

/**
 * Centrally manages authenticated communication with the backend API.
 * Ensures every request obtains a fresh, cryptographically valid Firebase ID token
 * via `auth.currentUser.getIdToken()` rather than reading a static/stale token from localStorage.
 */
export async function getFreshToken(forceRefresh = false): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  } catch (err) {
    console.warn('[ApiClient] Failed to acquire fresh Firebase ID token:', err);
    return null;
  }
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getFreshToken();
  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(input, {
    ...init,
    headers
  });

  // If response is 401 Unauthorized and we had a token, force-refresh once to handle mid-session expiration
  if (response.status === 401 && token) {
    const refreshedToken = await getFreshToken(true);
    if (refreshedToken && refreshedToken !== token) {
      headers.set('Authorization', `Bearer ${refreshedToken}`);
      response = await fetch(input, {
        ...init,
        headers
      });
    }
  }

  return response;
}

export const apiClient = {
  getFreshToken,
  fetch: authenticatedFetch,

  async get<T = any>(endpoint: string): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
    try {
      const res = await authenticatedFetch(endpoint, { method: 'GET' });
      if (!res.ok) {
        return { ok: false, status: res.status, error: `HTTP ${res.status}: ${res.statusText}` };
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (err: any) {
      return { ok: false, status: 0, error: err.message || 'Network request failed' };
    }
  },

  async post<T = any>(endpoint: string, body?: any): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
    try {
      const res = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
      if (!res.ok) {
        return { ok: false, status: res.status, error: `HTTP ${res.status}: ${res.statusText}` };
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (err: any) {
      return { ok: false, status: 0, error: err.message || 'Network request failed' };
    }
  },

  async delete<T = any>(endpoint: string): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
    try {
      const res = await authenticatedFetch(endpoint, { method: 'DELETE' });
      if (!res.ok) {
        return { ok: false, status: res.status, error: `HTTP ${res.status}: ${res.statusText}` };
      }
      const data = await res.json();
      return { ok: true, status: res.status, data };
    } catch (err: any) {
      return { ok: false, status: 0, error: err.message || 'Network request failed' };
    }
  }
};
