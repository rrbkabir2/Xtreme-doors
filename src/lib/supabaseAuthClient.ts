import { createClient } from "@supabase/supabase-js";

// Used ONLY for two flows that Supabase requires to happen in the
// browser: the Google OAuth redirect handshake, and reading a password
// recovery token from the URL. Both are configured with
// persistSession: false, so nothing from these flows is ever written to
// localStorage — the resulting tokens are immediately handed to our own
// backend (/api/admin/oauth-session or the reset-password flow), which
// verifies them independently and issues our real httpOnly cookie
// session. This client is never used for regular admin data requests.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseBrowserAuthClient =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: true },
      })
    : null;
