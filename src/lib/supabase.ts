import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key. Never import this
 * from a client component — it bypasses RLS by design so all writes to
 * `reservations` / `contact_messages` go through our API routes instead of
 * directly from the browser.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example)."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
