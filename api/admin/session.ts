import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies.js";
import { getUserClient, getServiceClient } from "../_lib/supabaseServer.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });

  try {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return res.status(401).json({ authenticated: false });

    const userClient = getUserClient(token);
    const { data, error } = await userClient.auth.getUser();
    if (error || !data.user) return res.status(401).json({ authenticated: false });

    const admin = getServiceClient();
    const { data: adminRow } = await admin.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (!adminRow) return res.status(401).json({ authenticated: false });

    return res.status(200).json({ authenticated: true, email: data.user.email });
  } catch (err) {
    return sendServerError(res, err, "api/admin/session");
  }
}
