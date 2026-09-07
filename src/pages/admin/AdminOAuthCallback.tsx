import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabaseBrowserAuthClient } from "@/lib/supabaseAuthClient";
import { Loader2 } from "lucide-react";

const AdminOAuthCallback = () => {
  const { loginWithOAuthTokens } = useAdminAuth();
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!supabaseBrowserAuthClient) {
        setStatus("error");
        setError("Google sign-in isn't configured.");
        return;
      }

      // detectSessionInUrl (set on this client) parses the tokens Google
      // + Supabase left in the URL fragment after the redirect.
      const { data, error: sessionError } = await supabaseBrowserAuthClient.auth.getSession();

      if (sessionError || !data.session) {
        setStatus("error");
        setError("Google sign-in failed or was cancelled.");
        return;
      }

      const { access_token, refresh_token, expires_in } = data.session;

      // Immediately hand off to our backend for independent verification
      // + admin check, then discard this client-side session entirely —
      // it's never used again after this point.
      const result = await loginWithOAuthTokens(access_token, refresh_token, expires_in);
      await supabaseBrowserAuthClient.auth.signOut();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="text-center space-y-4 max-w-sm">
        {status === "working" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Finishing sign-in…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-destructive font-medium">{error}</p>
            <a href="/admin/login" className="text-accent hover:underline text-sm">
              Back to login
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOAuthCallback;
