export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed');
  }
  // Store token
  localStorage.setItem('auth_token', data.token);
  return data;
}

export function getStoredToken() {
  return localStorage.getItem('auth_token');
}

export function logout() {
  localStorage.removeItem('auth_token');
}