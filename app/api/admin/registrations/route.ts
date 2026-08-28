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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

/**
 * Walk-in registration, taken at the door.
 *
 * Goes through the same register_for_event() path as the public form, so the
 * seat limit and the duplicate rule are enforced identically — an officer
 * typing someone in should not be able to overbook an event by accident.
 *
 * "Already registered" is not an error here. At a door the common case is that
 * the person pre-registered and simply arrived; the useful response is to mark
 * them present, not to refuse. So a duplicate falls through to marking
 * attendance on the existing row and reports which of the two happened.
 */
export async function POST(req: Request) {
  try {
    const markedBy = (await headers()).get("x-admin-user") || "unknown";
    const body = await req.json().catch(() => ({}));

    const eventId = String(body.eventId ?? "").trim();
    const firstName = String(body.firstName ?? "").trim();
    const surname = String(body.surname ?? "").trim();
    const uid = String(body.uid ?? "").trim();
    const email = String(body.email ?? "").trim();
    const academicYear = String(body.academicYear ?? "").trim();
    const stream = String(body.stream ?? "").trim();
    const allowOverCapacity = body.allowOverCapacity === true;

    if (!eventId) return NextResponse.json({ error: "Pick an event first." }, { status: 400 });
    if (!firstName) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!uid) return NextResponse.json({ error: "UID is required." }, { status: 400 });

    let alreadyRegistered = false;

    try {
      await db.registerForEvent(eventId, {
        name: firstName,
        surname,
        uid,
        email,
        academicYear,
        stream,
        college: "St. Xavier's College",
      });
    } catch (err: any) {
      const message = err?.message ?? "";
      if (/already registered/i.test(message)) {
        alreadyRegistered = true;
      } else if (/fully booked/i.test(message) && allowOverCapacity) {
        // The officer ticked the override: admit them past the limit.
        //
        // register_for_event() checks capacity before it checks duplicates, so
        // on a full event someone who ALREADY registered online also arrives
        // here reported as "fully booked". Their insert then trips the unique
        // index, which is not a failure — it is the ordinary case of a
        // pre-registered person turning up. Treat it as such.
        try {
          await db.forceRegister(eventId, {
            name: firstName,
            surname,
            uid,
            email,
            academicYear,
            stream,
            college: "St. Xavier's College",
          });
        } catch (forceErr: any) {
          if (/already registered/i.test(forceErr?.message ?? "")) {
            alreadyRegistered = true;
          } else {
            throw forceErr;
          }
        }
      } else if (/fully booked/i.test(message)) {
        return NextResponse.json(
          { error: message, canOverride: true },
          { status: 409 }
        );
      } else {
        const status = /closed/i.test(message) ? 409 : 500;
        return NextResponse.json({ error: message }, { status });
      }
    }

    // Find the row — freshly created, or the pre-existing one — and mark it
    // present, since the whole point is that this person is standing here.
    const rows = await db.listRegistrations(eventId);
    const row = rows.find((r) => r.email.toLowerCase() === email.toLowerCase());
    if (!row) {
      return NextResponse.json(
        { error: "Registered, but the record could not be read back to mark attendance." },
        { status: 500 }
      );
    }

    const updated = row.attended ? row : await db.setAttendance(row.id, true, markedBy);

    return NextResponse.json(
      {
        success: true,
        alreadyRegistered,
        data: updated ?? row,
      },
      { status: alreadyRegistered ? 200 : 201, headers: NO_STORE }
    );
  } catch (error: any) {
    console.error("[api/admin/registrations] POST failed:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to register." },
      { status: 500 }
    );
  }
}
