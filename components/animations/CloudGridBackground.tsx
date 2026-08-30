"use client";

import React from "react";

/**
 * The ambient light behind the whole public site.
 *
 * Fixed rather than scrolling, so the light stays put while content moves
 * through it — the thing that gives a long single-page scroll a sense of depth
 * instead of reading as one very tall flat document.
 *
 * Indigo and violet, with one warm orange pool low down. Nothing here is ever
 * a control, which is what keeps AWS orange meaning "you can act on this"
 * everywhere else on the page. The old version mixed AWS blue, cyan and purple
 * into the same field, which is most of why the accent never stood out.
 */
export function CloudGridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Grid, masked to fade before it reaches any edge — a grid that runs to
          the viewport border reads as a texture bug rather than as depth. */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 85% 65% at 50% 35%, #000 25%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 65% at 50% 35%, #000 25%, transparent 78%)",
        }}
      />

      {/* Three pools, deliberately off-axis. A centred glow reads as a vignette;
          asymmetry reads as a light source. */}
      <div
        className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1100px] h-[850px] rounded-full blur-[130px] opacity-[0.15]"
        style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 65%)" }}
      />
      <div
        className="absolute top-[30%] -left-[15%] w-[750px] h-[750px] rounded-full blur-[150px] opacity-[0.10]"
        style={{ background: "radial-gradient(circle, #A78BFA 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-[-10%] -right-[15%] w-[850px] h-[850px] rounded-full blur-[150px] opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #FF9900 0%, transparent 65%)" }}
      />

      {/* Vignette, in the page's own background colour so the field never meets
          the top or bottom of the viewport as a hard edge. */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950 opacity-80" />
    </div>
  );
}
