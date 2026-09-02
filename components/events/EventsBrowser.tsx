"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EventData } from "@/lib/data/initialData";
import { EventCard } from "@/components/events/EventCard";
import { LiquidButtonStyles } from "@/components/ui/liquid-button";
import { cn } from "@/lib/utils";

interface Props {
  events: EventData[];
}

const TABS = [
  { id: "ALL", label: "All" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "PAST", label: "Past" },
] as const;

export function EventsBrowser({ events }: Props) {
  const [tab, setTab] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  const featured =
    events.find((e) => e.isFeatured && e.status === "UPCOMING") ?? events[0] ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      const matches =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q);

      if (!matches) return false;
      if (tab === "UPCOMING") return event.status === "UPCOMING";
      if (tab === "PAST") return event.status === "COMPLETED";
      return true;
    });
  }, [events, query, tab]);

  const showFeatured = featured && !query && tab === "ALL";
  // Without this the featured event appears twice — once in the spotlight and
  // again in the grid directly beneath it.
  const gridEvents = showFeatured ? filtered.filter((e) => e.id !== featured.id) : filtered;

  const counts = useMemo(
    () => ({
      ALL: events.length,
      UPCOMING: events.filter((e) => e.status === "UPCOMING").length,
      PAST: events.filter((e) => e.status === "COMPLETED").length,
    }),
    [events]
  );

  return (
    <div className="relative pt-36 pb-28">
      <LiquidButtonStyles />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header. One eyebrow, one headline, one line of context — the old
            version also carried a badge, a two-clause title and a sentence of
            marketing copy that said the same thing three times. */}
        <header className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
            Events
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-[1.05]">
            Learn through <span className="text-gradient-orange">experience</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
            Workshops, hackathons and speaker sessions — every one built around doing.
          </p>
        </header>

        {/* Controls */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/70",
                    active
                      ? "bg-aws-orange text-black"
                      : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.07]"
                  )}
                >
                  {t.label}
                  <span className={cn("text-[10px] font-mono", active ? "text-black/60" : "text-zinc-600")}>
                    {counts[t.id as keyof typeof counts]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events"
              aria-label="Search events"
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-aws-orange/50 transition-colors"
            />
          </div>
        </div>

        {/* Featured */}
        {showFeatured && (
          <div className="mt-10 rounded-xl overflow-hidden border border-white/10">
            <EventCard event={featured} featured />
          </div>
        )}

        {/* Grid. Hairline gaps rather than bordered cards, matching the rest of
            the site — a border on every tile plus a gap between them reads as
            two frames around the same thing. */}
        {gridEvents.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/10">
            {gridEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          !showFeatured && (
            <div className="mt-10 py-20 text-center rounded-xl border border-white/10 bg-white/[0.04]">
              <p className="text-sm text-zinc-400">Nothing matches that.</p>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-3 text-xs font-semibold text-aws-orange hover:underline underline-offset-4"
                >
                  Clear search
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
