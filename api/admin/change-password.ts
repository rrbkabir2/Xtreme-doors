import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies.js";
import { getUserClient, getServiceClient, getAuthClient } from "../_lib/supabaseServer.js";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return res.status(401).json({ error: "Not authenticated." });

    const userClient = getUserClient(token);
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user || !userData.user.email) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }
    const { currentPassword, newPassword } = parsed.data;

    // Require the current password even though a valid session cookie is
    // already present — this stops someone who steals an active session
    // (e.g. an unlocked browser) from locking the real admin out by
    // silently changing the password.
    const authClient = getAuthClient();
    const { error: verifyError } = await authClient.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });
    if (verifyError) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const service = getServiceClient();
    const { error: updateError } = await service.auth.admin.updateUserById(userData.user.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    return res.status(200).json({ ok: true });
  } catch (err) {
    return sendServerError(res, err, "api/admin/change-password");
  }
}