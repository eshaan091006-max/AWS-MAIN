"use client";

import React, { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** The final string, e.g. "2026", "5", "500+", "AWS". */
  value: string;
  /** Milliseconds for the whole count. */
  duration?: number;
  className?: string;
}

/**
 * Counts a number up the first time it scrolls into view.
 *
 * Values that are not numeric — "AWS" — are rendered as-is rather than
 * fudged into digits, so the same component can drive the whole stats row
 * without the caller having to know which of its entries happen to be numbers.
 *
 * The animation is rAF against a timestamp rather than a per-frame increment:
 * incrementing by a fixed step ties the result to the display's refresh rate,
 * so the same counter finishes at different times on a 60Hz and a 144Hz screen.
 *
 * Server-renders the final value. A counter that starts at zero in the HTML
 * shows "0" to anyone without JavaScript and reads as broken to a crawler.
 */
export function CountUp({ value, duration = 1400, className }: CountUpProps) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string>(value);

  useEffect(() => {
    if (target === null) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Reduced motion gets the number, not the journey.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // Ease-out cubic: fast to begin, settling on the final value.
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(target * eased) + suffix);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay("0" + suffix);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
