import { EventData } from "@/lib/data/initialData";

/** A row of public.events, exactly as Supabase returns it. */
export interface EventRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_details: string | null;
  date: string;
  time: string;
  venue: string;
  category: EventData["category"];
  status: EventData["status"];
  is_featured: boolean;
  image_url: string | null;
  banner_url: string | null;
  speaker_names: string[] | null;
  prerequisites: string[] | null;
  agenda: EventData["agenda"] | null;
  max_seats: number;
  ecc_points: number | null;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop";

export function rowToEvent(row: EventRow): EventData {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    fullDetails: row.full_details ?? row.description,
    date: row.date,
    time: row.time,
    venue: row.venue,
    category: row.category,
    status: row.status,
    isFeatured: row.is_featured,
    // The cards render these straight into <Image src>; an empty string would
    // break the layout, so fall back to the stock artwork.
    imageUrl: row.image_url || DEFAULT_IMAGE,
    bannerUrl: row.banner_url || DEFAULT_BANNER,
    speakerNames: row.speaker_names ?? [],
    prerequisites: row.prerequisites ?? [],
    agenda: row.agenda ?? [],
    maxSeats: row.max_seats,
    // Older rows predate the column, so null reads as "no credits".
    eccPoints: row.ecc_points ?? 0,
    // Deliberately not a column. Seats taken is counted from
    // event_registrations through the event_seats RPC, never denormalised onto
    // the event row where it could drift from the truth.
    currentRegistrations: 0,
  };
}

const TO_COLUMN: Record<string, keyof EventRow> = {
  id: "id",
  title: "title",
  slug: "slug",
  description: "description",
  fullDetails: "full_details",
  date: "date",
  time: "time",
  venue: "venue",
  category: "category",
  status: "status",
  isFeatured: "is_featured",
  imageUrl: "image_url",
  bannerUrl: "banner_url",
  speakerNames: "speaker_names",
  prerequisites: "prerequisites",
  agenda: "agenda",
  maxSeats: "max_seats",
  eccPoints: "ecc_points",
};

/**
 * Converts the UI shape back to columns.
 *
 * Undefined keys are dropped, so a partial update never blanks a column it was
 * not asked to change. `currentRegistrations` has no entry in TO_COLUMN and so
 * is silently discarded — it has no column to write to.
 */
export function eventToRow(event: Partial<EventData>): Partial<EventRow> {
  const row: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(TO_COLUMN)) {
    const value = (event as Record<string, unknown>)[key];
    if (value !== undefined) row[column] = value;
  }
  return row as Partial<EventRow>;
}
