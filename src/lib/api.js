import { Platform } from 'react-native';

// The deployed website calls its own origin. Phones and local previews need the full server address.
const BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');

let token = null;
export const setToken = value => { token = value; };

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, timeoutMs } = {}) {
  if (!BASE && Platform.OS !== 'web') throw new ApiError('EXPO_PUBLIC_API_URL is not set.', 'no_server', 0);
  const ctrl = new AbortController();
  const timer = timeoutMs ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : null),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server.', 'network', 0);
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error?.message || `Server error ${res.status}`, data?.error?.code || 'server_error', res.status);
  return data;
}

// One room, or every room when none is given. Returns null if no server address is configured.
export function chatSocket(room) {
  if (!BASE && Platform.OS !== 'web') return null;
  const origin = BASE || window.location.origin;
  const query = room ? `?room=${encodeURIComponent(room)}` : '';
  return new WebSocket(`${origin.replace(/^http/, 'ws')}/api/ws${query}`);
}
