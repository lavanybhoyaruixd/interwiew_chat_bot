export function getApiBase() {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : '';
  if (envUrl) return envUrl.replace(/\/$/, '') + '/api';
  // Try common local ports
  return 'http://localhost:5001/api';
}

export const API_BASE = getApiBase();