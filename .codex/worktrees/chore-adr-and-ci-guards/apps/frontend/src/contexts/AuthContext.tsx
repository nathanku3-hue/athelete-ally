"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthValue = {
  token: string | null;
  setToken: (t: string | null) => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);
const STORAGE_KEY = 'token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (t) setTokenState(t);
  }, []);

  function setToken(t: string | null) {
    setTokenState(t);
    if (typeof window === 'undefined') return;
    if (t) localStorage.setItem(STORAGE_KEY, t);
    else localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({ token, setToken, isAuthenticated: !!token }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}