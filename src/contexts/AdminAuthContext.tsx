// FILE: src/contexts/AdminAuthContext.tsx
// ACTION: Replace the ENTIRE file with this (fixes the concurrent-refresh race causing "Not authenticated")

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// This context never stores the session token itself — it only holds
// UI state (are we logged in, what's the admin's email). The actual
// access/refresh tokens live in httpOnly cookies set by the server,
// which JS on this page can't read even if it wanted to. Every admin
// data request relies on the browser sending those cookies automatically
// (credentials: "include"), not on anything stored here.

interface AdminAuthState {
  loading: boolean;
  authenticated: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithOAuthTokens: (accessToken: string, refreshToken: string, expiresIn?: number) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/admin/session", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAuthenticated(true);
        setEmail(data.email);
      } else {
        setAuthenticated(false);
        setEmail(null);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (loginEmail: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthenticated(true);
        setEmail(data.email || loginEmail);
        return { ok: true };
      }
      return { ok: false, error: data.error || "Login failed." };
    } catch {
      return { ok: false, error: "Could not reach the server. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
    } finally {
      setAuthenticated(false);
      setEmail(null);
    }
  };

  const loginWithOAuthTokens = async (accessToken: string, refreshToken: string, expiresIn?: number) => {
    try {
      const res = await fetch("/api/admin/oauth-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessToken, refreshToken, expiresIn }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthenticated(true);
        setEmail(data.email || null);
        return { ok: true };
      }
      return { ok: false, error: data.error || "Google sign-in failed." };
    } catch {
      return { ok: false, error: "Could not reach the server. Please try again." };
    }
  };

  return (
    <AdminAuthContext.Provider value={{ loading, authenticated, email, login, loginWithOAuthTokens, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}

// Concurrent 401s (e.g. two admin panel requests firing around the same
// time) used to each independently call /api/admin/session to refresh —
// but Supabase refresh tokens are single-use, so the second concurrent
// refresh would find the first one had already consumed/rotated the
// token, fail with its own 401, and cascade into "Not authenticated"
// even right after a fresh login. This shared promise ensures only ONE
// refresh actually happens no matter how many requests hit 401 at once;
// everyone else just waits on the same result.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSessionOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/admin/session", { method: "POST", credentials: "include" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const first = await fetch(input, { ...init, credentials: "include" });
  if (first.status !== 401) return first;

  const refreshedOk = await refreshSessionOnce();
  if (!refreshedOk) return first;

  return fetch(input, { ...init, credentials: "include" });
}