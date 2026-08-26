import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Who is signed in. Middleware has already validated the session. */
export async function GET() {
  const username = (await headers()).get("x-admin-user");
  if (!username) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = getServiceSupabase();
  if (!admin) {
    return NextResponse.json({ user: { username, displayName: username } });
  }

  const { data } = await admin
    .from("admin_users")
    .select("username, display_name")
    .eq("username", username)
    .maybeSingle();

  return NextResponse.json({
    user: { username, displayName: data?.display_name ?? username },
  });
}
