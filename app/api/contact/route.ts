import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasServiceRole } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Length caps keep a scripted flood from bloating the table, and keep the
// values inside what the admin view can reasonably display.
const LIMITS = {
  name: 120,
  email: 254, // RFC 5321 maximum
  subject: 200,
  category: 60,
  message: 5000,
};

// 5 messages per 10 minutes from one address.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function tooLong(field: keyof typeof LIMITS, value: string) {
  return value.length > LIMITS[field];
}

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`contact:${clientKey(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many messages sent. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();
    const name = String(body.name ?? "");
    const email = String(body.email ?? "");
    const subject = String(body.subject ?? "");
    const category = String(body.category ?? "");
    const message = String(body.message ?? "");

    if (!name.trim()) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!message.trim()) {
      return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
    }
    if (tooLong("message", message)) {
      return NextResponse.json(
        { error: `Please keep your message under ${LIMITS.message} characters.` },
        { status: 400 }
      );
    }
    if (tooLong("name", name) || tooLong("email", email) || tooLong("subject", subject)) {
      return NextResponse.json({ error: "One of your details is too long." }, { status: 400 });
    }

    const saved = await db.addMessage({
      name,
      email,
      subject: subject.trim() || "General Inquiry",
      category: category.trim().slice(0, LIMITS.category) || "GENERAL",
      message,
    });

    return NextResponse.json(
      { success: true, message: "Your message has been received.", data: saved },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[api/contact] POST failed:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to process message." },
      { status: 500 }
    );
  }
}

/**
 * Lists submitted messages. ADMIN ONLY.
 *
 * This returns other people's names, email addresses and message bodies, so
 * it is gated on ADMIN_API_TOKEN. Without that token set the route is
 * disabled outright rather than served to anonymous callers.
 */
export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const messages = await db.getMessages();
    return NextResponse.json({
      success: true,
      data: messages,
      source: hasServiceRole
        ? "database"
        : "unavailable (set SUPABASE_SERVICE_ROLE_KEY to read stored messages)",
    });
  } catch (error: any) {
    console.error("[api/contact] GET failed:", error?.message);
    return NextResponse.json({ error: "Failed to load messages." }, { status: 500 });
  }
}
