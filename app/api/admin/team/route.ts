import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { TeamMemberData } from "@/lib/data/initialData";

export const dynamic = "force-dynamic";

// Auth is handled by middleware.ts for the whole /api/admin/* tree.

const MAX = { name: 120, position: 160, dept: 120, bio: 2000, url: 2000, email: 200, skills: 40 };

interface Parsed {
  error?: string;
  value?: Partial<Omit<TeamMemberData, "id">>;
}

function parseUrl(raw: any, label: string): string | { error: string } {
  const value = String(raw ?? "").trim();
  if (!value) return "";
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
function parseMember(body: any, partial: boolean): Parsed {
  const out: Partial<Omit<TeamMemberData, "id">> = {};

  const name = body.name === undefined ? undefined : String(body.name).trim();
  if (!partial && !name) return { error: "A name is required." };
  if (name !== undefined) {
    if (!name) return { error: "Name cannot be empty." };
    if (name.length > MAX.name) return { error: "Name is too long." };
    out.name = name;
  }

  for (const [key, label, max] of [
    ["position", "Position", MAX.position],
    ["departmentId", "Department id", MAX.dept],
    ["departmentName", "Department name", MAX.dept],
    ["bio", "Bio", MAX.bio],
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
    ["photoUrl", "Photo URL"],
    ["linkedin", "LinkedIn URL"],
    ["github", "GitHub URL"],
  ] as const) {
    if (body[key] !== undefined) {
      const parsed = parseUrl(body[key], label);
      if (typeof parsed !== "string") return { error: parsed.error };
      (out as any)[key] = parsed;
    } else if (!partial) {
      (out as any)[key] = "";
    }
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim();
    if (email) {
      if (email.length > MAX.email) return { error: "Email is too long." };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "That email address does not look valid." };
      }
    }
    out.email = email;
  } else if (!partial) {
    out.email = "";
  }

  if (body.skills !== undefined) {
    if (!Array.isArray(body.skills)) return { error: "Skills must be a list." };
    const skills = body.skills
      .map((v: any) => String(v).trim())
      .filter(Boolean)
      .slice(0, MAX.skills);
    if (skills.some((s: string) => s.length > 60)) {
      return { error: "Each skill must be under 60 characters." };
    }
    out.skills = Array.from(new Set(skills)) as string[];
  } else if (!partial) {
    out.skills = [];
  }

  if (body.order !== undefined) {
    const order = Number(body.order);
    if (!Number.isFinite(order) || order < 0 || order > 9999) {
      return { error: "Order must be a number between 0 and 9999." };
    }
    out.order = Math.floor(order);
  } else if (!partial) {
    out.order = 0;
  }

  if (body.isExecutive !== undefined) out.isExecutive = Boolean(body.isExecutive);
  else if (!partial) out.isExecutive = false;

  return { value: out };
}

function refreshPublic() {
  revalidatePath("/teams");
}

export async function GET() {
  try {
    const { items, live } = await db.listTeamMembers();
    // `live: false` means these are seed rows, not database rows: every
    // write control on them will fail until the schema is run.
    return NextResponse.json({ success: true, data: items, live });
  } catch (err: any) {
    console.error("[api/admin/team] GET failed:", err?.message);
    return NextResponse.json({ error: "Failed to load the team." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { error, value } = parseMember(body, false);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const created = await db.createTeamMember(value as Omit<TeamMemberData, "id">);
    refreshPublic();
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    console.error("[api/admin/team] POST failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to add the member." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Member id is required." }, { status: 400 });

    const { error, value } = parseMember(body, true);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!value || Object.keys(value).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const updated = await db.updateTeamMember(id, value);
    if (!updated) return NextResponse.json({ error: "Member not found." }, { status: 404 });

    refreshPublic();
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[api/admin/team] PATCH failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to save the member." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Member id is required." }, { status: 400 });

    const removed = await db.deleteTeamMember(id);
    if (!removed) return NextResponse.json({ error: "Member not found." }, { status: 404 });

    refreshPublic();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/admin/team] DELETE failed:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to delete the member." }, { status: 500 });
  }
}
