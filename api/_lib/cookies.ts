import type { VercelRequest, VercelResponse } from "@vercel/node";

// Admin session tokens live ONLY in httpOnly cookies — never in
// localStorage/sessionStorage, so client-side JS (including any
// injected via an XSS bug) cannot read them.
export const ACCESS_COOKIE = "xd_admin_at";
export const REFRESH_COOKIE = "xd_admin_rt";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Password-login access tokens are small, but a Google-OAuth access
// token is a JWT that also carries the user's Google profile
// (name, avatar URL, provider identity data) inside it, which can push
// a single cookie value past ~4096 bytes. Browsers silently DROP a
// cookie that's too big rather than truncating it — so the whole
// ACCESS_COOKIE would just never get set, and every request depending
// on it (like the upload endpoint) would look "not authenticated" even
// though login appeared to succeed. Splitting an oversized token across
// several smaller cookies (name.0, name.1, ...) and reassembling them
// on read sidesteps the per-cookie size cap without needing any new
// infrastructure (e.g. a server-side session store).
const CHUNK_SIZE = 3500; // safely under the ~4096 byte per-cookie limit
const MAX_CHUNKS = 4; // supports tokens up to ~14,000 chars — far beyond any real JWT here

function chunkValue(value: string): string[] {
  const parts: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) parts.push(value.slice(i, i + CHUNK_SIZE));
  return parts;
}

// Builds Set-Cookie lines for one logical cookie, always emitting (and
// clearing) every possible chunk slot so a previously-large token being
// replaced by a small one doesn't leave stale chunk cookies behind.
function buildCookieLines(name: string, value: string, common: string, maxAgeSec: number): string[] {
  const lines: string[] = [];

  if (value.length <= CHUNK_SIZE) {
    lines.push(`${name}=${value}; ${common}; Max-Age=${maxAgeSec}`);
    for (let i = 0; i < MAX_CHUNKS; i++) lines.push(`${name}.${i}=; ${common}; Max-Age=0`);
    return lines;
  }

  // Oversized: clear the unchunked slot and write chunk slots instead.
  lines.push(`${name}=; ${common}; Max-Age=0`);
  const parts = chunkValue(value);
  for (let i = 0; i < MAX_CHUNKS; i++) {
    if (i < parts.length) lines.push(`${name}.${i}=${parts[i]}; ${common}; Max-Age=${maxAgeSec}`);
    else lines.push(`${name}.${i}=; ${common}; Max-Age=0`);
  }
  return lines;
}

function clearCookieLines(name: string, common: string): string[] {
  const lines = [`${name}=; ${common}`];
  for (let i = 0; i < MAX_CHUNKS; i++) lines.push(`${name}.${i}=; ${common}`);
  return lines;
}

export function setAuthCookies(
  res: VercelResponse,
  accessToken: string,
  refreshToken: string,
  accessMaxAgeSec: number
) {
  const common = "HttpOnly; Secure; SameSite=Strict; Path=/";
  res.setHeader("Set-Cookie", [
    ...buildCookieLines(ACCESS_COOKIE, accessToken, common, accessMaxAgeSec),
    ...buildCookieLines(REFRESH_COOKIE, refreshToken, common, REFRESH_MAX_AGE),
  ]);
}

export function clearAuthCookies(res: VercelResponse) {
  const common = "HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
  res.setHeader("Set-Cookie", [
    ...clearCookieLines(ACCESS_COOKIE, common),
    ...clearCookieLines(REFRESH_COOKIE, common),
  ]);
}

export function readCookie(req: VercelRequest, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const parts = header.split(";").map((c) => c.trim());

  // Normal case: the value fit in one cookie.
  const exact = parts.find((c) => c.startsWith(name + "="));
  if (exact) {
    const value = exact.slice(name.length + 1);
    return value ? decodeURIComponent(value) : null;
  }

  // Oversized case: reassemble name.0, name.1, ... in order. Stop at the
  // first missing index — chunks are always written contiguously from 0.
  let combined = "";
  let found = false;
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const prefix = `${name}.${i}=`;
    const match = parts.find((c) => c.startsWith(prefix));
    if (!match) break;
    found = true;
    combined += match.slice(prefix.length);
  }
  return found && combined ? decodeURIComponent(combined) : null;
}