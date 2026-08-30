"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A progress rail pinned to the top of the viewport.
 *
 * On a single-page site the scrollbar is the only cue for how much is left, and
 * a 4,800px page makes that thumb tiny. This restates it as one deliberate line.
 *
 * `useSpring` over the raw scroll value so the bar eases rather than tracking
 * the wheel one-to-one, which reads as jittery on a trackpad.
 *
 * Driven entirely by transform, so it composites on the GPU and never triggers
 * layout while scrolling.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 bg-gradient-to-r from-aws-orange via-amber-400 to-ambient-violet"
    />
  );
}
