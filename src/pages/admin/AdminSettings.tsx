import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch, useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordInput from "./PasswordInput";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { email, logout } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Password updated" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirm("");
      } else {
        setError(data.error || "Could not update password.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotCurrentPassword = async () => {
    if (!email) {
      toast({
        title: "Email unavailable",
        description: "Could not find current admin email.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Send a password reset link to ${email} and log out? You will be able to set a new password from your email and log back in.`
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: "Failed to send reset link",
          description: data.error || "Please try again later.",
          variant: "destructive",
        });
        setResetting(false);
        return;
      }

      toast({
        title: "Reset link sent!",
        description: `Check your inbox at ${email}. Logging you out now…`,
      });

      await logout();
      navigate("/admin/login?reset=sent", { replace: true });
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to server. Please try again.",
        variant: "destructive",
      });
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>You'll need your current password to confirm this change.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="current-password">Current password</Label>
                <button
                  type="button"
                  onClick={handleForgotCurrentPassword}
                  disabled={resetting}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={currentPassword}
                maxLength={200}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                value={newPassword}
                maxLength={200}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                value={confirm}
                maxLength={200}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Forgot current password?
          </CardTitle>
          <CardDescription>
            Can't remember your current password? We can email a secure reset link to{" "}
            <span className="font-semibold text-foreground">{email || "your registered email"}</span>.
            You will be logged out automatically so you can set your new password and sign right back in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={handleForgotCurrentPassword}
            disabled={resetting}
            className="w-full gap-2"
          >
            {resetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4" />}
            {resetting ? "Sending reset email…" : "Send reset email & log out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
