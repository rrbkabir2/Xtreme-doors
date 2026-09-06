import type { VercelRequest, VercelResponse } from "@vercel/node";

// Admin session tokens live ONLY in httpOnly cookies — never in
// localStorage/sessionStorage, so client-side JS (including any
// injected via an XSS bug) cannot read them.
export const ACCESS_COOKIE = "xd_admin_at";
export const REFRESH_COOKIE = "xd_admin_rt";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setAuthCookies(
  res: VercelResponse,
  accessToken: string,
  refreshToken: string,
  accessMaxAgeSec: number
) {
  const common = "HttpOnly; Secure; SameSite=Strict; Path=/";
  res.setHeader("Set-Cookie", [
    `${ACCESS_COOKIE}=${accessToken}; ${common}; Max-Age=${accessMaxAgeSec}`,
    `${REFRESH_COOKIE}=${refreshToken}; ${common}; Max-Age=${REFRESH_MAX_AGE}`,
  ]);
}

export function clearAuthCookies(res: VercelResponse) {
  const common = "HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
  res.setHeader("Set-Cookie", [`${ACCESS_COOKIE}=; ${common}`, `${REFRESH_COOKIE}=; ${common}`]);
}

export function readCookie(req: VercelRequest, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const parts = header.split(";").map((c) => c.trim());
  const match = parts.find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
