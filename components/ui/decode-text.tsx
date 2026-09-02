"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\<>[]{}=+*#%$";

interface DecodeTextProps {
  text: string;
  className?: string;
  /** Milliseconds each character spends scrambled before it settles. */
  duration?: number;
}

/**
 * Text that lands as noise and resolves left to right the first time it is
 * scrolled into view.
 *
 * The server renders the finished string, and scrambling only ever starts from
 * an effect. Rendering random glyphs would put different markup on the server
 * and the client — the hydration mismatch this project has hit twice — and
 * would leave anyone without JavaScript reading gibberish rather than a
 * heading.
 *
 * Characters resolve on a schedule rather than per frame, so the effect takes
 * the same time on a 60Hz and a 144Hz display, and spaces are never scrambled
 * so the word shapes hold while the letters churn.
 */
export function DecodeText({ text, className, duration = 620 }: DecodeTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const chars = text.split("");
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // How far along the string the "settled" boundary has travelled.
          const settled = t * chars.length;
          setDisplay(
            chars
              .map((c, i) => {
                if (c === " " || i < settled) return c;
                return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              })
              .join("")
          );
          if (t < 1) frame = requestAnimationFrame(tick);
          else setDisplay(text);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [text, duration]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {/* The real string for assistive tech and for copy-paste; the scrambling
          copy is decorative and hidden from both. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
