import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceClient } from "./_lib/supabaseServer.js";
import { applySecurityHeaders, sendServerError } from "./_lib/security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select("id,title,description,features,specifications,image_path,icon_name,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res.status(200).json({ products: data });
  } catch (err) {
    return sendServerError(res, err, "api/products");
  }
}
