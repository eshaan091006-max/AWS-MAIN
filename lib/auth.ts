import { timingSafeEqual } from "crypto";

/**
 * Shared-secret guard for admin-only API routes.
 *
 * These routes read submitted contact messages and mutate event data, so they
 * must never be reachable from the open internet. There is no user/session
 * system on this site, so they are gated on a single server-side secret sent
 * as `Authorization: Bearer <token>` or `x-admin-token: <token>`.
 *
 * Fails closed: if ADMIN_API_TOKEN is unset, admin routes are disabled
 * entirely rather than left open. A deployment that forgets to set the
 * variable loses the admin API — it does not silently publish it.
 */

const MIN_TOKEN_LENGTH = 24;

export type AuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  // timingSafeEqual throws on length mismatch, which would itself leak length.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function extractToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const direct = req.headers.get("x-admin-token");
  return direct?.trim() || null;
}

export function requireAdmin(req: Request): AuthResult {
  const expected = (process.env.ADMIN_API_TOKEN || "").trim();

  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "Admin API is disabled. Set ADMIN_API_TOKEN to enable it.",
    };
  }

  if (expected.length < MIN_TOKEN_LENGTH) {
    console.error(
      `[auth] ADMIN_API_TOKEN is too short (${expected.length} chars); refusing to accept it. Use at least ${MIN_TOKEN_LENGTH}.`
    );
    return {
      ok: false,
      status: 503,
      error: "Admin API is misconfigured.",
    };
  }

  const provided = extractToken(req);
  if (!provided || !safeEqual(provided, expected)) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }

  return { ok: true };
}
