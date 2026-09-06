import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Never leak which exact var or why to a client — this only ever
    // throws server-side, and the caller turns it into a generic 500.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Full-privilege client that BYPASSES Row Level Security entirely.
 * Only use this after you've already performed your own authorization
 * check in code (e.g. verified the caller's session + admin_users
 * membership), or for operations that are safe by definition (like
 * the public quote insert, which is fully validated before this is
 * ever called).
 */
export function getServiceClient(): SupabaseClient {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Client scoped to one signed-in user's access token. Row Level
 * Security applies normally here, based on that user's auth.uid() —
 * this is the client every admin-facing endpoint should prefer,
 * since the database itself enforces who can see/change what.
 */
export function getUserClient(accessToken: string): SupabaseClient {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_PUBLISHABLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

/** Plain client for calling Supabase Auth itself (sign in / refresh). */
export function getAuthClient(): SupabaseClient {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_PUBLISHABLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
