import type { VercelRequest, VercelResponse } from "@vercel/node";

// Set PUBLIC_SITE_ORIGIN in Vercel env vars to your real deployed
// origin, e.g. "https://xtreme-doors.vercel.app" (no trailing slash).
// Requests from any other origin are not granted CORS access — the
// browser will block the response from being read.
const ALLOWED_ORIGINS = (process.env.PUBLIC_SITE_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function applySecurityHeaders(req: VercelRequest, res: VercelResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store");

  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/** Generic error response — never leak stack traces or internals. */
export function sendServerError(res: VercelResponse, loggedError: unknown, context: string) {
  console.error(`[${context}]`, loggedError);
  return res.status(500).json({ error: "Something went wrong. Please try again shortly." });
}
