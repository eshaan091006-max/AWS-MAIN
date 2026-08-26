import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Public events listing.
 *
 * Read-only. Creating, editing and deleting events moved to
 * /api/admin/events, which sits behind the admin session — this route used to
 * accept POST and DELETE from anyone holding a shared token.
 */
export async function GET() {
  try {
    const events = await db.listEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error("[api/events] GET failed:", error?.message);
    return NextResponse.json({ error: "Failed to load events." }, { status: 500 });
  }
}
