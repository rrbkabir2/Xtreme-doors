import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies";
import { getUserClient } from "../_lib/supabaseServer";

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

    // This client carries the caller's own access token, so Postgres
    // Row Level Security decides what they can see/change — not this
    // function. Even a bug here can't expose more than RLS allows.
    const supabase = getUserClient(token);

    if (req.method === "GET") {
      const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
      if (error) return res.status(403).json({ error: "Not authorized." });
      return res.status(200).json({ quotes: data });
    }

    if (req.method === "PATCH") {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid request." });
      const { id, ...updates } = parsed.data;
      if (Object.keys(updates).length === 0) return res.status(400).json({ error: "Nothing to update." });

      const { error } = await supabase.from("quotes").update(updates).eq("id", id);
      if (error) return res.status(403).json({ error: "Not authorized." });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    return sendServerError(res, err, "api/admin/quotes");
  }
}
