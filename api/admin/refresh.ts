import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthClient } from "../_lib/supabaseServer.js";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "../_lib/cookies.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const refreshToken = readCookie(req, REFRESH_COOKIE);
    if (!refreshToken) return res.status(401).json({ error: "No session." });

    const authClient = getAuthClient();
    const { data, error } = await authClient.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      clearAuthCookies(res);
      return res.status(401).json({ error: "Session expired." });
    }

    setAuthCookies(res, data.session.access_token, data.session.refresh_token, data.session.expires_in || 3600);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return sendServerError(res, err, "api/admin/refresh");
  }
}
