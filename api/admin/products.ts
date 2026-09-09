import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies.js";
import { getUserClient } from "../_lib/supabaseServer.js";

const specSchema = z.object({
  label: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(300),
});

const productSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(2).max(2000),
  features: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
  specifications: z.array(specSchema).max(30).default([]),
  image_path: z.string().max(500).nullable().optional(),
  icon_name: z.enum(["Layers", "ShieldCheck", "Ruler", "Wand2", "DoorOpen"]).default("Layers"),
  sort_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

function handleDbError(res: VercelResponse, error: { code?: string; message?: string }, context: string) {
  console.error(`[${context}]`, error);
  if (error.code === "42501" || error.code === "PGRST301") {
    return res.status(403).json({ error: "Not authorized." });
  }
  return res.status(500).json({ error: error.message || "Something went wrong. Please try again shortly." });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return res.status(401).json({ error: "Not authenticated." });
    const supabase = getUserClient(token);

    if (req.method === "GET") {
      const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
      if (error) return handleDbError(res, error, "api/admin/products GET");
      return res.status(200).json({ products: data });
    }

    if (req.method === "POST") {
      const parsed = productSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid product data." });
      }
      const { data, error } = await supabase.from("products").insert(parsed.data).select().single();
      if (error) return handleDbError(res, error, "api/admin/products POST");
      return res.status(200).json({ product: data });
    }

    if (req.method === "PUT") {
      const idResult = z.string().uuid().safeParse(req.query.id);
      if (!idResult.success) return res.status(400).json({ error: "Missing product id." });
      const parsed = productSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid product data." });
      }

      const { error } = await supabase
        .from("products")
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq("id", idResult.data);
      if (error) return handleDbError(res, error, "api/admin/products PUT");
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const idResult = z.string().uuid().safeParse(req.query.id);
      if (!idResult.success) return res.status(400).json({ error: "Missing product id." });

      const { error } = await supabase.from("products").delete().eq("id", idResult.data);
      if (error) return handleDbError(res, error, "api/admin/products DELETE");
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    return sendServerError(res, err, "api/admin/products");
  }
}