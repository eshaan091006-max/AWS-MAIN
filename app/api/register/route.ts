import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { clientKey, rateLimit } from "@/lib/rateLimit";

// Registrations are database writes — never serve a cached response.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 80,
  email: 254, // RFC 5321 maximum
  uid: 40,
  academicYear: 40,
  stream: 60,
};

// 8 attempts per 10 minutes from one address — comfortably above a student
// registering a few people, well below a script filling the table.
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") };
}

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`register:${clientKey(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();
    const eventId = String(body.eventId ?? "").trim();

    // The modal sends firstName/surname separately and `name` as the combined
    // display name. Fall back to splitting `name` for any other caller, so
    // first and last land in the right columns either way.
    const fallback = splitName(String(body.name ?? ""));
    const first = String(body.firstName ?? fallback.first).trim();
    const last = String(body.surname ?? fallback.last).trim();
    const email = String(body.email ?? "").trim();
    const uid = String(body.uid ?? "").trim();
    const academicYear = String(body.academicYear ?? "").trim();
    const stream = String(body.stream ?? "").trim();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }
    if (!first) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!uid) {
      return NextResponse.json({ error: "Please enter your college UID." }, { status: 400 });
    }
    if (
      first.length > LIMITS.name ||
      last.length > LIMITS.name ||
      email.length > LIMITS.email ||
      uid.length > LIMITS.uid ||
      academicYear.length > LIMITS.academicYear ||
      stream.length > LIMITS.stream
    ) {
      return NextResponse.json({ error: "One of your details is too long." }, { status: 400 });
    }

    const reg = await db.registerForEvent(eventId, {
      name: first,
      surname: last,
      uid,
      email,
      academicYear,
      stream,
      college: "St. Xavier's College",
    });

    // Display-only refresh for the seat bar. Null means it could not be read;
    // the registration itself already succeeded, so this must not fail the
    // request — the page just keeps the numbers it already had.
    const seats = await db.getSeatInfo(reg.eventId);

    return NextResponse.json(
      { success: true, message: "Registration confirmed successfully!", data: reg, seats },
      { status: 201 }
    );
  } catch (error: any) {
    const message = error?.message || "Failed to register for event.";
    // "Already registered" / "fully booked" are the caller's situation (409);
    // anything else is ours (500).
    const isConflict = /already registered|fully booked|closed/i.test(message);
    if (!isConflict) console.error("[api/register] POST failed:", message);
    return NextResponse.json({ error: message }, { status: isConflict ? 409 : 500 });
  }
}

/** Live seat count for an event. Public — returns counts only, never registrants. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) {
      return NextResponse.json({ error: "eventId is required." }, { status: 400 });
    }

    const event = await db.findEvent(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const seats = await db.getSeatInfo(event.id);

    // `seats: null` means the live numbers are unavailable. The client keeps
    // whatever it rendered at build time rather than being handed a guess.
    // maxSeats comes from the database, not initialData.ts, so the form and the
    // constraint that actually rejects signups agree on the limit.
    return NextResponse.json({
      success: true,
      data: seats
        ? {
            eventId: event.id,
            registered: seats.registered,
            maxSeats: seats.maxSeats,
            seatsLeft: Math.max(0, seats.maxSeats - seats.registered),
            isFull: seats.isFull,
            connected: true,
          }
        : {
            eventId: event.id,
            registered: null,
            maxSeats: event.maxSeats,
            seatsLeft: null,
            isFull: false,
            connected: isSupabaseConfigured,
          },
    });
  } catch (error: any) {
    console.error("[api/register] GET failed:", error?.message);
    return NextResponse.json({ error: "Failed to read seats." }, { status: 500 });
  }
}
