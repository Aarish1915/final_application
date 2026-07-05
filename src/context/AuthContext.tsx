import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./authTypes";
import type { AuthUser } from "./authTypes";

const API = import.meta.env.VITE_API_URL || "";

// Cookie helpers — shared across subdomains via domain=.ingri.world
function getCookieDomain(): string {
  const hostname = window.location.hostname;
  // For production: .ingri.world (shared across shop.ingri.world, ingri.world, etc.)
  if (hostname.endsWith("ingri.world")) return ".ingri.world";
  // For localhost / dev — don't set domain (use default)
  return "";
}

function setAuthCookie(token: string) {
  const domain = getCookieDomain();
  const domainStr = domain ? `; domain=${domain}` : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `ingri_token=${encodeURIComponent(token)}; path=/${domainStr}${secure}; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
}

function getAuthCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)ingri_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function removeAuthCookie() {
  const domain = getCookieDomain();
  const domainStr = domain ? `; domain=${domain}` : "";
  document.cookie = `ingri_token=; path=/${domainStr}; max-age=0`;
  // Also clear from localStorage (migration cleanup)
  localStorage.removeItem("ingri_token");
}

// Migrate token from localStorage to cookie (one-time)
function migrateTokenToCookie() {
  const lsToken = localStorage.getItem("ingri_token");
  if (lsToken && !getAuthCookie()) {
    setAuthCookie(lsToken);
  }
  if (lsToken) {
    localStorage.removeItem("ingri_token");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    migrateTokenToCookie();
    return getAuthCookie();
  });
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Expired");
        return r.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        removeAuthCookie();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setAuthCookie(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setAuthCookie(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    removeAuthCookie();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
