import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies.js";
import { getUserClient, getServiceClient, getQuotesServiceClient } from "../_lib/supabaseServer.js";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "responded", "closed"]).optional(),
  admin_notes: z.string().max(2000).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return res.status(401).json({ error: "Not authenticated." });

    const userClient = getUserClient(token);
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) return res.status(401).json({ error: "Not authenticated." });

    const adminCheckClient = getServiceClient();
    const { data: adminRow, error: adminCheckError } = await adminCheckClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (adminCheckError) throw adminCheckError;
    if (!adminRow) return res.status(403).json({ error: "Not authorized." });

    const quotes = getQuotesServiceClient();

    if (req.method === "GET") {
      const { data, error } = await quotes.from("quotes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return res.status(200).json({ quotes: data });
    }

    if (req.method === "PATCH") {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid request." });
      const { id, ...updates } = parsed.data;
      if (Object.keys(updates).length === 0) return res.status(400).json({ error: "Nothing to update." });

      const { error } = await quotes.from("quotes").update(updates).eq("id", id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    return sendServerError(res, err, "api/admin/quotes");
  }
}