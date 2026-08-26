"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users, ArrowUpRight, Sparkles, Lock, Award } from "lucide-react";
import { EventData } from "@/lib/data/initialData";
import { RegistrationModal } from "@/components/events/RegistrationModal";
import { useSeatCount } from "@/lib/hooks/useSeatCount";

interface EventCardProps {
  event: EventData;
  featured?: boolean;
}

export function EventCard({ event, featured }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Previously this rendered the build-time seed, so a card could advertise
  // free seats for an event that had filled up since the last deploy.
  const { registered, maxSeats, isFull, refresh } = useSeatCount(
    event.id,
    event.currentRegistrations,
    event.maxSeats
  );

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div
        className={`group relative rounded-2xl overflow-hidden bg-navy-900/70 border border-white/10 hover:border-aws-orange/50 transition-all duration-300 flex flex-col justify-between shadow-xl ${
          featured ? "md:grid md:grid-cols-12 md:gap-6" : ""
        }`}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-aws-orange/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Image Container */}
        <div className={`relative overflow-hidden ${featured ? "md:col-span-5 h-64 md:h-full min-h-[220px]" : "h-52 w-full"}`}>
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-navy-950/80 backdrop-blur-md text-aws-orange border border-aws-orange/40">
              {event.category}
            </span>
            {event.eccPoints > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-950/85 backdrop-blur-md text-violet-300 border border-violet-400/40 flex items-center gap-1">
                <Award className="w-3 h-3" />
                {event.eccPoints} ECC
              </span>
            )}
            {event.status === "UPCOMING" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Upcoming
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900/80 text-slate-400 border border-white/10">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className={`p-5 flex flex-col justify-between flex-1 ${featured ? "md:col-span-7 md:p-6" : ""}`}>
          <div>
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5 text-aws-orange-light">
                <Calendar className="w-3.5 h-3.5 text-aws-orange" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {event.time}
              </span>
            </div>

            {/* Title */}
            <Link href={`/events/${event.slug}`} className="group-hover:text-aws-orange transition-colors">
              <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                {event.title}
              </h3>
            </Link>

            {/* Description */}
            <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {event.description}
            </p>

            {/* Venue & Capacity */}
            <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{registered} / {maxSeats} registered</span>
                </div>
                <div className="w-20 bg-navy-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full ${isFull ? "bg-slate-500" : "bg-aws-orange"}`}
                    style={{ width: `${Math.min(100, (registered / maxSeats) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex items-center gap-2.5">
            {event.status === "UPCOMING" && isFull ? (
              <div className="flex-1 py-2 px-3 rounded-xl bg-navy-950 border border-slate-600/50 text-slate-400 text-xs font-mono font-bold text-center flex items-center justify-center gap-1.5 grayscale">
                <Lock className="w-3.5 h-3.5" />
                <span>Slots Booked</span>
              </div>
            ) : event.status === "UPCOMING" ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-xs shadow-md shadow-aws-orange/15 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register Now</span>
              </button>
            ) : (
              <Link
                href={`/events/${event.slug}`}
                className="flex-1 py-2 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-semibold transition-all text-center border border-white/10"
              >
                View Recap & Slides
              </Link>
            )}

            <Link
              href={`/events/${event.slug}`}
              className="p-2 rounded-xl bg-navy-950 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/40 text-slate-300 hover:text-aws-orange transition-all"
              title="Full Details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refresh}
        isFull={isFull}
      />
    </>
  );
}
