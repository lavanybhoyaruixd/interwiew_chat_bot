import { fetchJson, tokenStorage } from './http.js';
import { API_BASE } from './base.js';

export async function login(email, password) {
  const data = await fetchJson(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: { email, password }
  });

  if (!data?.success) {
    throw new Error(data?.message || 'Login failed');
  }

  tokenStorage.set(data.token);
  return data;
}

export function getStoredToken() {
  return tokenStorage.get();
}

export function logout() {
  tokenStorage.clear();
}