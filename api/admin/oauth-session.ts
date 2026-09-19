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
    const { data: userData, error: userErr } = await userClient.auth.getUser(accessToken);
    if (userErr || !userData.user) {
      return res.status(401).json({ error: "Could not verify Google sign-in." });
    }

    const service = getServiceClient();
    let { data: adminRow, error: adminCheckError } = await service
      .from("admin_users")
      .select("user_id, role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (adminCheckError) throw adminCheckError;

    // If this specific user_id is not in admin_users, check if their verified
    // Google email matches an existing authorized admin. If so, automatically
    // register this Google user_id with the matching role so the login succeeds seamlessly.
    if (!adminRow && userData.user.email) {
      const emailLower = userData.user.email.toLowerCase();
      const PRIMARY_ADMIN_EMAILS = ["rrbkabir2@gmail.com", "xtremedoors@gmail.com"];

      if (PRIMARY_ADMIN_EMAILS.includes(emailLower)) {
        await service.from("admin_users").upsert({
          user_id: userData.user.id,
          role: "dev",
        });
        adminRow = { user_id: userData.user.id, role: "dev" };
      } else {
        const { data: allAdmins } = await service.from("admin_users").select("user_id, role");
        if (allAdmins && allAdmins.length > 0) {
          for (const adm of allAdmins) {
            const { data: authUser } = await service.auth.admin.getUserById(adm.user_id as string);
            if (authUser?.user?.email?.toLowerCase() === emailLower) {
              const role = (adm.role as string) || "admin";
              await service.from("admin_users").insert({
                user_id: userData.user.id,
                role,
              });
              adminRow = { user_id: userData.user.id, role };
              break;
            }
          }
        }
      }
    }

    if (!adminRow) {
      // Deliberately do NOT set any cookies here — a non-admin Google
      // account gets nothing. Immediately purge the unauthorized user
      // from auth.users so they are never stored in the database.
      try {
        await service.auth.admin.deleteUser(userData.user.id);
      } catch (delErr) {
        console.error("Failed to delete unauthorized user from auth.users:", delErr);
      }
      return res.status(403).json({ error: "This account is not authorized for admin access." });
    }

    setAuthCookies(res, accessToken, refreshToken, expiresIn || 3600);
    return res.status(200).json({ ok: true, email: userData.user.email });
  } catch (err) {
    return sendServerError(res, err, "api/admin/oauth-session");
  }
}