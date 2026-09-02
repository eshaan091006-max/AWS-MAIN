"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { DepartmentNode } from "@/config/teamHierarchy";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";
import { cn } from "@/lib/utils";

interface Props {
  departments: DepartmentNode[];
}

export function DepartmentGrid({ departments }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ shown: { transition: { staggerChildren: 0.08 } } }}
      onMouseLeave={() => setHovered(null)}
      className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/10"
    >
      {departments.map((dept, i) => {
        const leads = dept.vcps.length;
        // De-duplicated across both sources so this matches the tile count on
        // the department page itself.
        const members = new Set([
          ...dept.vcps.flatMap((v) => v.coordinators ?? []),
          ...(dept.coordinators ?? []),
        ]).size;
        const isActive = hovered === dept.id;
        const isDimmed = hovered !== null && !isActive;

        return (
          <motion.div
            key={dept.id}
            variants={{
              hidden: { opacity: 0, y: 28 },
              shown: {
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 240, damping: 24 },
              },
            }}
            animate={{ opacity: isDimmed ? 0.45 : 1 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHovered(dept.id)}
            className="relative h-full"
          >
            <Link
              href={`/teams/${dept.slug}`}
              className="group relative flex h-full flex-col bg-navy-950/85 p-8 sm:p-10 backdrop-blur-sm overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/60 focus-visible:ring-inset"
            >
              {/* The department's own colour, only while it is the one being
                  looked at. */}
              <motion.span
                aria-hidden="true"
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent",
                  dept.color
                )}
              />

              {/* Oversized index, the way the footer uses its wordmark. */}
              <motion.span
                aria-hidden="true"
                animate={{ opacity: isActive ? 0.09 : 0.035, scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="pointer-events-none absolute -bottom-8 -right-2 font-display font-black leading-none text-[9rem] text-white select-none"
              >
                {String(i + 1).padStart(2, "0")}
              </motion.span>

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-aws-orange">
                    {dept.code}
                  </span>
                  <motion.span
                    animate={{
                      x: isActive ? 3 : 0,
                      y: isActive ? -3 : 0,
                      rotate: isActive ? 45 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={cn(isActive ? "text-aws-orange" : "text-zinc-600")}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </motion.span>
                </div>

                <h2 className="mt-5 text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
                  <RandomLetterSwap label={dept.name} staggerDuration={0.018} />
                </h2>
                <p className="text-sm text-zinc-500 mt-1.5">{dept.shortName}</p>

                <div className="mt-8 flex items-center gap-3">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {leads} {leads === 1 ? "lead" : "leads"}
                    {members > 0 && ` · ${members} ${members === 1 ? "member" : "members"}`}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ width: isActive ? 56 : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="h-px bg-aws-orange"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
