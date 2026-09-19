import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { getSupabaseAuthClient } from "@/lib/supabaseAuthClient";
import UnauthorizedNotice from "./UnauthorizedNotice";
import { Loader2 } from "lucide-react";

const AdminOAuthCallback = () => {
  const { loginWithOAuthTokens } = useAdminAuth();
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const client = getSupabaseAuthClient();
      if (!client) {
        setStatus("error");
        setError("Google sign-in isn't configured.");
        return;
      }

      // Check URL search and hash for explicit OAuth errors returned by Google/Supabase
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const oauthErrorDesc =
        searchParams.get("error_description") ||
        hashParams.get("error_description") ||
        searchParams.get("error") ||
        hashParams.get("error");

      if (oauthErrorDesc) {
        window.history.replaceState(null, "", window.location.pathname);
        setStatus("error");
        setError(oauthErrorDesc);
        return;
      }

      let session = null;
      const code = searchParams.get("code");

      // Handle PKCE authorization code exchange
      if (code) {
        try {
          const { data: codeData, error: codeError } = await client.auth.exchangeCodeForSession(code);
          if (!codeError && codeData?.session) {
            session = codeData.session;
          } else if (codeError) {
            console.error("exchangeCodeForSession failed:", codeError);
          }
        } catch (e) {
          console.error("Code exchange exception:", e);
        }
      }

      // Fallback for implicit grant flow (tokens in URL hash)
      if (!session) {
        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (!sessionError && sessionData?.session) {
          session = sessionData.session;
        }
      }

      window.history.replaceState(null, "", window.location.pathname);

      if (!session) {
        setStatus("error");
        setError("Google sign-in failed or was cancelled.");
        return;
      }

      const result = await loginWithOAuthTokens(access_token, refresh_token, expires_in);
      
      // Clear any temporary client-side tokens from localStorage WITHOUT calling
      // client.auth.signOut() (which calls Supabase API to revoke the session / refresh token!)
      try {
        if (typeof window !== "undefined") {
          for (let i = window.localStorage.length - 1; i >= 0; i--) {
            const k = window.localStorage.key(i);
            if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
              window.localStorage.removeItem(k);
            }
          }
        }
      } catch {
        // ignore
      }

      if (result.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setError(result.error || "This account is not authorized for admin access.");
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "done") {
    return <Navigate to="/admin" replace />;
  }

  if (status === "error") {
    return <UnauthorizedNotice message={error || undefined} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="text-center space-y-4 max-w-sm">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">Finishing sign-in…</p>
      </div>
    </div>
  );
};

export default AdminOAuthCallback;