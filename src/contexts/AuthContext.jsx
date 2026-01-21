import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchJson, tokenStorage } from '../api/http.js';
import { API_BASE } from '../api/base.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasToken = () => Boolean(tokenStorage.get());

  const loadMe = async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const data = await fetchJson(`${API_BASE}/api/auth/me`, { method: 'GET' }, { auth: 'required' });
      setUser(data?.user ?? null);
      return data?.user ?? null;
    } catch (err) {
      // Token invalid/expired or server says unauthenticated
      tokenStorage.clear();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await fetchJson(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: { email, password }
      });

      if (!data?.success || !data?.token) {
        throw new Error(data?.message || 'Login failed');
      }

      tokenStorage.set(data.token);

      // Prefer server response user, but verify /me to normalize shape
      setUser(data.user ?? null);
      await loadMe();

      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await fetchJson(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        body: { name, email, password }
      });

      if (!data?.success || !data?.token) {
        throw new Error(data?.message || 'Registration failed');
      }

      tokenStorage.set(data.token);
      setUser(data.user ?? null);
      await loadMe();

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      token: tokenStorage.get(),
      login,
      register,
      logout,
      reload: loadMe
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
