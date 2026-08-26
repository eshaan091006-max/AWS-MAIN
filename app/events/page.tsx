"use client";

import React, { useState } from "react";
import { Calendar, Sparkles, Filter, Search, Award, Flame } from "lucide-react";
import { INITIAL_EVENTS } from "@/lib/data/initialData";
import { EventCard } from "@/components/events/EventCard";

export default function EventsPage() {
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "ALL", label: "All Events" },
    { id: "UPCOMING", label: "Upcoming" },
    { id: "PAST", label: "Past Events" },
  ];

  const featuredEvent = INITIAL_EVENTS.find((e) => e.isFeatured && e.status === "UPCOMING") || INITIAL_EVENTS[0];

  const filteredEvents = INITIAL_EVENTS.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === "ALL") return matchesSearch;
    if (selectedTab === "UPCOMING") return matchesSearch && event.status === "UPCOMING";
    if (selectedTab === "PAST") return matchesSearch && event.status === "COMPLETED";
    return matchesSearch;
  });

  return (
    <div className="relative pt-28 pb-20 overflow-hidden">
      {/* Header */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>COMMUNITY CALENDAR</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Events, Workshops & <span className="text-gradient-orange">Hackathons</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Elevate your cloud computing skills through our interactive coding workshops, flagship hackathons, and guest keynotes with AWS architects.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event title, venue, or technology..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-navy-900/90 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-aws-orange text-xs backdrop-blur-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flagship Event Spotlight (if available) */}
      {featuredEvent && !searchQuery && selectedTab === "ALL" && (
        <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pb-14">
          <div className="mb-4 flex items-center gap-2 text-xs font-mono text-aws-orange uppercase tracking-wider font-bold">
            <Flame className="w-4 h-4 text-aws-orange" />
            <span>Spotlight Flagship Gathering</span>
          </div>
          <EventCard event={featuredEvent} featured />
        </section>
      )}

      {/* Filter Tabs */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                selectedTab === tab.id
                  ? "bg-aws-orange text-black font-bold shadow-lg shadow-aws-orange/20"
                  : "bg-navy-900/80 text-slate-300 border border-white/10 hover:border-aws-orange/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20 bg-navy-900/40 rounded-3xl border border-white/5 space-y-2">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-bold text-white">No events match your selection</div>
            <p className="text-xs text-slate-400 font-mono">Try adjusting your search query or tab filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
