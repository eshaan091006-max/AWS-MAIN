import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

// Authentication is handled by middleware.ts for the whole /api/admin/* tree.

// These rows carry student names, emails and UIDs. They must never sit in a
// shared cache, so every response here is no-store — the /api/:path* header
// rule already sets it, and this repeats it on the CSV response which sets its
// own headers.
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const CSV_COLUMNS = [
  "fullName",
  "uid",
  "email",
  "academicYear",
  "stream",
  "college",
  "registeredAt",
  "attended",
  "attendedAt",
  "attendedBy",
];

/**
 * The attendance list for an event.
 *
 * `?eventId=` filters to one event; omit it for every registration.
 * `?format=csv` returns a downloadable attendance sheet.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId") || undefined;
    const format = searchParams.get("format");

    const rows = await db.listRegistrations(eventId);

    if (format === "csv") {
      const csv = toCsv(
        rows.map((r) => ({ ...r, attended: r.attended ? "yes" : "no" })),
        CSV_COLUMNS
      );
      const stamp = new Date().toISOString().slice(0, 10);
      const name = eventId ? `attendance-${eventId}-${stamp}.csv` : `registrations-${stamp}.csv`;

      return new NextResponse(csv, {
        headers: {
          ...NO_STORE,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${name}"`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: rows,
        summary: {
          total: rows.length,
          present: rows.filter((r) => r.attended).length,
        },
      },
      { headers: NO_STORE }
    );
  } catch (error: any) {
    console.error("[api/admin/registrations] GET failed:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to load registrations." },
      { status: 500 }
    );
  }
}

/** Marks one registration present or absent. Body: { id, attended }. */
export async function PATCH(req: Request) {
  try {
    // Set by middleware from the signed session — not from the request body,
    // so the browser cannot attribute an attendance mark to someone else.
    const markedBy = (await headers()).get("x-admin-user") || "unknown";

    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Registration id is required." }, { status: 400 });
    }
    if (typeof body.attended !== "boolean") {
      return NextResponse.json({ error: "attended must be true or false." }, { status: 400 });
    }

    const updated = await db.setAttendance(id, body.attended, markedBy);
    if (!updated) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { headers: NO_STORE });
  } catch (error: any) {
    console.error("[api/admin/registrations] PATCH failed:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to update attendance." },
      { status: 500 }
    );
  }
}
