import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Deliberately scoped to just the admin panel: this toggles a "dark"
// class on a wrapper div around the admin routes only, not on
// <html>/<body> — so switching the admin dashboard to dark mode never
// changes how the public marketing site looks for customers.
//
// This is a UI preference, not a security-relevant value, so
// localStorage is fine here (unlike session tokens).

type Theme = "light" | "dark";
const STORAGE_KEY = "xd-admin-theme";

interface AdminThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeState | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dark" : ""}>{children}</div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme must be used inside AdminThemeProvider");
  return ctx;
}
