/**
 * "Not set up yet" arrives under two code families. Postgres raises 42P01/42883
 * when SQL runs against a missing table or function, but a request through the
 * REST API usually fails earlier, in PostgREST's schema cache, which uses its
 * own PGRST2xx codes. Both mean the same thing: supabase/schema.sql has not
 * been run against this project.
 */
export const SCHEMA_MISSING_CODES = [
  "42P01", // undefined_table
  "42703", // undefined_column — the table exists but predates a newer column
  "42883", // undefined_function
  "PGRST205", // table not found in schema cache
  "PGRST202", // function not found in schema cache
];

/** Unique constraint violation. */
export const UNIQUE_VIOLATION = "23505";

/** Raised by register_for_event() in supabase/schema.sql. */
export const EVENT_FULL = "SXC01";
export const NO_CAPACITY = "SXC02";
