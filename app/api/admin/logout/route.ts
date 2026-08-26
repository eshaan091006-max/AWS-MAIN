import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true });
  // maxAge 0 expires it immediately; the same attributes must be repeated or
  // some browsers keep the original cookie.
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
