"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { DecodeText } from "@/components/ui/decode-text";

interface ScrollSectionProps {
  id: string;
  /** Small label above the title. */
  eyebrow: string;
  title: string;
  /** The half of the title set in the accent gradient. */
  highlight: string;
  sub?: string;
  /** Section number, shown as an oversized ghost numeral. */
  index?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * A section whose heading stays put while its content scrolls past it.
 *
 * Every section on the home page had the same shape — a heading, a gap, then a
 * grid — so the page read as one long column of near-identical blocks and the
 * headings scrolled away the moment you started reading the thing they were
 * introducing. Pinning the heading gives each section a fixed left edge to
 * scroll against, and the rule underneath fills as you move through it, so
 * there is some sense of how much of the section is left.
 *
 * Below `lg` there is not enough width for two columns, so the heading returns
 * to sitting above the content and stops being sticky.
 */
export function ScrollSection({
  id,
  eyebrow,
  title,
  highlight,
  sub,
  index,
  children,
  className,
}: ScrollSectionProps) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // Starts filling when the section reaches the bottom of the viewport and
    // completes when its end reaches the top.
    offset: ["start end", "end start"],
  });

  const progress = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  // The rule between sections draws itself as the section arrives, so one
  // section visibly hands over to the next instead of the page just changing
  // subject.
  const dividerScale = useTransform(scrollYProgress, [0, 0.18], [0, 1]);
  const dividerOpacity = useTransform(scrollYProgress, [0, 0.18, 0.9, 1], [0, 1, 1, 0.25]);

  // The heading lifts slightly on the way in and settles; it is the only thing
  // pinned, so a little travel makes the arrival legible.
  const headY = useTransform(scrollYProgress, [0, 0.22], [26, 0]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.16], [0, 1]);

  return (
    <section
      ref={ref}
      id={id}
      className={cn("relative px-4 sm:px-8 lg:px-12 py-24 scroll-mt-24", className)}
    >
      {/* Section divider. Scales from the left as the section comes up. */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: dividerScale, opacity: dividerOpacity }}
        className="absolute inset-x-4 sm:inset-x-8 lg:inset-x-12 top-0 h-px origin-left bg-gradient-to-r from-aws-orange/50 via-white/10 to-transparent"
      />

      <div className="max-w-6xl mx-auto grid items-start gap-10 lg:gap-16 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <motion.div style={{ y: headY, opacity: headOpacity }} className="relative lg:sticky lg:top-28">
          {index !== undefined && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -left-2 select-none text-[7rem] font-display font-bold leading-none text-white/[0.03]"
            >
              {String(index).padStart(2, "0")}
            </span>
          )}

          <div className="relative">
            {/* The eyebrow decodes rather than the headline: it is short, set
                in mono, and already uppercase, so scrambled glyphs sit on the
                same grid and nothing reflows. Doing it to the headline would
                jitter three lines of display type on every entrance. */}
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
              <DecodeText text={eyebrow.toUpperCase()} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight leading-[1.08]">
              {title} <span className="text-gradient-orange">{highlight}</span>
            </h2>
            {sub && (
              <p className="text-sm text-zinc-400 mt-4 leading-relaxed max-w-md">{sub}</p>
            )}

            {/* How far through the section you are. */}
            <div className="mt-7 h-px w-full max-w-[12rem] bg-white/[0.08]">
              <motion.div style={{ width: progress }} className="h-px bg-aws-orange" />
            </div>
          </div>
        </motion.div>

        <div>{children}</div>
      </div>
    </section>
  );
}
