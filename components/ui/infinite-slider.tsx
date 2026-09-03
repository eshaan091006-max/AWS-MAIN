"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A row that slides forever, looping seamlessly.
 *
 * The children are rendered twice and the track travels exactly -50%, so the
 * second copy lands where the first began and there is no seam. The track
 * itself carries no gap — each half holds its own trailing space — because a
 * gap between the copies makes -50% half a gap short of one copy's width, and
 * the row hitches once per pass.
 *
 * It only animates when one copy is actually wider than the frame. A row that
 * already fits has nothing to reveal by moving, and duplicating it just drags
 * the same items past themselves with gaps opening between the copies.
 *
 * The measured row never wraps, in either state. An earlier version laid the
 * short state out with flex-wrap, which cannot overflow by construction — so
 * once it measured "fits" it was guaranteed to keep measuring "fits", and a
 * five-card row that plainly overflowed stayed a static grid forever.
 *
 * It keeps moving under reduced motion, just more slowly. Stopping it dead is
 * not safe here: the track is wider than its frame, so a halted animation
 * inside overflow-hidden strands the last items. Hovering still holds it, which
 * is the pause mechanism WCAG 2.2.2 asks for.
 *
 * The duplicated half is aria-hidden and inert. aria-hidden alone leaves its
 * links focusable, landing a keyboard user on elements screen readers have been
 * told do not exist.
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

  const frameRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [gentle, setGentle] = useState(false);

  useEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      const half = halfRef.current;
      if (!frame || !half) return;
      setOverflows(half.scrollWidth > frame.clientWidth + 1);
    };
    measure();
    // Cards size from their content, so the answer changes as fonts and images
    // settle, not only on resize.
    const ro = new ResizeObserver(measure);
    if (frameRef.current) ro.observe(frameRef.current);
    if (halfRef.current) ro.observe(halfRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items.length]);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setGentle(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  const seconds = gentle ? duration * 1.5 : duration;

  return (
    <div
      ref={frameRef}
      className={cn(
        "group/slider relative w-full overflow-hidden",
        // Fades the row into the page at both ends rather than cutting it
        // against a hard edge — only meaningful once it actually moves.
        overflows &&
          "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className
      )}
    >
      <div
        className={cn("flex", overflows && "w-max animate-infinite-slide")}
        style={overflows ? { animationDuration: `${seconds}s` } : undefined}
      >
        <div ref={halfRef} className="flex gap-5 pr-5">
          {items.map((child, i) => (
            <div key={`a-${i}`} className="shrink-0">
              {child}
            </div>
          ))}
        </div>

        {overflows && (
          <div className="flex gap-5 pr-5" aria-hidden="true" inert>
            {items.map((child, i) => (
              <div key={`b-${i}`} className="shrink-0">
                {child}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
