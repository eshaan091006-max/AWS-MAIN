"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before this one starts. Use to stagger siblings. */
  delay?: number;
}

/**
 * Fades and lifts its children the first time they scroll into view.
 *
 * Deliberately CSS transitions plus one IntersectionObserver rather than
 * framer-motion's `whileInView`.
 *
 * The framer version has to decide whether to apply the 24px travel *during
 * render*, and the only way to know is `useReducedMotion()`, which reads
 * matchMedia. The server cannot read matchMedia, so it renders the travel and
 * the client hydrates without it — a genuine hydration mismatch, and React
 * does not patch style attributes up afterwards. Here the starting state is a
 * class, identical on both sides, and `motion-reduce:` drops the travel in the
 * stylesheet where the media query belongs.
 *
 * Once revealed the observer disconnects: replaying on every pass turns a long
 * page into a flicker, and re-animating something you have already read is
 * noise rather than polish.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is missing, show the content rather than leaving
    // it invisible forever. A missing animation beats a blank page.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // `top < 0` means the block is already above the viewport — we are past
        // it. Without this it is possible to end up permanently invisible: the
        // observer only samples at frame boundaries, so a fast flick or an
        // anchor jump can carry a section from below the fold to above it
        // without ever landing on a frame where it intersects. Revealing on
        // "already passed" makes the miss self-correcting.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setShown(true);
          observer.disconnect();
        }
      },
      // Fires when a sixth of the block is visible, so tall sections do not sit
      // blank until you have already scrolled past their heading.
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-revealed={shown ? "true" : undefined}
      style={{ transitionDelay: `${delay}s` }}
      className={cn(
        "opacity-0 translate-y-6 will-change-[opacity,transform]",
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[revealed=true]:opacity-100 data-[revealed=true]:translate-y-0",
        // Reduced motion keeps the fade and drops the travel entirely.
        "motion-reduce:translate-y-0 motion-reduce:duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Reveals each child in turn rather than the block as a whole.
 *
 * Same mechanism as Reveal — one observer, CSS transitions, no reduced-motion
 * branch during render — with the delay stepped per child so a grid cascades
 * in instead of appearing all at once.
 */
export function RevealGroup({
  children,
  className,
  delay = 0,
  step = 0.07,
}: RevealProps & { /** Seconds between one child and the next. */ step?: number }) {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        // h-full, not display:contents — a contents box generates no layout, so
        // it cannot be given opacity or a transform and the reveal would
        // silently do nothing. The wrapper is the grid item and fills the cell.
        <Reveal key={i} delay={delay + i * step} className="h-full">
          {child}
        </Reveal>
      ))}
    </div>
  );
}
