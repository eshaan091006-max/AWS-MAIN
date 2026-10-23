"use client";

import React from "react";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { PersonAvatar } from "@/components/teams/PersonAvatar";
import { cn } from "@/lib/utils";

export interface DepartmentPerson {
  name: string;
  role: string;
  kind: "lead" | "coordinator";
  photo?: string;
}

/**
 * The department's people, in the same language as the rest of the site:
 * cursor spotlight, a slight lean toward the pointer, staggered entry.
 *
 * Hierarchy is carried by the width of the card, on a six-column grid — leads
 * take half a row, coordinators a third. Splitting the department into two
 * headed lists instead turns four people into two half-empty grids that read
 * as two broken sections rather than one team.
 *
 * The reveal wrapper is the grid item, which is why the column spans live on
 * it rather than on the card: a wrapper between the grid and its children
 * takes over as the grid item, and any span set inside it is simply ignored.
 *
 * `kind` is an explicit flag, never inferred from the role text. Those titles
 * have already been reworded twice — "Events Lead" became "Events Core
 * Committee Member" — and a string match would have silently demoted everyone
 * both times.
 */
export function DepartmentPeople({
  people,
  accent,
}: {
  people: DepartmentPerson[];
  /** The department's own gradient, e.g. "from-emerald-500/20 to-teal-500/10". */
  accent: string;
}) {
  const leads = people.filter((p) => p.kind === "lead");
  const coordinators = people.filter((p) => p.kind !== "lead");

  return (
    <div className="space-y-4">
      {/* Two grids, not one.
          A single grid packs greedily: with one lead spanning half a row, the
          first coordinator drops into the space beside it and the two ranks
          end up sharing a line. Separate grids guarantee the split without
          needing headings above each — the card sizes already say which is
          which. */}
      {leads.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            "sm:grid-cols-2"
          )}
        >
          {leads.map((person, i) => (
            <PersonCard key={person.name} person={person} index={i} accent={accent} isLead />
          ))}
        </div>
      )}

      {/* Two across even on a phone: coordinators are the long tail of the page,
          and one full-width portrait each is a lot of scrolling. */}
      {coordinators.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {coordinators.map((person, i) => (
            <PersonCard
              key={person.name}
              person={person}
              index={leads.length + i}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonCard({
  person,
  index,
  accent,
  isLead = false,
}: {
  person: DepartmentPerson;
  index: number;
  accent: string;
  isLead?: boolean;
}) {
  return (
    <Reveal delay={0.05 + index * 0.06} className="h-full">
      <SpotlightCard
        as="article"
        className={cn(
          "h-full rounded-xl border bg-navy-950 transition-colors duration-300",
          isLead
            ? "border-white/15 hover:border-aws-orange/40 p-3"
            : "border-white/10 hover:border-white/25 p-2 sm:p-3"
        )}
      >
        {/* The department's colour, behind its leads only — it marks the top of
            the hierarchy without tinting every card on the page. */}
        {isLead && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
              accent
            )}
          />
        )}

        <div className="relative">
          <PersonAvatar
            name={person.name}
            photo={person.photo}
            index={index}
            size="tile"
            className={isLead ? "aspect-square" : undefined}
          />
          <div className="px-1 pt-3 sm:pt-4 pb-1">
            <div
              className={cn(
                "font-display font-bold text-white tracking-tight leading-tight",
                isLead ? "text-2xl" : "text-sm sm:text-lg"
              )}
            >
              {person.name}
            </div>
            {/* zinc-400, not the zinc-500/600 this page used before: those
                measure 4.12:1 and 2.57:1 against this background and both fail
                WCAG AA at this size. */}
            <div className="mt-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 leading-relaxed">
              {person.role}
            </div>
          </div>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}
