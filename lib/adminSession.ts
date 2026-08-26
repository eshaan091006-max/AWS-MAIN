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

/**
 * HMAC via Web Crypto rather than Node's `crypto`.
 *
 * This module is imported by middleware.ts, which Next runs on the Edge
 * runtime where the Node `crypto` module does not exist. Web Crypto is present
 * in both Edge and Node 18+, so one implementation serves the middleware, the
 * route handlers, and the tests. The cost is that signing is async.
 */
async function sign(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time comparison of two hex strings.
 *
 * Node's `timingSafeEqual` is also unavailable on Edge. Comparing with `===`
 * would return as soon as two characters differ, leaking through timing how
 * much of a forged signature was correct.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Issues `<username>.<expiresAt>.<hmac>`.
 *
 * The username is inside the signed payload, so the server learns who is acting
 * straight from the cookie — no extra lookup — and neither the name nor the
 * expiry can be edited without invalidating the signature.
 */
export async function createSessionToken(
  secret: string,
  username: string,
  expiresAt: number
): Promise<string> {
  const payload = `${username}.${expiresAt}`;
  return `${payload}.${await sign(secret, payload)}`;
}

/**
 * Returns the username carried by a valid token, or null.
 *
 * Null covers every failure — bad signature, expired, malformed, missing
 * secret — because the caller's only correct response to any of them is
 * identical: treat the request as unauthenticated.
 */
export async function readSessionToken(
  secret: string,
  token: string,
  now = Date.now()
): Promise<string | null> {
  if (!secret || secret.length < MIN_SECRET_LENGTH || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [username, expiry, provided] = parts;
  if (!isValidUsername(username)) return null;
  if (!/^\d+$/.test(expiry)) return null;

  const expected = await sign(secret, `${username}.${expiry}`);
  if (!safeEqual(provided, expected)) return null;

  if (Number(expiry) <= now) return null;

  return username;
}

/** Without a strong session secret the admin area stays shut, never open. */
export function adminAuthConfigured(): boolean {
  return (process.env.ADMIN_SESSION_SECRET || "").trim().length >= MIN_SECRET_LENGTH;
}
