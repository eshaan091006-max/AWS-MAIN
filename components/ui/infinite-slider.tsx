"use client";

import React, { useEffect, useState } from "react";
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

  return (
    <div
      className={cn(
        "group/slider relative w-full overflow-hidden",
        // Fades the row into the page at both ends instead of cutting it off
        // against a hard edge.
        "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className
      )}
    >
      <div
        className="flex w-max gap-5 animate-infinite-slide"
        style={{ animationDuration: `${seconds}s` }}
      >
        {items.map((child, i) => (
          <div key={`a-${i}`} className="shrink-0">
            {child}
          </div>
        ))}
        {items.map((child, i) => (
          <div key={`b-${i}`} className="shrink-0" aria-hidden="true" inert>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
