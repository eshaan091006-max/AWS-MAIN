"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Award, Check, Lock } from "lucide-react";
import { EventData } from "@/lib/data/initialData";
import { RegistrationModal } from "@/components/events/RegistrationModal";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useSeatCount } from "@/lib/hooks/useSeatCount";
import { useRegistered } from "@/lib/hooks/useRegistered";
import { cn } from "@/lib/utils";
import { hasRecap } from "@/config/eventRecaps";

interface EventCardProps {
  event: EventData;
  featured?: boolean;
}

export function EventCard({ event, featured }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Matches the server: registerForEvent refuses only a COMPLETED event, so an
  // ONGOING one still takes signups.
  const registrationClosed = event.status === "COMPLETED";

  const { isRegistered, markRegistered } = useRegistered(event.id);
  const { registered, maxSeats, isFull, refresh } = useSeatCount(
    event.id,
    event.currentRegistrations,
    event.maxSeats
  );

  const date = new Date(event.date);
  const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  const filled = maxSeats > 0 ? Math.min(100, (registered / maxSeats) * 100) : 0;

  return (
    <>
      <article
        className={cn(
          "group relative flex bg-navy-950/85 backdrop-blur-sm",
          featured ? "flex-col lg:flex-row" : "flex-col"
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden shrink-0",
            featured ? "h-56 lg:h-auto lg:w-[46%]" : "h-44"
          )}
        >
          <Image
            src={event.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes={featured ? "(max-width: 1024px) 100vw, 46vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />

          {/* Date, as a stamp rather than another line of text. */}
          <div className="absolute top-4 left-4 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-navy-950/85 backdrop-blur-sm border border-white/10">
            <span className="text-base font-display font-black text-white leading-none">{day}</span>
            <span className="text-[9px] font-mono text-zinc-500 mt-0.5">{month}</span>
          </div>

          {event.eccPoints > 0 && (
            <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-semibold bg-navy-950/85 backdrop-blur-sm text-ambient-violet border border-white/10">
              <Award className="w-3 h-3" />
              {event.eccPoints} ECC
            </span>
          )}
        </div>

        {/* Body */}
        <div className={cn("flex flex-col flex-1 p-5", featured && "lg:p-8 lg:justify-center")}>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-aws-orange">
            {event.category}
          </div>

          <Link href={`/events/${event.slug}`} className="mt-2">
            <h3
              className={cn(
                "font-display font-bold text-white leading-snug transition-colors group-hover:text-aws-orange",
                featured ? "text-2xl lg:text-3xl" : "text-base line-clamp-2"
              )}
            >
              {event.title}
            </h3>
          </Link>

          {/* The blurb is only on the featured card. On a three-up grid it was
              two clamped lines per tile, which read as noise rather than detail
              — and the same text is on the event's own page. */}
          {featured && (
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed max-w-xl line-clamp-3">
              {event.description}
            </p>
          )}

          <div className="mt-3 text-xs text-zinc-500 font-mono truncate">
            {event.time} · {event.venue}
          </div>

          {/* Seats. A hairline meter rather than a labelled bar with its own
              caption; the number above it already says what it means. */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1.5">
              <span>
                {registered}/{maxSeats} seats
              </span>
              {isFull && !registrationClosed && <span className="text-zinc-400">Full</span>}
            </div>
            <div className="h-px w-full bg-white/[0.08]">
              <div
                className={cn("h-px transition-all duration-500", isFull ? "bg-zinc-600" : "bg-aws-orange")}
                style={{ width: `${filled}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-2">
            {registrationClosed ? (
              <Link
                // A written recap when there is one, the event page otherwise —
                // the button said "Recap" while going to the registration page
                // either way before this.
                href={hasRecap(event.slug) ? `/events/${event.slug}/recap` : `/events/${event.slug}`}
                className="flex-1 py-2.5 px-4 rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.07] text-xs font-semibold text-center transition-all"
              >
                Recap
              </Link>
            ) : isRegistered ? (
              <div className="flex-1 py-2.5 px-4 rounded-full border border-aws-orange/40 bg-aws-orange/10 text-aws-orange text-xs font-semibold text-center inline-flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Registered
              </div>
            ) : isFull ? (
              <div className="flex-1 py-2.5 px-4 rounded-full border border-white/10 bg-white/[0.02] text-zinc-500 text-xs font-semibold text-center inline-flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Full
              </div>
            ) : (
              <LiquidButton
                type="button"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="flex-1"
              >
                Register
              </LiquidButton>
            )}

            <Link
              href={`/events/${event.slug}`}
              aria-label={`Details for ${event.title}`}
              className="p-2.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-aws-orange hover:border-aws-orange/40 transition-all shrink-0"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      <RegistrationModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refresh}
        isFull={isFull}
        onRegistered={() => markRegistered()}
      />
    </>
  );
}
