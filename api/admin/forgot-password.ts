import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { getAuthClient, getServiceClient } from "../_lib/supabaseServer.js";
import { checkRateLimit, getClientIp } from "../_lib/rateLimit.js";

const schema = z.object({
  email: z.string().trim().email().max(255),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const ip = getClientIp(req);
    const allowed = await checkRateLimit(`forgot-password:${ip}`, 3, 60 * 60); // 3/hour/IP
    if (!allowed) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Enter a valid email." });
    const email = parsed.data.email.toLowerCase();

    // Always respond the same way whether or not the email belongs to an
    // admin — this avoids letting someone probe which emails have admin
    // access just by watching for a different response.
    const genericResponse = () =>
      res.status(200).json({
        ok: true,
        message: "If that email has admin access, a reset link has been sent.",
      });

    const service = getServiceClient();
    const { data: users } = await service.auth.admin.listUsers();
    const matchedUser = users?.users.find((u) => u.email?.toLowerCase() === email);
    if (!matchedUser) return genericResponse();

    const { data: adminRow } = await service
      .from("admin_users")
      .select("user_id")
      .eq("user_id", matchedUser.id)
      .maybeSingle();
    if (!adminRow) return genericResponse();

    const authClient = getAuthClient();
    const redirectTo = `${process.env.PUBLIC_SITE_ORIGIN || ""}/admin/reset-password`;
    await authClient.auth.resetPasswordForEmail(email, { redirectTo });

    return genericResponse();
  } catch (err) {
    return sendServerError(res, err, "api/admin/forgot-password");
  }
}
