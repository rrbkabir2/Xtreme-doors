import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseBrowserAuthClient } from "@/lib/supabaseAuthClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PasswordInput from "./PasswordInput";
import { DoorClosed, Loader2 } from "lucide-react";

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!supabaseBrowserAuthClient) {
        setInvalidLink(true);
        return;
      }
      // The recovery link puts a temporary session in place via the URL
      // fragment (handled by detectSessionInUrl on this client). If it's
      // missing or expired, there's no session to act on.
      const { data } = await supabaseBrowserAuthClient.auth.getSession();
      if (!data.session) {
        setInvalidLink(true);
      } else {
        setReady(true);
      }
    };
    check();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!supabaseBrowserAuthClient) return;

    setSubmitting(true);
    const { error: updateError } = await supabaseBrowserAuthClient.auth.updateUser({ password });
    // Immediately drop this temporary client-side session either way —
    // it's only ever used for this one action.
    await supabaseBrowserAuthClient.auth.signOut();
    setSubmitting(false);

    if (updateError) {
      setError("Could not update the password. The reset link may have expired — request a new one.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/admin/login"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-sm shadow-elegant">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <DoorClosed className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>Xtreme Doors admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {invalidLink && (
            <p className="text-sm text-center text-muted-foreground">
              This reset link is invalid or has expired. Request a new one from the login page.
            </p>
          )}
          {done && <p className="text-sm text-center text-muted-foreground">Password updated — redirecting to login…</p>}
          {ready && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <PasswordInput
                  id="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResetPassword;
