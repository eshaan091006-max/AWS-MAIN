import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "sxc_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // one working day

const MIN_SECRET_LENGTH = 32;
const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;

/**
 * Usernames exclude `.` deliberately: the session token is dot-delimited, and
 * a dotted username would make `user.name.123.<sig>` ambiguous to parse.
 */
export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Issues `<username>.<expiresAt>.<hmac>`.
 *
 * The username is inside the signed payload, so the server learns who is acting
 * straight from the cookie — no extra lookup — and neither the name nor the
 * expiry can be edited without invalidating the signature.
 */
export function createSessionToken(secret: string, username: string, expiresAt: number): string {
  const payload = `${username}.${expiresAt}`;
  return `${payload}.${sign(secret, payload)}`;
}

/**
 * Returns the username carried by a valid token, or null.
 *
 * Null covers every failure — bad signature, expired, malformed, missing
 * secret — because the caller's only correct response to any of them is
 * identical: treat the request as unauthenticated.
 */
export function readSessionToken(secret: string, token: string, now = Date.now()): string | null {
  if (!secret || secret.length < MIN_SECRET_LENGTH || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [username, expiry, provided] = parts;
  if (!isValidUsername(username)) return null;
  if (!/^\d+$/.test(expiry)) return null;

  const expected = sign(secret, `${username}.${expiry}`);
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  if (Number(expiry) <= now) return null;

  return username;
}

/** Without a strong session secret the admin area stays shut, never open. */
export function adminAuthConfigured(): boolean {
  return (process.env.ADMIN_SESSION_SECRET || "").trim().length >= MIN_SECRET_LENGTH;
}
