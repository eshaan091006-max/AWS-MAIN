import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { GalleryImageData } from "@/lib/data/initialData";

export const dynamic = "force-dynamic";

// Auth is handled by middleware.ts for the whole /api/admin/* tree.

const CATEGORIES: GalleryImageData["category"][] = [
  "WORKSHOPS",
  "HACKATHONS",
  "TEAM",
  "EVENTS",
  "COMMUNITY",
];

const MAX = { title: 200, description: 1000, url: 2000 };

interface Parsed {
  error?: string;
  value?: Partial<Omit<GalleryImageData, "id">>;
}

/** `partial` is true for PATCH, where an absent field means "leave it alone". */
function parseItem(body: any, partial: boolean): Parsed {
  const out: Partial<Omit<GalleryImageData, "id">> = {};

  const title = body.title === undefined ? undefined : String(body.title).trim();
  const imageUrl = body.imageUrl === undefined ? undefined : String(body.imageUrl).trim();

  if (!partial && (!title || !imageUrl)) {
    return { error: "A title and an image URL are required." };
  }
  if (title !== undefined) {
    if (!title) return { error: "Title cannot be empty." };
    if (title.length > MAX.title) return { error: "Title is too long." };
    out.title = title;
  }
  if (imageUrl !== undefined) {
    if (!imageUrl) return { error: "Image URL cannot be empty." };
    if (imageUrl.length > MAX.url) return { error: "Image URL is too long." };
    try {
      // https only, matching the events rule: an http image on an https page
      // is blocked as mixed content and would silently fail to appear.
      if (new URL(imageUrl).protocol !== "https:") {
        return { error: "Image URL must start with https://" };
      }
    } catch {
      return { error: "That does not look like a valid URL." };
    }
    out.imageUrl = imageUrl;
  }

  if (body.description !== undefined) {
    const description = String(body.description).trim();
    if (description.length > MAX.description) return { error: "Description is too long." };
    out.description = description;
  } else if (!partial) {
    out.description = "";
  }

  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      return { error: `Category must be one of: ${CATEGORIES.join(", ")}` };
    }
    out.category = body.category;
  } else if (!partial) {
    out.category = "EVENTS";
  }

  if (body.date !== undefined) {
    const parsed = new Date(String(body.date));
    if (Number.isNaN(parsed.getTime())) return { error: "Date is not valid." };
    out.date = parsed.toISOString();
  } else if (!partial) {
    out.date = new Date().toISOString();
  }

  if (body.featured !== undefined) out.featured = Boolean(body.featured);
  else if (!partial) out.featured = false;

  return { value: out };
}

function refreshPublic() {
  revalidatePath("/gallery");
}

export async function GET() {
  try {
    const { items, live } = await db.listGallery();
    // `live: false` means these are seed rows, not database rows: every
    // write control on them will fail until the schema is run.
    return NextResponse.json({ success: true, data: items, live });
  } catch (err: any) {
    console.error("[api/admin/gallery] GET failed:", err?.message);
    return NextResponse.json({ error: "Failed to load the gallery." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { error, value } = parseItem(body, false);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = await db.createGalleryItem(value as Omit<GalleryImageData, "id">);
    refreshPublic();
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    console.error("[api/admin/gallery] POST failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to add the entry." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Entry id is required." }, { status: 400 });

    const { error, value } = parseItem(body, true);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!value || Object.keys(value).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const updated = await db.updateGalleryItem(id, value);
    if (!updated) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

    refreshPublic();
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[api/admin/gallery] PATCH failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to save the entry." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Entry id is required." }, { status: 400 });

    const removed = await db.deleteGalleryItem(id);
    if (!removed) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

    refreshPublic();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/admin/gallery] DELETE failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to delete the entry." }, { status: 500 });
  }
}
