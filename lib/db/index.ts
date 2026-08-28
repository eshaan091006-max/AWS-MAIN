import {
  INITIAL_DEPARTMENTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_PROJECTS,
  INITIAL_GALLERY,
  INITIAL_AWS_MODULES,
  DepartmentData,
  TeamMemberData,
  EventData,
  ProjectData,
  GalleryImageData,
  AWSModuleData,
  ContactMessageData,
} from "@/lib/data/initialData";
import {
  getServiceSupabase,
  getWriteSupabase,
  isSupabaseConfigured,
  supabaseStatus,
} from "@/lib/supabase";

import { getCached, invalidate } from "@/lib/cache";
import { rowToEvent, eventToRow } from "@/lib/db/eventMapper";
import {
  SCHEMA_MISSING_CODES,
  UNIQUE_VIOLATION,
  EVENT_FULL,
  NO_CAPACITY,
} from "@/lib/dbErrors";

// A missing table is reported on every render of every page that lists events.
// Once per process is enough to tell you what to do; more is just noise that
// buries anything genuinely wrong.
const warnedOnce = new Set<string>();
function warnOnce(key: string, message: string) {
  if (warnedOnce.has(key)) return;
  warnedOnce.add(key);
  console.warn(message);
}

const SEATS_TTL_MS = 20_000;
const seatsKey = (eventId: string) => `seats:${eventId}`;

export interface RegistrationInput {
  name: string;
  surname?: string;
  uid?: string;
  email: string;
  academicYear?: string;
  stream?: string;
  college?: string;
}

export interface SeatInfo {
  registered: number;
  /** Authoritative limit from public.events.max_seats, or the seed value if unavailable. */
  maxSeats: number;
  isFull: boolean;
  /** False when the event is not in the database — registration will be refused. */
  configured: boolean;
}

export interface RegistrationRow {
  id: string;
  eventId: string;
  eventTitle: string | null;
  fullName: string;
  uid: string;
  email: string;
  academicYear: string;
  stream: string;
  college: string;
  registeredAt: string;
  attended: boolean;
  attendedAt: string | null;
  attendedBy: string | null;
}

export interface RegistrationRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  surname?: string;
  uid?: string;
  email: string;
  academicYear?: string;
  stream?: string;
  college: string;
  registeredAt: string;
}

function describeDbError(error: { code?: string; message: string }, what: string): Error {
  // 42703 is a missing *column*: the schema is present but predates a newer
  // migration. Saying "the tables do not exist" there sends someone looking
  // for the wrong problem.
  if (error.code === "42703") {
    return new Error(
      `The database is missing a column added in a newer version. Re-run supabase/schema.sql in the Supabase SQL Editor, then try again. (${error.message})`
    );
  }
  if (error.code && SCHEMA_MISSING_CODES.includes(error.code)) {
    return new Error(
      `The database is connected but the tables do not exist yet. Run supabase/schema.sql in the Supabase SQL Editor, then try again. (${error.message})`
    );
  }
  return new Error(`Could not save your ${what}. Please try again in a moment.`);
}

// Projects, team, gallery and modules are still authored in
// lib/data/initialData.ts and served straight from here.
//
// Events are database rows; the seed copy below is only the offline fallback.
//
// Registrations and contact messages are NOT stored here at all. Supabase is
// their only home: if it is unreachable the write fails loudly, because a form
// that reports success while dropping the data is worse than one that errors.
class LocalDataStore {
  departments: DepartmentData[] = [...INITIAL_DEPARTMENTS];
  teamMembers: TeamMemberData[] = [...INITIAL_TEAM_MEMBERS];
  projects: ProjectData[] = [...INITIAL_PROJECTS];

  // Events used to live here. They are rows in Supabase now, so an event
  // created in the admin area actually persists. This copy survives only as the
  // fallback used when the database cannot be reached, so the public site
  // renders content instead of an empty page during an outage.
  private seedEvents: EventData[] = [...INITIAL_EVENTS];

  gallery: GalleryImageData[] = [...INITIAL_GALLERY];
  modules: AWSModuleData[] = [...INITIAL_AWS_MODULES];

  // ==================== Events ====================

