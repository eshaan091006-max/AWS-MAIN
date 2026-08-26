import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_TTL_MS,
  adminAuthConfigured,
  createSessionToken,
  isValidUsername,
} from "@/lib/adminSession";
import { verifyPassword } from "@/lib/password";
import { getServiceSupabase } from "@/lib/supabase";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { SCHEMA_MISSING_CODES } from "@/lib/dbErrors";

export const dynamic = "force-dynamic";

// Five attempts per fifteen minutes: room for a typo, not for guessing.
const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

// One message for every failure. Saying "no such user" would let anyone
// enumerate which committee accounts exist.
const GENERIC_FAILURE = "Incorrect username or password.";

// Verified against when the username does not exist, so a missing account costs
// the same time as a wrong password and the response cannot be timed apart.
const DUMMY_HASH =
  "scrypt:00000000000000000000000000000000:" + "0".repeat(128);

export async function POST(req: Request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured on this deployment." },
      { status: 503 }
    );
  }

  const limit = rateLimit(`admin-login:${clientKey(req)}`, ATTEMPT_LIMIT, ATTEMPT_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!username || !password || !isValidUsername(username)) {
    // Still burn a hash so a malformed username is not measurably faster.
    await verifyPassword(password, DUMMY_HASH);
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 401 });
  }

  const admin = getServiceSupabase();
  if (!admin) {
    console.error("[admin] login attempted without SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { error: "Admin access is not configured on this deployment." },
      { status: 503 }
    );
  }

  const { data: user, error } = await admin
    .from("admin_users")
    .select("username, password_hash, display_name, is_active")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("[admin] user lookup failed:", error.code, error.message);
    // A missing table is a setup step, not a server fault. Say so plainly —
    // the alternative is someone staring at a generic 500 with no idea that
    // schema.sql has not been run.
    if (SCHEMA_MISSING_CODES.includes(error.code ?? "")) {
      return NextResponse.json(
        {
          error:
            "Admin accounts are not set up yet. Run supabase/schema.sql, then `npm run admin:create -- <username> <password>`.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Sign in is unavailable right now." }, { status: 500 });
  }

  const ok = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

  // An inactive account fails exactly like a wrong password: a revoked officer
  // should not be able to tell that their account still exists.
  if (!ok || !user || !user.is_active) {
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 401 });
  }

  // Best-effort audit stamp; a failure here must not block a valid sign-in.
  const { error: stampError } = await admin
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("username", username);
  if (stampError) console.error("[admin] last_login_at stamp failed:", stampError.message);

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = createSessionToken(
    (process.env.ADMIN_SESSION_SECRET || "").trim(),
    username,
    expiresAt
  );

  const res = NextResponse.json({
    success: true,
    user: { username: user.username, displayName: user.display_name },
  });

  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true, // unreadable from document.cookie, so XSS cannot steal it
    sameSite: "strict", // not sent on cross-site requests, so CSRF cannot use it
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  return res;
}
