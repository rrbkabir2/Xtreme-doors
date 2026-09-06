import type { VercelRequest } from "@vercel/node";
import { getServiceClient } from "./supabaseServer";

/**
 * Simple fixed-window rate limiter backed by the `rate_limits` table.
 * Good enough for this site's traffic — avoids needing a separate
 * Redis/Upstash account just for this.
 *
 * Returns true if the request is allowed, false if the limit was hit.
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const supabase = getServiceClient();
  const now = new Date();

  const { data } = await supabase.from("rate_limits").select("*").eq("key", key).maybeSingle();

  if (!data) {
    await supabase.from("rate_limits").insert({ key, count: 1, window_start: now.toISOString() });
    return true;
  }

  const windowStart = new Date(data.window_start as string);
  const elapsedSeconds = (now.getTime() - windowStart.getTime()) / 1000;

  if (elapsedSeconds > windowSeconds) {
    await supabase.from("rate_limits").update({ count: 1, window_start: now.toISOString() }).eq("key", key);
    return true;
  }

  if ((data.count as number) >= limit) {
    return false;
  }

  await supabase.from("rate_limits").update({ count: (data.count as number) + 1 }).eq("key", key);
  return true;
}

export function getClientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return fwd[0];
  return req.socket?.remoteAddress || "unknown";
}
