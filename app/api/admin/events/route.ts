import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { EventData } from "@/lib/data/initialData";

export const dynamic = "force-dynamic";

// Authentication is handled by middleware.ts for the whole /api/admin/* tree,
// so these handlers do not repeat the check.

const CATEGORIES = ["WORKSHOP", "HACKATHON", "SEMINAR", "BOOTCAMP"] as const;
const STATUSES = ["UPCOMING", "ONGOING", "COMPLETED"] as const;

const MAX = { title: 200, description: 2000, venue: 200, time: 100, url: 2000 };
const MAX_SEATS_CEILING = 10_000;

// Must match the remotePatterns allowlist in next.config.mjs — an image from
// any other host will not render anyway, so accepting one would only produce a
// broken card later.
const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "avatars.githubusercontent.com",
  "a0.awsstatic.com",
  "raw.githubusercontent.com",
  "upload.wikimedia.org",
];

function imageUrlError(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "Image URL must use https.";
    if (!ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)) {
      return `Image host must be one of: ${ALLOWED_IMAGE_HOSTS.join(", ")}`;
    }
    return null;
  } catch {
    return "Image URL is not a valid URL.";
  }
}

interface Parsed {
  error?: string;
  value?: Partial<EventData>;
}

/**
 * Validates a submitted event.
 *
 * `partial` is true for PATCH, where absent fields mean "leave unchanged"
 * rather than "clear this".
 */
function parseEvent(body: any, partial: boolean): Parsed {
  const out: Partial<EventData> = {};

  const title = body.title === undefined ? undefined : String(body.title).trim();
  const description =
    body.description === undefined ? undefined : String(body.description).trim();
  const venue = body.venue === undefined ? undefined : String(body.venue).trim();

  if (!partial && (!title || !description || !venue)) {
    return { error: "Title, description and venue are required." };
  }
  if (title !== undefined) {
    if (!title) return { error: "Title cannot be empty." };
    if (title.length > MAX.title) return { error: "Title is too long." };
    out.title = title;
    out.slug = slugify(title);
  }
  if (description !== undefined) {
    if (!description) return { error: "Description cannot be empty." };
    if (description.length > MAX.description) return { error: "Description is too long." };
    out.description = description;
    out.fullDetails = String(body.fullDetails ?? description).trim();
  }
  if (venue !== undefined) {
    if (!venue) return { error: "Venue cannot be empty." };
    if (venue.length > MAX.venue) return { error: "Venue is too long." };
    out.venue = venue;
  }

  if (body.date !== undefined) {
    const parsed = new Date(String(body.date));
    if (Number.isNaN(parsed.getTime())) return { error: "Date is not valid." };
    out.date = parsed.toISOString();
  } else if (!partial) {
    out.date = new Date().toISOString();
  }

  if (body.time !== undefined) {
    const time = String(body.time).trim();
    if (time.length > MAX.time) return { error: "Time is too long." };
    out.time = time || "02:00 PM - 05:00 PM IST";
  } else if (!partial) {
    out.time = "02:00 PM - 05:00 PM IST";
  }

  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      return { error: `Category must be one of: ${CATEGORIES.join(", ")}` };
    }
    out.category = body.category;
  } else if (!partial) {
    out.category = "WORKSHOP";
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return { error: `Status must be one of: ${STATUSES.join(", ")}` };
    }
    out.status = body.status;
  } else if (!partial) {
    out.status = "UPCOMING";
  }

  if (body.maxSeats !== undefined) {
    const seats = Number(body.maxSeats);
    if (!Number.isFinite(seats) || seats < 1) {
      return { error: "Max seats must be a positive number." };
    }
    out.maxSeats = Math.min(Math.floor(seats), MAX_SEATS_CEILING);
  } else if (!partial) {
    out.maxSeats = 100;
  }

  if (body.isFeatured !== undefined) out.isFeatured = Boolean(body.isFeatured);
  else if (!partial) out.isFeatured = false;

  for (const [key, field] of [
    ["imageUrl", "imageUrl"],
    ["bannerUrl", "bannerUrl"],
  ] as const) {
    if (body[key] !== undefined) {
      const url = String(body[key]).trim();
      if (url.length > MAX.url) return { error: "Image URL is too long." };
      const problem = imageUrlError(url);
      if (problem) return { error: problem };
      if (url) (out as any)[field] = url;
    }
  }

  if (Array.isArray(body.speakerNames)) {
    out.speakerNames = body.speakerNames.map((s: unknown) => String(s).trim()).filter(Boolean);
  } else if (!partial) {
    out.speakerNames = ["SXC AWS Tech Team"];
  }

  if (Array.isArray(body.prerequisites)) {
    out.prerequisites = body.prerequisites.map((s: unknown) => String(s).trim()).filter(Boolean);
  } else if (!partial) {
    out.prerequisites = ["Laptop with web browser"];
  }

  if (Array.isArray(body.agenda)) {
    out.agenda = body.agenda.map((item: any) => ({
      time: String(item?.time ?? "").trim(),
      title: String(item?.title ?? "").trim(),
      description: String(item?.description ?? "").trim(),
    }));
  } else if (!partial) {
    out.agenda = [
      { time: "02:00 PM", title: "Session", description: "Hands-on cloud session." },
    ];
  }

  return { value: out };
}

/** Publishes the change to the public pages without waiting for the 60s ISR window. */
function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/events");
  if (slug) revalidatePath(`/events/${slug}`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { error, value } = parseEvent(body, false);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = await db.createEvent(
      value as Omit<EventData, "id" | "currentRegistrations">
    );
    refreshPublicPages(created.slug);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    console.error("[api/admin/events] POST failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to create event." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Event id is required." }, { status: 400 });

    const { error, value } = parseEvent(body, true);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!value || Object.keys(value).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const updated = await db.updateEvent(id, value);
    refreshPublicPages(updated.slug);

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[api/admin/events] PATCH failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Event id is required." }, { status: 400 });

    // Read the slug before deleting, so the right detail page can be purged.
    const existing = await db.findEvent(id);
    const removed = await db.removeEvent(id);
    if (!removed) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    refreshPublicPages(existing?.slug);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/admin/events] DELETE failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to delete event." }, { status: 500 });
  }
}
