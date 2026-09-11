import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getQuotesServiceClient } from "./_lib/supabaseServer.js";
import { applySecurityHeaders, sendServerError } from "./_lib/security.js";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";

const BUSINESS_LIKE_TYPES = ["business", "dealer", "contractor", "architect", "builder"] as const;

const quoteSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    mobileNumber: z
      .string()
      .trim()
      .min(10)
      .max(15)
      .regex(/^[0-9+\-\s()]+$/)
      .optional()
      .or(z.literal("")),
    email: z.string().trim().email().max(255).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    customerType: z.enum(["individual", "business", "dealer", "contractor", "architect", "builder", "other"]),
    companyName: z.string().trim().max(200).optional().or(z.literal("")),
    businessRole: z.string().trim().max(100).optional().or(z.literal("")),
    requirementFor: z.enum([
      "residential", "apartment", "villa", "office", "retail", "hotel",
      "hospital", "school", "industrial", "commercial", "other",
    ]),
    projectType: z
      .enum(["new_construction", "renovation", "replacement", "interior", "maintenance", "other"])
      .optional(),
    projectSiteName: z.string().trim().max(200).optional().or(z.literal("")),
    siteLocation: z.string().trim().max(300).optional().or(z.literal("")),
    productType: z.string().trim().max(200).optional().or(z.literal("")),
    quantity: z.string().trim().max(50).optional().or(z.literal("")),
    additionalDetails: z.string().trim().max(1000).optional().or(z.literal("")),
    purchaseTimeline: z
      .enum(["immediate", "1_week", "1_month", "1_3_months", "3_6_months", "6_plus_months", "researching"])
      .optional(),
    preferredContactMethod: z.enum(["phone", "whatsapp", "email", "other"]).optional(),
    leadSource: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((v) => (v.mobileNumber && v.mobileNumber.length > 0) || (v.email && v.email.length > 0), {
    message: "Provide a mobile number or an email address.",
    path: ["mobileNumber"],
  })
  .refine(
    (v) => {
      if (!(BUSINESS_LIKE_TYPES as readonly string[]).includes(v.customerType)) return true;
      return !!v.companyName && v.companyName.length > 0 && !!v.businessRole && v.businessRole.length > 0;
    },
    { message: "Company name and role are required for this customer type.", path: ["companyName"] }
  );

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const ip = getClientIp(req);
    const allowed = await checkRateLimit(`quote:${ip}`, 5, 15 * 60);
    if (!allowed) {
      return res.status(429).json({ error: "Too many requests. Please try again in a while." });
    }

    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Please check your details and try again." });
    }
    const v = parsed.data;
    const isBusinessLike = (BUSINESS_LIKE_TYPES as readonly string[]).includes(v.customerType);

    const supabase = getQuotesServiceClient();
    const { error } = await supabase.from("quotes").insert({
      full_name: v.fullName,
      mobile_number: v.mobileNumber || null,
      email: v.email || null,
      city: v.city || null,
      customer_type: v.customerType,
      company_name: isBusinessLike ? v.companyName || null : null,
      business_role: isBusinessLike ? v.businessRole || null : null,
      requirement_for: v.requirementFor,
      project_type: v.projectType || null,
      project_site_name: v.projectSiteName || null,
      site_location: v.projectSiteName ? v.siteLocation || null : null,
      product_type: v.productType || null,
      quantity: v.quantity || null,
      additional_details: v.additionalDetails || null,
      purchase_timeline: v.purchaseTimeline || null,
      preferred_contact_method: v.preferredContactMethod || null,
      lead_source: v.leadSource || null,
    });

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (err) {
    return sendServerError(res, err, "api/quote");
  }
}