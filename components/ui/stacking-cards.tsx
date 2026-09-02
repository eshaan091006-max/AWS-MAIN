"use client";

import React, { useRef } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Cards that stack as you scroll, each settling behind the one after it.
 *
 * Every card sticks at its own offset so they come to rest on top of one
 * another, and the one underneath scales down and dims as the next arrives —
 * without that, the stack is just cards covering cards with no sense of depth.
 *
 * The scale is driven by the container's scroll progress, not each card's.
 * A stuck element's bounding rect stops moving by definition, so useScroll
 * pointed at the card itself reports a progress of zero for the entire time it
 * is pinned, which is exactly the stretch that needs to animate. The container
 * keeps moving throughout, so it is the only honest clock here.
 */
export function StackingCards({
  children,
  className,
  /** Distance between successive resting positions, in px. */
  step = 18,
  /** Where the first card comes to rest, below the fixed header. */
  top = 128,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  top?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const items = React.Children.toArray(children);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      {items.map((child, i) => (
        <StackingCard
          key={i}
          index={i}
          total={items.length}
          step={step}
          top={top}
          progress={scrollYProgress}
        >
          {child}
        </StackingCard>
      ))}
    </div>
  );
}

function StackingCard({
  children,
  index,
  total,
  step,
  top,
  progress,
}: {
  children: React.ReactNode;
  index: number;
  total: number;
  step: number;
  top: number;
  progress: MotionValue<number>;
}) {
  // The stretch of the container's scroll during which the next card travels up
  // and covers this one.
  const start = index / total;
  const end = (index + 1) / total;

  // The last card is never covered, so it must not shrink — otherwise the
  // section ends on a card that looks pushed away with nothing on top of it.
  const isLast = index === total - 1;
  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.9], {
    clamp: true,
  });
  const opacity = useTransform(progress, [start, end], [1, isLast ? 1 : 0.45], {
    clamp: true,
  });

  return (
    <div
      className="sticky"
      style={{ top: top + index * step, marginBottom: isLast ? 0 : 24 }}
    >
      <motion.div style={{ scale, opacity }} className="origin-top will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
