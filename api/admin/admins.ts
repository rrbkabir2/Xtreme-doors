// FILE: api/admin/admins.ts
// ACTION: Replace the ENTIRE file with this (roles feature + the getUser(token) fix merged together)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies.js";
import { getUserClient, getServiceClient } from "../_lib/supabaseServer.js";

const roleSchema = z.enum(["owner", "dev", "admin"]);

const createSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
  role: roleSchema.default("admin"),
});

function canManageAdmins(role: string): boolean {
  return role === "owner" || role === "dev";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return res.status(401).json({ error: "Not authenticated." });

    const userClient = getUserClient(token);
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) return res.status(401).json({ error: "Not authenticated." });

    const service = getServiceClient();
    const { data: callerRow, error: callerCheckError } = await service
      .from("admin_users")
      .select("user_id, role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (callerCheckError) throw callerCheckError;
    if (!callerRow) return res.status(403).json({ error: "Not authorized." });
    const callerRole = callerRow.role as string;

    if (req.method === "GET") {
      const { data: admins, error: adminsError } = await service
        .from("admin_users")
        .select("user_id, created_at, role");
      if (adminsError) throw adminsError;

      const results = await Promise.all(
        (admins || []).map(async (row) => {
          const { data: authUser } = await service.auth.admin.getUserById(row.user_id as string);
          return {
            user_id: row.user_id,
            created_at: row.created_at,
            role: row.role,
            email: authUser?.user?.email || "(unknown)",
          };
        })
      );

      return res.status(200).json({
        admins: results,
        currentUserId: userData.user.id,
        currentUserRole: callerRole,
      });
    }

    if (req.method === "POST") {
      if (!canManageAdmins(callerRole)) {
        return res.status(403).json({ error: "Only Owners and Devs can add admins." });
      }

      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid admin data." });
      }
      const { email, password, role } = parsed.data;

      const { data: created, error: createError } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) {
        return res.status(400).json({ error: "Could not create that account. The email may already be in use." });
      }

      const { error: linkError } = await service
        .from("admin_users")
        .insert({ user_id: created.user.id, role });
      if (linkError) {
        await service.auth.admin.deleteUser(created.user.id);
        throw linkError;
      }

      return res.status(200).json({ ok: true, email });
    }

    if (req.method === "DELETE") {
      if (!canManageAdmins(callerRole)) {
        return res.status(403).json({ error: "Only Owners and Devs can remove admins." });
      }

      const idResult = z.string().uuid().safeParse(req.query.id);
      if (!idResult.success) return res.status(400).json({ error: "Missing admin id." });

      if (idResult.data === userData.user.id) {
        return res.status(400).json({ error: "You can't remove your own admin access." });
      }

      const { data: targetRow, error: targetError } = await service
        .from("admin_users")
        .select("role")
        .eq("user_id", idResult.data)
        .maybeSingle();
      if (targetError) throw targetError;

      if (targetRow?.role === "owner") {
        const { count, error: countError } = await service
          .from("admin_users")
          .select("user_id", { count: "exact", head: true })
          .eq("role", "owner");
        if (countError) throw countError;
        if ((count ?? 0) <= 1) {
          return res.status(400).json({ error: "Can't remove the last remaining Owner." });
        }
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