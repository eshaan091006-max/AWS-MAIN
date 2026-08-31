"use client";

import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RandomLetterSwapProps {
  label: string;
  className?: string;
  /** Seconds between each letter starting its swap. */
  staggerDuration?: number;
  transition?: Transition;
  /** Rendered element. Use "span" when wrapping this in a Next <Link>. */
  as?: "span" | "button";
}

const LETTER_HEIGHT = "1.2em";

/**
 * Text whose letters swap for a second copy of themselves on hover, in a random
 * order rather than left to right.
 *
 * Each letter is a two-tall column inside a clipping box; hovering slides the
 * column up by exactly one letter, so the duplicate underneath takes its place.
 *
 * The order is reshuffled on every hover rather than computed once during
 * render. Shuffling at render time would give the server one order and the
 * client another — a hydration mismatch on every letter — and a fixed order
 * makes the effect the same every time you pass over it.
 *
 * The animated copy is aria-hidden with the real string carried in a visually
 * hidden span, so a screen reader reads "Contact" rather than seven separate
 * letters.
 */
export function RandomLetterSwap({
  label,
  className,
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring", bounce: 0 },
  as = "span",
}: RandomLetterSwapProps) {
  const [hovered, setHovered] = useState(false);
  const delays = useRef<number[]>([]);

  const shuffleDelays = useCallback(() => {
    const order = label.split("").map((_, i) => i);
    // Fisher-Yates.
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const next: number[] = new Array(label.length).fill(0);
    order.forEach((letterIndex, position) => {
      next[letterIndex] = position * staggerDuration;
    });
    delays.current = next;
  }, [label, staggerDuration]);

  const start = useCallback(() => {
    shuffleDelays();
    setHovered(true);
  }, [shuffleDelays]);

  const stop = useCallback(() => setHovered(false), []);

  const Tag = as;

  return (
    <Tag
      className={cn("relative inline-block", className)}
      onMouseEnter={start}
      onMouseLeave={stop}
      // Keyboard users get the same effect, since these are focusable links.
      onFocus={start}
      onBlur={stop}
    >
      <span className="sr-only">{label}</span>

      <span aria-hidden="true" className="inline-flex">
        {label.split("").map((char, i) => (
          <span
            key={`${char}-${i}`}
            className="relative inline-block overflow-hidden"
            style={{ height: LETTER_HEIGHT, lineHeight: LETTER_HEIGHT }}
          >
            <motion.span
              className="flex flex-col"
              animate={{ y: hovered ? "-50%" : "0%" }}
              transition={{ ...transition, delay: hovered ? delays.current[i] ?? 0 : 0 }}
            >
              {/* Two copies: the column is 2x a letter tall, so -50% lands the
                  second exactly where the first was. */}
              <span style={{ height: LETTER_HEIGHT, lineHeight: LETTER_HEIGHT }}>
                {char === " " ? " " : char}
              </span>
              <span style={{ height: LETTER_HEIGHT, lineHeight: LETTER_HEIGHT }}>
                {char === " " ? " " : char}
              </span>
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
