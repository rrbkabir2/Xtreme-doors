import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applySecurityHeaders, sendServerError } from "../_lib/security";
import { clearAuthCookies } from "../_lib/cookies";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    clearAuthCookies(res);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return sendServerError(res, err, "api/admin/logout");
  }
}
