import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Auth is handled by middleware.ts for the whole /api/admin/* tree.

export async function GET() {
  try {
    const data = await db.getMessages();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("[api/admin/messages] GET failed:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to load messages." },
      { status: 500 }
    );
  }
}

/** Marks a message read or unread. */
export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Message id is required." }, { status: 400 });
    if (typeof body.isRead !== "boolean") {
      return NextResponse.json({ error: "isRead must be true or false." }, { status: 400 });
    }

    const ok = await db.setMessageRead(id, body.isRead);
    if (!ok) return NextResponse.json({ error: "Message not found." }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/admin/messages] PATCH failed:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to update the message." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Message id is required." }, { status: 400 });

    const removed = await db.deleteMessage(id);
    if (!removed) return NextResponse.json({ error: "Message not found." }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/admin/messages] DELETE failed:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to delete the message." },
      { status: 500 }
    );
  }
}
