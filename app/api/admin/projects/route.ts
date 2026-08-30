import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ProjectData } from "@/lib/data/initialData";

export const dynamic = "force-dynamic";

// Auth is handled by middleware.ts for the whole /api/admin/* tree.

const MAX = { title: 200, slug: 120, short: 500, long: 5000, url: 2000, list: 40, members: 40 };

interface Parsed {
  error?: string;
  value?: Partial<Omit<ProjectData, "id">>;
}

/** Trimmed, de-duplicated, capped. Empty strings are dropped, not stored. */
function parseList(raw: any, label: string): string[] | string {
  if (!Array.isArray(raw)) return `${label} must be a list.`;
  const items = raw
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, MAX.list);
  if (items.some((v) => v.length > 100)) return `Each ${label} entry must be under 100 characters.`;
  return Array.from(new Set(items));
}

/**
 * Optional links are allowed to be blank, but a non-blank one must be a real
 * https URL — an http link is blocked as mixed content on the live site, and a
 * typo'd one would render as a dead button with no clue why.
 */
function parseUrl(raw: any, label: string, required: boolean): string | { error: string } {
  const value = String(raw ?? "").trim();
  if (!value) {
    return required ? { error: `${label} is required.` } : "";
  }
  if (value.length > MAX.url) return { error: `${label} is too long.` };
  try {
    if (new URL(value).protocol !== "https:") {
      return { error: `${label} must start with https://` };
    }
  } catch {
    return { error: `${label} does not look like a valid URL.` };
  }
  return value;
}

/** `partial` is true for PATCH, where an absent field means "leave it alone". */
function parseProject(body: any, partial: boolean): Parsed {
  const out: Partial<Omit<ProjectData, "id">> = {};

  const title = body.title === undefined ? undefined : String(body.title).trim();
  if (!partial && !title) return { error: "A project title is required." };
  if (title !== undefined) {
    if (!title) return { error: "Title cannot be empty." };
    if (title.length > MAX.title) return { error: "Title is too long." };
    out.title = title;
  }

  if (body.slug !== undefined || !partial) {
    // A blank slug on create is derived from the title rather than rejected:
    // it is a URL detail, not something an admin should have to think about.
    const raw = String(body.slug ?? "").trim() || (title ?? "");
    const slug = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!slug) return { error: "Could not build a URL slug from that title." };
    if (slug.length > MAX.slug) return { error: "Slug is too long." };
    out.slug = slug;
  }

  for (const [key, label, max] of [
    ["shortDesc", "Short description", MAX.short],
    ["problem", "Problem", MAX.long],
    ["solution", "Solution", MAX.long],
  ] as const) {
    if (body[key] !== undefined) {
      const value = String(body[key]).trim();
      if (value.length > max) return { error: `${label} is too long.` };
      (out as any)[key] = value;
    } else if (!partial) {
      (out as any)[key] = "";
    }
  }

  for (const [key, label] of [
    ["technologies", "Technologies"],
    ["awsServices", "AWS services"],
  ] as const) {
    if (body[key] !== undefined) {
      const parsed = parseList(body[key], label);
      if (typeof parsed === "string") return { error: parsed };
      (out as any)[key] = parsed;
    } else if (!partial) {
      (out as any)[key] = [];
    }
  }

  for (const [key, label, required] of [
    ["imageUrl", "Image URL", false],
    ["githubUrl", "GitHub URL", false],
    ["liveDemoUrl", "Live demo URL", false],
  ] as const) {
    if (body[key] !== undefined) {
      const parsed = parseUrl(body[key], label, required);
      if (typeof parsed !== "string") return { error: parsed.error };
      (out as any)[key] = parsed;
    } else if (!partial) {
      (out as any)[key] = "";
    }
  }

  if (body.members !== undefined) {
    if (!Array.isArray(body.members)) return { error: "Members must be a list." };
    const members: ProjectData["members"] = [];
    for (const raw of body.members.slice(0, MAX.members)) {
      const name = String(raw?.name ?? "").trim();
      // A credit with no name is an empty row someone left behind, not data.
      if (!name) continue;
      if (name.length > 120) return { error: "A member name is too long." };
      const avatar = parseUrl(raw?.avatarUrl, "Member avatar URL", false);
      if (typeof avatar !== "string") return { error: avatar.error };
      members.push({ name, role: String(raw?.role ?? "").trim().slice(0, 120), avatarUrl: avatar });
    }
    out.members = members;
  } else if (!partial) {
    out.members = [];
  }

  if (body.isFeatured !== undefined) out.isFeatured = Boolean(body.isFeatured);
  else if (!partial) out.isFeatured = false;

  return { value: out };
}

function refreshPublic() {
  revalidatePath("/projects");
}

export async function GET() {
  try {
    const data = await db.listProjects();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("[api/admin/projects] GET failed:", err?.message);
    return NextResponse.json({ error: "Failed to load projects." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { error, value } = parseProject(body, false);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = await db.createProject(value as Omit<ProjectData, "id">);
    refreshPublic();
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    console.error("[api/admin/projects] POST failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to add the project." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Project id is required." }, { status: 400 });

    const { error, value } = parseProject(body, true);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!value || Object.keys(value).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const updated = await db.updateProject(id, value);
    if (!updated) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    refreshPublic();
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[api/admin/projects] PATCH failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to save the project." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Project id is required." }, { status: 400 });

    const removed = await db.deleteProject(id);
    if (!removed) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    refreshPublic();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/admin/projects] DELETE failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to delete the project." }, { status: 500 });
  }
}
