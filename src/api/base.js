export function getApiBase() {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE))
    ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)
    : '';
  if (envUrl) return envUrl.replace(/\/$/, '');
  // Try common local ports
  return 'http://localhost:5001';
}

export const API_BASE = getApiBase();
