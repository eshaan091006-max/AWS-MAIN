"use client";

import React, { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A panel with a soft light that follows the cursor across it.
 *
 * The pointer position is written to CSS custom properties on the element and
 * the highlight is a plain radial-gradient reading them — no state, so moving
 * the mouse never re-renders React. A useState here would re-render the card on
 * every mousemove event, which is exactly the pattern that makes a grid of
 * these janky.
 *
 * The highlight is opacity 0 until the pointer is inside, so cards do not glow
 * on a touch device where there is no cursor to justify it.
 */
export function SpotlightCard({
  as: Tag = "div",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "article" }) {
  const ref = useRef<HTMLElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--spot-x", `${x}px`);
    el.style.setProperty("--spot-y", `${y}px`);

    // The same two numbers drive a slight lean toward the cursor. Kept to a
    // few degrees: past that the text starts to look keystoned rather than
    // tilted, and a grid of cards reading at different angles is hard work.
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * 6).toFixed(2)}deg`);
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  return React.createElement(
    Tag,
    {
      ...props,
      ref: ref as React.Ref<never>,
      onMouseMove: onMove,
      onMouseLeave: onLeave,
      style: {
        transform:
          "perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
        transformStyle: "preserve-3d",
        // Only the settle is eased. Easing the follow as well makes the card
        // lag the cursor by a visible beat.
        transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        ...(props.style ?? {}),
      },
      className: cn("group/spot relative overflow-hidden will-change-transform", className),
    },
    <>
      {children}
      {/* Last, and not wrapping the children: an absolutely positioned sibling
          paints above non-positioned content anyway, and wrapping the card's
          contents would break the `space-y` rules that target its direct
          children. At 10% alpha and pointer-events-none, washing over the text
          is imperceptible and costs no layout risk. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,153,0,0.10), transparent 70%)",
        }}
      />
    </>
  );
}
