import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getAuthClient, getServiceClient } from "../_lib/supabaseServer";
import { applySecurityHeaders, sendServerError } from "../_lib/security";
import { setAuthCookies } from "../_lib/cookies";
import { checkRateLimit, getClientIp } from "../_lib/rateLimit";

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(200),
});

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    // IP-level throttle in addition to the per-account lockout below —
    // stops an attacker from spraying many different email guesses.
    const ip = getClientIp(req);
    const ipAllowed = await checkRateLimit(`login-ip:${ip}`, 10, 15 * 60);
    if (!ipAllowed) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid email or password." });
    const { email, password } = parsed.data;
    const identifier = email.toLowerCase();

    const admin = getServiceClient();
    const now = new Date();

    const { data: attemptRow } = await admin
      .from("login_attempts")
      .select("*")
      .eq("identifier", identifier)
      .maybeSingle();

    if (attemptRow?.locked_until && new Date(attemptRow.locked_until as string) > now) {
      return res.status(429).json({ error: "Too many failed attempts. Please try again later." });
    }

    const authClient = getAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      const nextAttempts = ((attemptRow?.attempts as number) || 0) + 1;
      const lockedUntil =
        nextAttempts >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000).toISOString() : null;

      await admin.from("login_attempts").upsert({
        identifier,
        attempts: nextAttempts,
        locked_until: lockedUntil,
        updated_at: now.toISOString(),
      });

      // Deliberately generic — never reveal whether the email exists.
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Signed in successfully against Supabase Auth — but that alone
    // doesn't make them an admin. Confirm membership explicitly.
    const { data: adminRow } = await admin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!adminRow) {
      await authClient.auth.signOut();
      return res.status(403).json({ error: "This account is not authorized for admin access." });
    }

    // Success — clear any prior failed attempts, set the session cookies.
    await admin.from("login_attempts").delete().eq("identifier", identifier);

    const accessMaxAge = data.session.expires_in || 3600;
    setAuthCookies(res, data.session.access_token, data.session.refresh_token, accessMaxAge);

    return res.status(200).json({ ok: true, email: data.user.email });
  } catch (err) {
    return sendServerError(res, err, "api/admin/login");
  }
}
