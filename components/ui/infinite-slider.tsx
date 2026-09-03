"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A row that scrolls itself forever and can also be scrolled by hand.
 *
 * The drift is applied to the frame's own scrollLeft rather than to a transform
 * on the track. That is what lets both work at once: a CSS transform and a
 * native scroll fight each other — the transform slides the content while the
 * scrollbar stays where it was, so dragging the row and letting it drift end up
 * disagreeing about where you are.
 *
 * The content is still rendered twice, and scrollLeft wraps by exactly one
 * copy's width whenever it passes it. Because both copies are identical, the
 * wrap lands on a pixel-identical view and is invisible — you can scroll
 * forever in either direction and never reach an end. Without the wrap you can
 * scroll off the second copy into empty space, which is what makes a duplicated
 * row read as "two sets of the same thing" rather than as a loop.
 *
 * Drift stops while the pointer is over the row or focus is inside it: these
 * are links, and one that slides out from under a click is a trap. That doubles
 * as the pause mechanism WCAG 2.2.2 requires.
 *
 * Reduced motion slows the drift rather than stopping it — the row is wider
 * than the frame, so stopping dead would be fine here only because it stays
 * hand-scrollable, but a slow drift reads better than a dead row and the
 * content is reachable either way.
 */
export function InfiniteSlider({
  children,
  className,
  /** Pixels per second of drift. */
  speed = 34,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const items = React.Children.toArray(children);

  const frameRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLDivElement>(null);
  const [duplicate, setDuplicate] = useState(false);

  // Held in refs, not state: they change on pointer events and every frame, and
  // re-rendering the row for either would be wasted work.
  const pausedRef = useRef(false);
  const speedRef = useRef(speed);
  // The drift position, kept as a float.
  //
  // Incrementing element.scrollLeft directly does not work: at 34px/s a frame
  // is about half a pixel, the property rounds the value away, and the next
  // frame reads back the same integer and adds half a pixel to it again. The
  // row sits still forever. Accumulating here and assigning the total each
  // frame is what actually moves it.
  const posRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      const half = halfRef.current;
      if (!frame || !half) return;
      // Only duplicate when one copy genuinely overflows. A short row that
      // fits has nothing to loop, and copying it just puts the same cards on
      // screen twice side by side.
      setDuplicate(half.scrollWidth > frame.clientWidth + 1);
    };
    measure();
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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      speedRef.current = reduce.matches ? speed * 0.45 : speed;
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, [speed]);

  useEffect(() => {
    if (!duplicate) return;
    const frame = frameRef.current;
    const half = halfRef.current;
    if (!frame || !half) return;

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // A backgrounded tab can
      last = now;                                    // report a huge delta.
      const width = half.scrollWidth;

      if (width > 0) {
        if (pausedRef.current) {
          // Hands on the row: follow wherever it was put, and keep that inside
          // the loop so releasing it carries on from the right place.
          let manual = frame.scrollLeft;
          if (manual >= width) manual -= width;
          else if (manual < 0) manual += width;
          if (manual !== frame.scrollLeft) frame.scrollLeft = manual;
          posRef.current = manual;
        } else {
          posRef.current += speedRef.current * dt;
          if (posRef.current >= width) posRef.current -= width;
          else if (posRef.current < 0) posRef.current += width;
          frame.scrollLeft = posRef.current;
        }
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const pause = () => (pausedRef.current = true);
    const resume = () => (pausedRef.current = false);
    frame.addEventListener("pointerenter", pause);
    frame.addEventListener("pointerleave", resume);
    frame.addEventListener("focusin", pause);
    frame.addEventListener("focusout", resume);
    frame.addEventListener("touchstart", pause, { passive: true });
    frame.addEventListener("touchend", resume, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener("pointerenter", pause);
      frame.removeEventListener("pointerleave", resume);
      frame.removeEventListener("focusin", pause);
      frame.removeEventListener("focusout", resume);
      frame.removeEventListener("touchstart", pause);
      frame.removeEventListener("touchend", resume);
    };
  }, [duplicate]);

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative w-full overflow-x-auto overscroll-x-contain",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        duplicate &&
          "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className
      )}
    >
      <div className="flex w-max">
        <div ref={halfRef} className="flex gap-5 pr-5">
          {items.map((child, i) => (
            <div key={`a-${i}`} className="shrink-0">
              {child}
            </div>
          ))}
        </div>

        {duplicate && (
          // aria-hidden alone would leave these links focusable, landing a
          // keyboard user on elements screen readers were told do not exist.
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
