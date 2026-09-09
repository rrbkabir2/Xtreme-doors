import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies.js";
import { getUserClient, getServiceClient } from "../_lib/supabaseServer.js";

const createSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return res.status(401).json({ error: "Not authenticated." });

    // Confirm the caller is a real, currently-authenticated admin before
    // doing anything privileged. RLS on admin_users also enforces this
    // independently for the GET below, but the create/delete actions use
    // the Auth Admin API (service role), which sits outside Postgres RLS
    // entirely — so this explicit check is the only thing protecting it.
    const userClient = getUserClient(token);
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) return res.status(401).json({ error: "Not authenticated." });

    const service = getServiceClient();
    const { data: callerAdminRow, error: callerCheckError } = await service
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (callerCheckError) throw callerCheckError;
    if (!callerAdminRow) return res.status(403).json({ error: "Not authorized." });

    if (req.method === "GET") {
      const { data: admins, error: adminsError } = await service
        .from("admin_users")
        .select("user_id, created_at");
      if (adminsError) throw adminsError;

      // Look up emails via the Auth Admin API since admin_users only
      // stores the UID — join happens in code, not SQL, since auth.users
      // isn't reachable through the regular query client.
      const results = await Promise.all(
        (admins || []).map(async (row) => {
          const { data: authUser } = await service.auth.admin.getUserById(row.user_id as string);
          return {
            user_id: row.user_id,
            created_at: row.created_at,
            email: authUser?.user?.email || "(unknown)",
          };
        })
      );

      return res.status(200).json({ admins: results, currentUserId: userData.user.id });
    }

    if (req.method === "POST") {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Enter a valid email and a password of at least 8 characters." });
      }
      const { email, password } = parsed.data;

      const { data: created, error: createError } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) {
        // Common case: email already registered — surface a clear,
        // non-leaky message without echoing Supabase's raw error text.
        return res.status(400).json({ error: "Could not create that account. The email may already be in use." });
      }

      const { error: linkError } = await service.from("admin_users").insert({ user_id: created.user.id });
      if (linkError) {
        // Roll back the auth account if linking fails, so we never end up
        // with an orphaned login that isn't actually an admin.
        await service.auth.admin.deleteUser(created.user.id);
        throw linkError;
      }

      return res.status(200).json({ ok: true, email });
    }

    if (req.method === "DELETE") {
      const idResult = z.string().uuid().safeParse(req.query.id);
      if (!idResult.success) return res.status(400).json({ error: "Missing admin id." });

      if (idResult.data === userData.user.id) {
        return res.status(400).json({ error: "You can't remove your own admin access." });
      }

      const { error: deleteLinkError } = await service.from("admin_users").delete().eq("user_id", idResult.data);
      if (deleteLinkError) throw deleteLinkError;

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    return sendServerError(res, err, "api/admin/admins");
  }
}