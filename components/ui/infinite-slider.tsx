"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A row that slides forever, looping seamlessly.
 *
 * The children are rendered twice and the track travels exactly -50%, so the
 * second copy lands where the first began and there is no seam to catch. That
 * only holds if both halves are identical, which is why the duplicate is a
 * straight second render rather than a slice.
 *
 * Hovering holds it still. That is not only a nicety: these are links, and a
 * link that slides out from under the cursor mid-click is a trap. It doubles as
 * the pause mechanism WCAG 2.2.2 requires of anything that moves by itself for
 * more than five seconds.
 *
 * The duplicate is hidden from assistive tech, so a screen reader hears each
 * department once rather than twice.
 *
 * It only animates when the content is actually wider than the frame. A row
 * that already fits has nothing to reveal by moving, and looping it just drags
 * the same items past themselves with gaps opening between the copies — so a
 * short row renders as a plain centred row instead.
 *
 * It keeps moving under reduced motion, just much more slowly. Stopping it dead
 * is not an option here: the track is far wider than its container, so a halted
 * animation inside overflow-hidden leaves the last items unreachable — turning
 * off the motion would turn off the content. Hovering still holds it, which is
 * the pause mechanism WCAG 2.2.2 actually asks for.
 */
export function InfiniteSlider({
  children,
  className,
  /** Seconds for one full pass. Longer is slower. */
  duration = 46,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  const items = React.Children.toArray(children);

  // Read after mount: matchMedia does not exist on the server, and branching on
  // it during render is a hydration mismatch.
  const [gentle, setGentle] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setGentle(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  // Calmer under reduced motion, not comatose. At 3x the row crawls at about
  // 14px a second, which reads as broken rather than gentle; 1.5x is visibly
  // moving while still noticeably slower than the default.
  const seconds = gentle ? duration * 1.5 : duration;

  // Whether one copy of the content overflows the frame. Measured on the first
  // half only: the track always holds two copies, so its own width would say
  // "overflowing" even for a single item.
  const frameRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      const half = halfRef.current;
      if (!frame || !half) return;
      setOverflows(half.scrollWidth > frame.clientWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  if (!overflows) {
    return (
      <div ref={frameRef} className={cn("w-full", className)}>
        <div ref={halfRef} className="flex flex-wrap gap-5">
          {items.map((child, i) => (
            <div key={i}>{child}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={frameRef}
      className={cn(
        "group/slider relative w-full overflow-hidden",
        // Fades the row into the page at both ends instead of cutting it off
        // against a hard edge.
        "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className
      )}
    >
      <div
        // No gap on the track itself. Each half carries its own trailing space
        // instead, so the track is exactly two copies wide and -50% lands copy
        // two precisely where copy one began. A gap here would make the track
        // 2W + gap, and the loop would hitch by half a gap every pass.
        className="flex w-max animate-infinite-slide"
        style={{ animationDuration: `${seconds}s` }}
      >
        <div ref={halfRef} className="flex gap-5 pr-5">
          {items.map((child, i) => (
            <div key={`a-${i}`} className="shrink-0">
              {child}
            </div>
          ))}
        </div>
        <div className="flex gap-5 pr-5" aria-hidden="true" inert>
          {items.map((child, i) => (
            <div key={`b-${i}`} className="shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
