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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {people.map((person, i) => {
        const isLead = person.kind === "lead";
        return (
          <Reveal
            key={person.name}
            delay={0.05 + i * 0.06}
            className={cn(
              "h-full",
              isLead ? "sm:col-span-2 lg:col-span-3" : "sm:col-span-1 lg:col-span-2"
            )}
          >
            <SpotlightCard
              as="article"
              className={cn(
                "h-full rounded-xl border bg-navy-950 transition-colors duration-300",
                isLead
                  ? "border-white/15 hover:border-aws-orange/40 p-7"
                  : "border-white/10 hover:border-white/25 p-5"
              )}
            >
              {/* The department's colour, behind its leads only — it marks the
                  top of the hierarchy without tinting every card on the page. */}
              {isLead && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
                    accent
                  )}
                />
              )}

              <div className="relative flex items-center gap-4">
                <PersonAvatar
                  name={person.name}
                  photo={person.photo}
                  index={i}
                  size={isLead ? "lg" : "sm"}
                />
                <div className="min-w-0">
                  <div
                    className={cn(
                      "font-display font-bold text-white tracking-tight leading-tight",
                      isLead ? "text-xl" : "text-base"
                    )}
                  >
                    {person.name}
                  </div>
                  {/* zinc-400, not the zinc-500/600 this page used before:
                      those measure 4.12:1 and 2.57:1 against this background
                      and both fail WCAG AA at this size. */}
                  <div className="mt-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 leading-relaxed">
                    {person.role}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        );
      })}
    </div>
  );
}
