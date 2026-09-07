import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { setAuthCookies } from "../_lib/cookies.js";
import { getUserClient, getServiceClient } from "../_lib/supabaseServer.js";

const schema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive().optional(),
});

// Called after the browser completes the Google OAuth redirect flow with
// Supabase. Supabase's client-side SDK hands the frontend an access +
// refresh token pair for the Google-authenticated user, but that alone
// is NOT enough to grant access here — this endpoint independently
// re-verifies the token and checks admin_users, exactly like password
// login does, before ever setting our own session cookies. Signing in
// with Google only proves who you are; it says nothing about whether
// you're allowed into this admin panel.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid session." });
    const { accessToken, refreshToken, expiresIn } = parsed.data;

    // Verify the access token is genuinely valid by asking Supabase who
    // it belongs to — never trust a token's claims without this check.
    const userClient = getUserClient(accessToken);
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return res.status(401).json({ error: "Could not verify Google sign-in." });
    }

    const service = getServiceClient();
    const { data: adminRow, error: adminCheckError } = await service
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (adminCheckError) throw adminCheckError;

    if (!adminRow) {
      // Deliberately do NOT set any cookies here — a non-admin Google
      // account gets nothing, regardless of how "verified" Google says
      // they are.
      return res.status(403).json({ error: "This account is not authorized for admin access." });
    }

    setAuthCookies(res, accessToken, refreshToken, expiresIn || 3600);
    return res.status(200).json({ ok: true, email: userData.user.email });
  } catch (err) {
    return sendServerError(res, err, "api/admin/oauth-session");
  }
}
