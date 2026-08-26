/**
 * Fixed-window rate limiter for the public write endpoints.
 *
 * Registration and contact are unauthenticated POST endpoints that write to
 * the database, so without a limit a single script can flood the tables and
 * burn through the Supabase quota.
 *
 * State lives in process memory. On a single long-running server that is a
 * real limit; on serverless it is per-instance, so it raises the cost of
 * abuse without being an absolute cap. It is the last cheap line of defence,
 * not the only one — the unique index on registrations is what actually
 * prevents duplicate signups.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Bounds memory if a flood arrives from many distinct addresses.
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
  const expired: string[] = [];
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) expired.push(key);
  });
  expired.forEach((key) => buckets.delete(key));
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets — sent back as Retry-After. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: limit - existing.count, retryAfter };
}

/**
 * Best-effort client address.
 *
 * These headers are trivially spoofable when the app is exposed directly, so
 * this is only trustworthy behind a proxy that overwrites them (Vercel,
 * Cloudflare, nginx with `proxy_set_header`). Treat the result as a
 * throttling hint, never as identity or an access-control decision.
 */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
