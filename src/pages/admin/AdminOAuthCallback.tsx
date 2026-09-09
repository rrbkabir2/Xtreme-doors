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

      const { data, error: sessionError } = await client.auth.getSession();

      window.history.replaceState(null, "", window.location.pathname);

      if (sessionError || !data.session) {
        setStatus("error");
        setError("Google sign-in failed or was cancelled.");
        return;
      }

      const { access_token, refresh_token, expires_in } = data.session;

      const result = await loginWithOAuthTokens(access_token, refresh_token, expires_in);
      // scope: "local" only clears this SDK instance's own in-memory state
      // (there's nothing in localStorage anyway, since persistSession is
      // false). The default scope ("global") would instead call Supabase's
      // server and revoke the session outright — which is the exact
      // session whose tokens we just handed to our backend and stored in
      // our own httpOnly cookies above. That revocation is what was
      // causing every admin request to immediately come back
      // "Not authenticated" right after a Google sign-in.
      await client.auth.signOut({ scope: "local" });

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