  /** Every event, newest first. */
  async listEvents(): Promise<EventData[]> {
    if (!isSupabaseConfigured) return this.seedEvents;

    const client = getWriteSupabase();
    if (!client) return this.seedEvents;

    // Deliberately NOT cached in process.
    //
    // ISR already caches the rendered page, and invalidates it on demand when
    // an admin saves. A second cache underneath that one is per-instance, so
    // the write invalidates only the instance that handled it while the
    // instance that regenerates the page can still hold a stale copy — an edit
    // then appears on the event page but not on the cards, for up to the TTL.
    // The query is a single indexed read; ISR is the layer that makes it rare.
    try {
      const { data, error } = await client
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        // Carry the code through so the caller can tell a setup step apart
        // from a genuine outage.
        const wrapped = new Error(error.message) as Error & { code?: string };
        wrapped.code = error.code;
        throw wrapped;
      }
      return (data ?? []).map(rowToEvent);
    } catch (err: any) {
      if (err?.code && SCHEMA_MISSING_CODES.includes(err.code)) {
        // Expected until supabase/schema.sql has been run. A warning, not an
        // error: this is a setup step with a known fix, and console.error in a
        // server component throws Next's red overlay over a working page.
        warnOnce(
          "events-table-missing",
          "[supabase] No events table yet — serving the seeded event. Run supabase/schema.sql in the Supabase SQL Editor to create it."
        );
      } else {
        // A real failure. Loud, and on every occurrence: a fallback that looks
        // like normal operation hides an outage until someone notices the site
        // has gone stale.
        console.error("[supabase] event list failed, serving seed data:", err?.message);
      }
      return this.seedEvents;
    }
  }

  async findEvent(idOrSlug: string): Promise<EventData | null> {
    const events = await this.listEvents();
    return events.find((e) => e.slug === idOrSlug || e.id === idOrSlug) ?? null;
  }

  async createEvent(input: Omit<EventData, "id" | "currentRegistrations">): Promise<EventData> {
    const client = getServiceSupabase();
    if (!client) throw new Error("Creating events requires SUPABASE_SERVICE_ROLE_KEY.");

    const id = `event-${Date.now()}`;
    const { data, error } = await client
      .from("events")
      .insert({ ...eventToRow(input), id })
      .select()
      .single();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        throw new Error("An event with that name already exists. Choose a different title.");
      }
      console.error("[supabase] event insert failed:", error.code, error.message);
      throw describeDbError(error, "event");
    }

    return rowToEvent(data);
  }

  async updateEvent(id: string, patch: Partial<EventData>): Promise<EventData> {
    const client = getServiceSupabase();
    if (!client) throw new Error("Editing events requires SUPABASE_SERVICE_ROLE_KEY.");

    const { data, error } = await client
      .from("events")
      .update({ ...eventToRow(patch), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        throw new Error("Another event already uses that name.");
      }
      console.error("[supabase] event update failed:", error.code, error.message);
      throw describeDbError(error, "event");
    }

    return rowToEvent(data);
  }

  async removeEvent(id: string): Promise<boolean> {
    const client = getServiceSupabase();
    if (!client) throw new Error("Deleting events requires SUPABASE_SERVICE_ROLE_KEY.");

    const { error, count } = await client
      .from("events")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      console.error("[supabase] event delete failed:", error.code, error.message);
      throw describeDbError(error, "event");
    }

    return (count ?? 0) > 0;
  }

  // ==================== Event Registrations ====================

  /**
   * Seats taken and the seat limit, or null if they cannot be read.
   *
   * Goes through the event_seats RPC rather than reading tables directly: the
   * anon key has no read access to registrations (they hold emails and UIDs),
   * but the RPC returns only integers.
   *
   * Returns null rather than falling back to `currentRegistrations` from
   * initialData.ts. That seed number is demo filler, and substituting it for a
   * failed lookup would report a fabricated count as though it were live. This
   * is display-only — the seat *limit* is enforced in the database by
   * register_for_event(), so a null here cannot let an event overbook.
   */
  async getSeatInfo(eventId: string): Promise<SeatInfo | null> {
    const event = await this.findEvent(eventId);
    const id = event?.id ?? eventId;

    if (!isSupabaseConfigured) return null;

    const client = getWriteSupabase();
    if (!client) return null;

    // Cached briefly: every card on the listing calls this on mount, so an
    // events page with N cards is N round-trips per visitor. Unlike event
    // content, a seat counter being a few seconds behind is harmless — and the
    // seat *limit* is enforced in Postgres, so a stale count cannot overbook.
    // Invalidated immediately after a successful registration.
    const { data, error } = await getCached(
      seatsKey(id),
      SEATS_TTL_MS,
      async () => client.rpc("event_seats", { p_event_id: id })
    );

    if (error) {
      if (error.code && SCHEMA_MISSING_CODES.includes(error.code)) {
        warnOnce(
          "event-seats-missing",
          "[supabase] event_seats() not found — seat counts will show build-time numbers. Run supabase/schema.sql."
        );
      } else {
        console.error("[supabase] seat lookup failed:", error.code, error.message);
      }
      return null;
    }

    // A `returns table` function comes back as an array of rows.
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.registered !== "number") return null;

    // max_seats is null when the event has no capacity row. Fall back to the
    // number in initialData.ts for display, but registration will still be
    // refused by register_for_event() until a capacity row exists.
    const maxSeats = typeof row.max_seats === "number" ? row.max_seats : event?.maxSeats ?? 0;

    return {
      registered: row.registered,
      maxSeats,
      isFull: maxSeats > 0 && row.registered >= maxSeats,
      configured: typeof row.max_seats === "number",
    };
  }

  async registerForEvent(eventId: string, data: RegistrationInput): Promise<RegistrationRecord> {
    const event = await this.findEvent(eventId);
    if (!event) throw new Error("Event not found");

    if (event.status === "COMPLETED") {
      throw new Error("Registration for this event has closed.");
    }

    const email = data.email.trim().toLowerCase();
    const record: RegistrationRecord = {
      id: `reg-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      name: data.name.trim(),
      surname: data.surname?.trim() || "",
      uid: data.uid?.trim() || "",
      email,
      academicYear: data.academicYear?.trim() || "",
      stream: data.stream?.trim() || "",
      college: data.college?.trim() || "St. Xavier's College",
      registeredAt: new Date().toISOString(),
    };

    const client = getWriteSupabase();
    if (!isSupabaseConfigured || !client) {
      // Supabase is the only place registrations are stored. Refuse loudly
      // rather than accepting a signup that nothing will ever record.
      console.error(`[supabase] ${supabaseStatus()} — cannot accept registrations.`);
      throw new Error("Registration is temporarily unavailable. Please try again later.");
    }

    // Everything below — the seat check and the insert — happens inside one
    // database transaction. Counting here and inserting afterwards would let
    // two simultaneous registrations both claim the last seat, so the limit is
    // enforced in Postgres, against a capacity the caller cannot influence.
    const { data: newId, error } = await client.rpc("register_for_event", {
      p_event_id: event.id,
      p_event_title: event.title,
      p_event_slug: event.slug,
      p_first_name: record.name,
      p_last_name: record.surname,
      p_uid: record.uid,
      p_email: record.email,
      p_academic_year: record.academicYear,
      p_stream: record.stream,
      p_college: record.college,
    });

    if (error) {
      switch (error.code) {
        case EVENT_FULL:
          throw new Error("This event is fully booked. All seats have been reserved.");
        case NO_CAPACITY:
          console.error(`[supabase] event ${event.id} is not in the events table`);
          throw new Error("Registration for this event is not open yet.");
        case UNIQUE_VIOLATION:
          // The unique index on (event_id, lower(email)) is what makes
          // duplicate detection reliable across restarts and instances.
          throw new Error("You have already registered for this event with this email.");
      }
      console.error("[supabase] registration failed:", error.code, error.message);
      throw describeDbError(error, "registration");
    }

    // The seat bar must reflect the signup that just happened, not a count
    // cached seconds ago.
    invalidate(seatsKey(event.id));

    record.id = typeof newId === "string" ? newId : `${event.id}:${email}`;
    return record;
  }


  // ==================== Registrations (admin) ====================

  /**
   * Registers someone past the seat limit, on an admin's explicit say-so.
   *
   * Bypasses register_for_event() and its capacity check, so it is reachable
   * only from the authenticated admin walk-in desk — never from the public
   * form. The limit exists to stop the public overbooking an event; an officer
   * standing at the door deciding to admit one more person is a judgement the
   * system should allow them to make.
   *
   * The unique index still applies, so this cannot create a duplicate.
   */
  async forceRegister(eventId: string, data: RegistrationInput): Promise<void> {
    const client = getServiceSupabase();
    if (!client) throw new Error("Over-capacity registration requires SUPABASE_SERVICE_ROLE_KEY.");

    const event = await this.findEvent(eventId);
    if (!event) throw new Error("Event not found");

    const { error } = await client.from("event_registrations").insert({
      event_id: event.id,
      event_title: event.title,
      event_slug: event.slug,
      first_name: data.name.trim(),
      last_name: data.surname?.trim() || null,
      uid: data.uid?.trim() || "",
      email: data.email.trim().toLowerCase(),
      academic_year: data.academicYear?.trim() || "",
      stream: data.stream?.trim() || "",
      college: data.college?.trim() || "St. Xavier's College",
    });

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        throw new Error("You have already registered for this event with this email.");
      }
      console.error("[supabase] force register failed:", error.code, error.message);
      throw describeDbError(error, "registration");
    }

    invalidate(seatsKey(event.id));
  }


  /**
   * Registrations for an event, oldest first.
   *
   * Oldest first because this is read as a check-in list: the order people
   * signed up is stable, so a name does not jump around the page while an
   * officer is working down it at the door.
   *
   * Service role only. The anon key has no read access to this table and must
   * not gain any — these rows are student emails and UIDs.
   */
  async listRegistrations(eventId?: string): Promise<RegistrationRow[]> {
    const admin = getServiceSupabase();
    if (!admin) {
      console.error("[supabase] reading registrations requires SUPABASE_SERVICE_ROLE_KEY");
      return [];
    }

    let query = admin
      .from("event_registrations")
      .select(
        "id,event_id,event_title,full_name,uid,email,academic_year,stream,college,created_at,attended,attended_at,attended_by"
      )
      .order("created_at", { ascending: true })
      .limit(2000);

    if (eventId) query = query.eq("event_id", eventId);

    const { data, error } = await query;
    if (error) {
      console.error("[supabase] registration read failed:", error.code, error.message);
      throw describeDbError(error, "registration list");
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      eventId: row.event_id,
      eventTitle: row.event_title,
      fullName: row.full_name,
      uid: row.uid,
      email: row.email,
      academicYear: row.academic_year,
      stream: row.stream,
      college: row.college,
      registeredAt: row.created_at,
      attended: Boolean(row.attended),
      attendedAt: row.attended_at ?? null,
      attendedBy: row.attended_by ?? null,
    }));
  }

  /**
   * Marks one registration present or absent.
   *
   * `markedBy` is the signed-in admin from the session, not anything the
   * client sends, so the audit trail cannot be forged by the browser.
   */
  async setAttendance(
    registrationId: string,
    attended: boolean,
    markedBy: string
  ): Promise<RegistrationRow | null> {
    const admin = getServiceSupabase();
    if (!admin) throw new Error("Marking attendance requires SUPABASE_SERVICE_ROLE_KEY.");

    const { data, error } = await admin
      .from("event_registrations")
      .update({
        attended,
        // Cleared when unmarking, so a mistaken tick leaves no trace claiming
        // someone was seen at a time they were not.
        attended_at: attended ? new Date().toISOString() : null,
        attended_by: attended ? markedBy : null,
      })
      .eq("id", registrationId)
      .select(
        "id,event_id,event_title,full_name,uid,email,academic_year,stream,college,created_at,attended,attended_at,attended_by"
      )
      .maybeSingle();

    if (error) {
      console.error("[supabase] attendance update failed:", error.code, error.message);
      throw describeDbError(error, "attendance");
    }
    if (!data) return null;

    return {
      id: data.id,
      eventId: data.event_id,
      eventTitle: data.event_title,
      fullName: data.full_name,
      uid: data.uid,
      email: data.email,
      academicYear: data.academic_year,
      stream: data.stream,
      college: data.college,
      registeredAt: data.created_at,
      attended: Boolean(data.attended),
      attendedAt: data.attended_at ?? null,
      attendedBy: data.attended_by ?? null,
    };
  }

  // ==================== Contact Messages ====================
  async addMessage(
    msg: Omit<ContactMessageData, "id" | "createdAt" | "isRead">
  ): Promise<ContactMessageData> {
    const newMsg: ContactMessageData = {
      ...msg,
      name: msg.name.trim(),
      email: msg.email.trim().toLowerCase(),
      subject: msg.subject?.trim() || "General Inquiry",
      category: msg.category || "GENERAL",
      message: msg.message.trim(),
      id: `msg-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const client = getWriteSupabase();
    if (!isSupabaseConfigured || !client) {
      // Supabase is the only place messages are stored. Refuse loudly rather
      // than showing a success screen for a message nobody will ever read.
      console.error(`[supabase] ${supabaseStatus()} — cannot accept messages.`);
      throw new Error("The contact form is temporarily unavailable. Please try again later.");
    }

    const { error } = await client.from("contact_messages").insert({
      name: newMsg.name,
      email: newMsg.email,
      subject: newMsg.subject,
      category: newMsg.category,
      message: newMsg.message,
    });

    if (error) {
      console.error("[supabase] contact insert failed:", error.code, error.message);
      throw describeDbError(error, "message");
    }

    return newMsg;
  }

  /**
   * Reads submitted messages. Requires SUPABASE_SERVICE_ROLE_KEY: the anon key
   * cannot read this table. Without that key this returns an empty list rather
   * than seed data, so the admin view never shows demo rows as real inquiries.
   */
  async getMessages(): Promise<ContactMessageData[]> {
    const admin = getServiceSupabase();
    if (!admin) return [];

    const { data, error } = await admin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[supabase] message read failed:", error.message);
      throw new Error("Could not load messages.");
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      category: row.category,
      message: row.message,
      isRead: row.is_read,
      createdAt: row.created_at,
    })) as ContactMessageData[];
  }

  // ==================== Other Stores ====================
  getProjects() {
    return this.projects;
  }

  getDepartments() {
    return this.departments;
  }

  getTeamMembers() {
    return this.teamMembers;
  }

  getGallery() {
    return this.gallery;
  }

  getAWSModules() {
    return this.modules;
  }

  getModules() {
    return this.modules;
  }

  getModuleBySlug(slug: string) {
    return this.modules.find((m) => m.slug === slug || m.id === slug) || null;
  }
}

export const db = new LocalDataStore();
