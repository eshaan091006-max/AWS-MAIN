import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_LENGTHS = { title: 200, description: 2000, venue: 200, imageUrl: 2000 };
const CATEGORIES = ["WORKSHOP", "HACKATHON", "SEMINAR", "BOOTCAMP"] as const;

// Only these hosts are allowed in event images. Without this, an event image
// URL is an arbitrary attacker-controlled URL rendered into the page, and it
// must also match the remotePatterns allowlist in next.config.mjs or the
// image fails to load anyway.
const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "avatars.githubusercontent.com",
  "a0.awsstatic.com",
  "raw.githubusercontent.com",
  "upload.wikimedia.org",
];

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

// Public: the events listing is public content on the site.
export async function GET() {
  const events = db.getEvents();
  return NextResponse.json({ success: true, data: events });
}

/**
 * Creates an event. ADMIN ONLY — this was previously open to anyone.
 *
 * Note that events live in lib/data/initialData.ts, so anything created here
 * exists only in server memory and disappears on restart or redeploy. To add a
 * real event, edit initialData.ts.
 */
export async function POST(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const venue = String(body.venue ?? "").trim();
    const imageUrl = String(body.imageUrl ?? "").trim();

    if (!title || !description || !venue) {
      return NextResponse.json(
        { error: "Title, description, and venue are required." },
        { status: 400 }
      );
    }
    if (
      title.length > MAX_LENGTHS.title ||
      description.length > MAX_LENGTHS.description ||
      venue.length > MAX_LENGTHS.venue ||
      imageUrl.length > MAX_LENGTHS.imageUrl
    ) {
      return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
    }

    const category = CATEGORIES.includes(body.category) ? body.category : "WORKSHOP";

    if (imageUrl && !isAllowedImageUrl(imageUrl)) {
      return NextResponse.json(
        { error: `Image URL must be https and from one of: ${ALLOWED_IMAGE_HOSTS.join(", ")}` },
        { status: 400 }
      );
    }

    const parsedDate = body.date ? new Date(String(body.date)) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const seats = Number(body.maxSeats);
    const maxSeats = Number.isFinite(seats) && seats > 0 ? Math.min(Math.floor(seats), 10000) : 100;

    const defaultImage =
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop";
    const defaultBanner =
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop";

    const newEvent = db.addEvent({
      title,
      slug: slugify(title),
      description,
      fullDetails: description,
      date: parsedDate.toISOString(),
      time: String(body.time ?? "").trim() || "02:00 PM - 05:00 PM IST",
      venue,
      category,
      status: "UPCOMING",
      isFeatured: false,
      imageUrl: imageUrl || defaultImage,
      bannerUrl: imageUrl || defaultBanner,
      speakerNames: ["SXC AWS Tech Team"],
      prerequisites: ["Laptop with web browser"],
      agenda: [
        { time: "02:00 PM", title: "Keynote & Lab", description: "Hands-on cloud session." },
      ],
      maxSeats,
    });

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (err: any) {
    console.error("[api/events] POST failed:", err?.message);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}

/** Deletes an event. ADMIN ONLY — this was previously open to anyone. */
export async function DELETE(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const deleted = db.deleteEvent(id);
    return NextResponse.json({ success: deleted }, { status: deleted ? 200 : 404 });
  } catch (err: any) {
    console.error("[api/events] DELETE failed:", err?.message);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}
