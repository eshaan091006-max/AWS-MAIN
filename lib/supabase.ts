import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only on purpose. These are NOT prefixed NEXT_PUBLIC_: nothing in the
// browser talks to Supabase directly, and that prefix would silently inline
// both values into the client bundle the moment any client component imported
// this module — no error, no warning, just a credential in the page source.
const legacyUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const legacyAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const supabaseUrl = (process.env.SUPABASE_URL || legacyUrl).trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || legacyAnonKey).trim();

if (legacyUrl || legacyAnonKey) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are deprecated. " +
      "Rename them to SUPABASE_URL / SUPABASE_ANON_KEY so they cannot reach the browser bundle."
  );
}
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

// The placeholders shipped in .env.example must not read as configured,
// or the app will try to talk to a host that does not exist.
const PLACEHOLDER = /your-project|your-supabase|your-anon|your-service|<.*>/i;

function isRealValue(value: string) {
  return Boolean(value) && !PLACEHOLDER.test(value);
}

export const isSupabaseConfigured =
  isRealValue(supabaseUrl) &&
  isRealValue(supabaseAnonKey) &&
  /^https:\/\/.+\.supabase\.(co|in)$/.test(supabaseUrl);

// True only when a service role key is present. That key bypasses RLS,
// so it is read on the server only and must never reach the browser.
export const hasServiceRole = isRealValue(supabaseServiceKey);

// Public client — anon key. Insert-only against the registration and
// contact tables, per the RLS policies in supabase/schema.sql.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

// Server-side elevated client. Returns null rather than silently handing
// back an anon client, so callers can tell "no read access" apart from
// "read returned nothing".
export function getServiceSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured || !hasServiceRole) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Client used for public writes on the server: service role when it is
// available (bypasses RLS, better error messages), anon otherwise.
export function getWriteSupabase(): SupabaseClient | null {
  return getServiceSupabase() ?? supabase;
}

// One-line explanation of why writes are not hitting the database, for
// startup logs and API responses in development.
export function supabaseStatus(): string {
  if (isSupabaseConfigured) return "connected";
  if (!supabaseUrl) return "SUPABASE_URL is not set";
  if (!supabaseAnonKey) return "SUPABASE_ANON_KEY is not set";
  return "Supabase URL/key still hold placeholder values from .env.example";
}
