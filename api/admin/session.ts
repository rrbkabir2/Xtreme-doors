import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthClient, getUserClient, getServiceClient } from "../_lib/supabaseServer.js";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, setAuthCookies, clearAuthCookies, ACCESS_COOKIE, REFRESH_COOKIE } from "../_lib/cookies.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const token = readCookie(req, ACCESS_COOKIE);
      if (!token) return res.status(401).json({ authenticated: false });

      const userClient = getUserClient(token);
      const { data, error } = await userClient.auth.getUser(token);
      if (error || !data.user) return res.status(401).json({ authenticated: false });

      const admin = getServiceClient();
      const { data: adminRow } = await admin.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
      if (!adminRow) return res.status(401).json({ authenticated: false });

      return res.status(200).json({ authenticated: true, email: data.user.email });
    }

    if (req.method === "POST") {
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
    }

    if (req.method === "DELETE") {
      clearAuthCookies(res);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    return sendServerError(res, err, "api/admin/session");
  }
}