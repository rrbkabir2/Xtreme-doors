import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { randomUUID } from "crypto";
import { applySecurityHeaders, sendServerError } from "../_lib/security.js";
import { readCookie, ACCESS_COOKIE } from "../_lib/cookies.js";
import { getUserClient, getServiceClient } from "../_lib/supabaseServer.js";

// Vercel's default body parser has a size ceiling that already helps,
// but we double-check the decoded size ourselves below too.
export const config = {
  api: { bodyParser: { sizeLimit: "7mb" } },
};

const uploadSchema = z.object({
  fileBase64: z.string().min(1),
});

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// We identify the real file type from its first bytes ("magic
// numbers"), never from the client-supplied filename or MIME type —
// both of those are trivial for a client to fake.
function detectImageType(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mime: "image/png", ext: "png" };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.slice(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    const token = readCookie(req, ACCESS_COOKIE);
    if (!token) return res.status(401).json({ error: "Not authenticated." });

    const userClient = getUserClient(token);
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return res.status(401).json({ error: "Not authenticated." });

    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid upload." });

    const buffer = Buffer.from(parsed.data.fileBase64, "base64");
    if (buffer.length === 0) return res.status(400).json({ error: "Empty file." });
    if (buffer.length > MAX_BYTES) return res.status(400).json({ error: "File too large (max 5MB)." });

    const detected = detectImageType(buffer);
    if (!detected) return res.status(400).json({ error: "Only PNG, JPEG, or WEBP images are allowed." });

    // Re-confirm admin membership with the privileged client right
    // before writing — belt-and-braces on top of RLS/auth checks above.
    const service = getServiceClient();
    const { data: adminRow } = await service
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (!adminRow) return res.status(403).json({ error: "Not authorized." });

    // Random, unguessable filename — never derived from user input, so
    // there's no path-traversal or overwrite risk from a crafted name.
    const path = `products/${randomUUID()}.${detected.ext}`;
    const { error: uploadError } = await service.storage.from("product-images").upload(path, buffer, {
      contentType: detected.mime,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    return res.status(200).json({ path });
  } catch (err) {
    return sendServerError(res, err, "api/admin/upload");
  }
}
