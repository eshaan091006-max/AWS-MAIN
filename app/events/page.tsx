import React from "react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { EventsBrowser } from "@/components/events/EventsBrowser";

// Events come from the database now, so this page cannot be baked at build
// time. Revalidating every minute keeps it cheap while making a newly created
// event appear without a redeploy; the admin API also revalidates on demand,
// so in practice a save shows up immediately.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events, Workshops & Hackathons",
  description:
    "Interactive coding workshops, flagship hackathons, and guest keynotes with AWS architects at St. Xavier's College.",
};

export default async function EventsPage() {
  const events = await db.listEvents();
  return <EventsBrowser events={events} />;
}
