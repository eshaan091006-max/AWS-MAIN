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

import {
  SCHEMA_MISSING_CODES,
  UNIQUE_VIOLATION,
  EVENT_FULL,
  NO_CAPACITY,
} from "@/lib/dbErrors";

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
  /** Authoritative limit from public.event_capacity, or the initialData value if unset. */
  maxSeats: number;
  isFull: boolean;
  /** False when the event has no event_capacity row — registration will be refused. */
  configured: boolean;
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
  if (error.code && SCHEMA_MISSING_CODES.includes(error.code)) {
    return new Error(
      `The database is connected but the tables do not exist yet. Run supabase/schema.sql in the Supabase SQL Editor, then try again. (${error.message})`
    );
  }
  return new Error(`Could not save your ${what}. Please try again in a moment.`);
}

// Site content (events, projects, team, gallery, modules) is authored in
// lib/data/initialData.ts and served from here for static generation.
//
// The two things users submit — registrations and contact messages — are NOT
// stored here. Supabase is their only home: if it is unreachable the write
// fails loudly, because a form that reports success while dropping the data is
// worse than one that reports an error.
class LocalDataStore {
  departments: DepartmentData[] = [...INITIAL_DEPARTMENTS];
  teamMembers: TeamMemberData[] = [...INITIAL_TEAM_MEMBERS];
  events: EventData[] = [...INITIAL_EVENTS];
  projects: ProjectData[] = [...INITIAL_PROJECTS];
  gallery: GalleryImageData[] = [...INITIAL_GALLERY];
  modules: AWSModuleData[] = [...INITIAL_AWS_MODULES];

  // ==================== Events ====================
  getEvents() {
    return this.events;
  }

  getEventBySlug(slug: string) {
    return this.events.find((e) => e.slug === slug || e.id === slug) || null;
  }

  addEvent(event: Omit<EventData, "id" | "currentRegistrations">) {
    const newEvent: EventData = {
      ...event,
      id: `event-${Date.now()}`,
      currentRegistrations: 0,
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<EventData>) {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.events[idx] = { ...this.events[idx], ...updates };
      return this.events[idx];
    }
    return null;
  }

  deleteEvent(id: string) {
    const prevLen = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    return this.events.length < prevLen;
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
    const event = this.getEventBySlug(eventId);
    const id = event?.id ?? eventId;

    if (!isSupabaseConfigured) return null;

    const client = getWriteSupabase();
    if (!client) return null;

    const { data, error } = await client.rpc("event_seats", { p_event_id: id });

    if (error) {
      console.error("[supabase] seat lookup failed:", error.message);
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
    const event = this.events.find((e) => e.id === eventId || e.slug === eventId);
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
          console.error(`[supabase] no event_capacity row for ${event.id}`);
          throw new Error("Registration for this event is not open yet.");
        case UNIQUE_VIOLATION:
          // The unique index on (event_id, lower(email)) is what makes
          // duplicate detection reliable across restarts and instances.
          throw new Error("You have already registered for this event with this email.");
      }
      console.error("[supabase] registration failed:", error.code, error.message);
      throw describeDbError(error, "registration");
    }

    record.id = typeof newId === "string" ? newId : `${event.id}:${email}`;
    return record;
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
