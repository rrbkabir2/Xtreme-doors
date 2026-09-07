import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DoorClosed, Loader2, ArrowLeft } from "lucide-react";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "If that email has admin access, a reset link has been sent.");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-sm shadow-elegant">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <DoorClosed className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>We'll email you a reset link if this account has admin access</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <p className="text-sm text-center text-muted-foreground">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send reset link
              </Button>
            </form>
          )}
          <Link
            to="/admin/login"
            className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3 h-3" /> Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminForgotPassword;
