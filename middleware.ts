import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, readSessionToken } from "@/lib/adminSession";

// One gate in front of everything admin. Individual route handlers below this
// therefore do not repeat the check — if a request reaches them, it is signed in.
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

// The login screen and the endpoint that issues the cookie must stay reachable
// while signed out, or there is no way in.
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const secret = (process.env.ADMIN_SESSION_SECRET || "").trim();
  const token = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
  const username = await readSessionToken(secret, token);

  if (username) {
    // Pass the identity down so handlers can attribute actions without
    // re-parsing the cookie. Requests cannot set this themselves — Next
    // rebuilds the header set here, and the value is derived from a signature
    // the client cannot forge.
    const headers = new Headers(req.headers);
    headers.set("x-admin-user", username);
    return NextResponse.next({ request: { headers } });
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}
