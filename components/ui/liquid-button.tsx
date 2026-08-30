"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Inner padding/type size. */
  size?: "sm" | "md" | "lg";
} & (
  | ({ as?: "button" } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as: "a" } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
);

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

/**
 * A pill with a brushed-metal rim that keeps turning.
 *
 * The rim is a conic gradient on an oversized square that rotates behind the
 * face. The tidier-looking approach is an animated `--angle` custom property
 * with `@property`, but that silently does nothing in browsers without
 * registered custom properties — the gradient freezes at 0deg and the button
 * just looks slightly odd, with no error to notice. Rotating a real element is
 * plain transform work that composites on the GPU and behaves everywhere.
 *
 * The square is 250% of the pill so its corners still cover the rim when it is
 * turned 45 degrees; anything smaller leaves the ends bare for part of a turn.
 */
export function LiquidButton({ children, className, size = "md", ...rest }: Props) {
  const inner = (
    <>
      <span aria-hidden="true" className="lm-rim">
        <span className="lm-spin" />
      </span>
      <span className={cn("lm-face", SIZES[size])}>{children}</span>
    </>
  );

  const shared = cn(
    "lm relative inline-flex isolate rounded-full select-none",
    "transition-transform duration-200 active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/70 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
    className
  );

  if (rest.as === "a") {
    const { as: _as, ...anchorProps } = rest;
    return (
      <a className={shared} {...anchorProps}>
        {inner}
      </a>
    );
  }

  const { as: _as, ...buttonProps } = rest as { as?: "button" } & React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={shared} {...buttonProps}>
      {inner}
    </button>
  );
}

/**
 * Styles live here rather than in globals.css so the component is one file to
 * copy. Rendered once per button, which is fine — identical <style> content is
 * deduplicated by the browser's stylesheet cache.
 */
export function LiquidButtonStyles() {
  return (
    <style>{`
      .lm { padding: 1.5px; }
      .lm-rim {
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        overflow: hidden;
        z-index: -1;
      }
      .lm-spin {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 250%;
        aspect-ratio: 1;
        transform: translate(-50%, -50%);
        transform-origin: center;
        background: conic-gradient(
          from 0deg,
          #3f3f46 0deg,
          #d4d4d8 40deg,
          #71717a 80deg,
          #fafafa 130deg,
          #52525b 170deg,
          #ffb066 205deg,
          #a1a1aa 240deg,
          #ffffff 290deg,
          #3f3f46 340deg,
          #3f3f46 360deg
        );
        animation: lm-turn 5s linear infinite;
      }
      @keyframes lm-turn { to { transform: translate(-50%, -50%) rotate(360deg); } }

      .lm-face {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        border-radius: 9999px;
        font-weight: 600;
        color: #fafafa;
        letter-spacing: -0.01em;
        background:
          radial-gradient(120% 140% at 50% -30%, rgba(255,255,255,0.14), transparent 55%),
          linear-gradient(180deg, #232327 0%, #0f0f11 100%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.10),
          inset 0 -1px 0 rgba(0,0,0,0.6),
          0 10px 30px rgba(0,0,0,0.45);
        transition: background 200ms ease;
      }
      .lm:hover .lm-face {
        background:
          radial-gradient(120% 140% at 50% -30%, rgba(255,255,255,0.20), transparent 55%),
          linear-gradient(180deg, #2b2b30 0%, #141417 100%);
      }

      /* Not gated on prefers-reduced-motion. A still conic gradient does not
         read as brushed metal, it reads as a grey smear — the movement is the
         entire effect, and gating it meant the button looked broken to the
         person who asked for it. It is a 5s rotation inside a pill a few
         hundred pixels wide: no parallax, no scroll coupling, and nothing
         large enough to be a vestibular trigger. */
    `}</style>
  );
}
