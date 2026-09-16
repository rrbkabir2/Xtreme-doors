import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Used ONLY for two flows that Supabase requires to happen in the
// browser: the Google OAuth redirect handshake, and reading a password
// recovery token from the URL. Both are configured with
// persistSession: false, so nothing from these flows is ever written to
// localStorage — the resulting tokens are immediately handed to our own
// backend, which verifies them independently and issues our real
// httpOnly cookie session. This client is never used for regular admin
// data requests.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// detectSessionInUrl makes a client read and consume auth tokens out of
// the current URL as soon as it's created. That must happen exactly
// ONCE per page load: if two clients both do it on the same URL, they
// each consume the same one-time tokens, Supabase's "detect and revoke
// compromised refresh tokens" protection sees the same refresh token
// used twice, and it revokes the whole session as a suspected replay
// attack — which surfaces as 403 "session not found" on every
// subsequent request, immediately after an apparently-successful login.
function createAuthClient(detectSessionInUrl: boolean): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl },
  });
}

// Lazily created on first use, NOT at module load. Previously this was
// a top-level const, which meant merely importing anything from this
// file (as the OAuth callback page does) silently spun up a second
// URL-consuming client alongside the callback's own — the exact double
// -consumption described above. Creating it on demand keeps it out of
// the OAuth callback entirely.
let sharedAuthClient: SupabaseClient | null | undefined;

export function getSharedAuthClient(): SupabaseClient | null {
  if (sharedAuthClient === undefined) {
    sharedAuthClient = createAuthClient(true);
  }
  return sharedAuthClient;
}

// Used by the Google login button, which only kicks off the redirect —
// it never needs to read tokens back out of the URL, so it explicitly
// opts out of that to guarantee it can't race the callback page.
export function getRedirectAuthClient(): SupabaseClient | null {
  return createAuthClient(false);
}

// Used by the OAuth callback page. This is the ONE client that should
// read the tokens Google put in the URL. A fresh instance is created
// per attempt rather than reused, because Supabase's client keeps
// internal auth-flow locks that can get stuck if the same instance runs
// a full sign-in → sign-out cycle then signs in again in the same tab,
// leaving the Google button spinning until a manual reload.
export function getSupabaseAuthClient(): SupabaseClient | null {
  return createAuthClient(true);
}