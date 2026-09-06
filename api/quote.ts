import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getServiceClient } from "./_lib/supabaseServer";
import { applySecurityHeaders, sendServerError } from "./_lib/security";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit";

// Mirrors the client-side schema in src/pages/GetQuote.tsx — but this
// is the copy that actually matters, since client-side validation can
// always be bypassed (e.g. by calling this endpoint directly).
const quoteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .min(10)
    .max(15)
    .regex(/^[0-9+\-\s()]+$/),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  productType: z.string().trim().min(1).max(200),
  quantity: z.string().trim().max(50).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const ip = getClientIp(req);
    const allowed = await checkRateLimit(`quote:${ip}`, 5, 15 * 60); // 5 submissions / 15 min / IP
    if (!allowed) {
      return res.status(429).json({ error: "Too many requests. Please try again in a while." });
    }

    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Please check your details and try again." });
    }
    const v = parsed.data;

    const supabase = getServiceClient();
    const { error } = await supabase.from("quotes").insert({
      name: v.name,
      phone: v.phone,
      email: v.email || null,
      city: v.city || null,
      product_type: v.productType,
      quantity: v.quantity || null,
      message: v.message || null,
    });

    if (error) throw error;

    // Email notification hook: wire a provider (e.g. Resend) here when
    // ready. Kept as a no-op for now so a missing email config never
    // blocks a real customer's quote from being saved.

    return res.status(200).json({ ok: true });
  } catch (err) {
    return sendServerError(res, err, "api/quote");
  }
}
