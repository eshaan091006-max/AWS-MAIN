import { describe, it, expect } from "vitest";
import { rowToEvent, eventToRow, type EventRow } from "@/lib/db/eventMapper";

const row: EventRow = {
  id: "event-1",
  title: "AWS Foundations",
  slug: "aws-foundations",
  description: "Intro",
  full_details: "Details",
  date: "2026-08-30T02:00:00Z",
  time: "2-4 PM",
  venue: "Bonet Lab",
  category: "BOOTCAMP",
  status: "UPCOMING",
  is_featured: true,
  image_url: "https://images.unsplash.com/a",
  banner_url: "https://images.unsplash.com/b",
  speaker_names: ["A"],
  prerequisites: ["Laptop"],
  agenda: [{ time: "10:00", title: "Kickoff", description: "Welcome" }],
  max_seats: 100,
};

describe("rowToEvent", () => {
  it("maps snake_case columns onto the camelCase shape the UI uses", () => {
    const e = rowToEvent(row);
    expect(e.isFeatured).toBe(true);
    expect(e.maxSeats).toBe(100);
    expect(e.fullDetails).toBe("Details");
    expect(e.imageUrl).toBe("https://images.unsplash.com/a");
    expect(e.bannerUrl).toBe("https://images.unsplash.com/b");
    expect(e.speakerNames).toEqual(["A"]);
  });

  it("defaults currentRegistrations to 0 — it is counted, not stored", () => {
    expect(rowToEvent(row).currentRegistrations).toBe(0);
  });

  it("survives null array and jsonb columns", () => {
    const sparse = { ...row, speaker_names: null, prerequisites: null, agenda: null };
    const e = rowToEvent(sparse as EventRow);
    expect(e.speakerNames).toEqual([]);
    expect(e.prerequisites).toEqual([]);
    expect(e.agenda).toEqual([]);
  });

  it("falls back to description when full_details is null", () => {
    expect(rowToEvent({ ...row, full_details: null }).fullDetails).toBe("Intro");
  });
});

describe("eventToRow", () => {
  it("round-trips back to columns", () => {
    expect(eventToRow(rowToEvent(row))).toMatchObject({
      is_featured: true,
      max_seats: 100,
      image_url: "https://images.unsplash.com/a",
      full_details: "Details",
    });
  });

  it("omits undefined fields so a patch never blanks a column it was not given", () => {
    expect(eventToRow({ title: "New" })).toEqual({ title: "New" });
  });

  it("never emits currentRegistrations, which has no column", () => {
    const out = eventToRow(rowToEvent(row)) as Record<string, unknown>;
    expect(out).not.toHaveProperty("currentRegistrations");
    expect(out).not.toHaveProperty("current_registrations");
  });
});
