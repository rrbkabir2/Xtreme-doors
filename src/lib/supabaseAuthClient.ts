// FILE: src/lib/supabaseAuthClient.ts
// ACTION: Replace the ENTIRE file with this

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

function createAuthClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: true },
  });
}

// Kept for AdminResetPassword.tsx, which uses this single shared
// instance — the password-reset flow only ever runs once per page
// load, so it isn't affected by the stuck-after-reuse issue below.
export const supabaseBrowserAuthClient = createAuthClient();

// Used by the Google login button and its callback page instead of the
// shared instance above. A fresh client is created on every call rather
// than reused, because Supabase's client keeps internal auth-flow
// state (locks used to prevent concurrent auth calls) that can get
// stuck if the same instance runs a full sign-in → sign-out cycle and
// then tries to sign in again in the same tab — leading to the Google
// button spinning forever until a manual page reload. Creating a new
// client per attempt sidesteps that entirely.
export function getSupabaseAuthClient(): SupabaseClient | null {
  return createAuthClient();
}