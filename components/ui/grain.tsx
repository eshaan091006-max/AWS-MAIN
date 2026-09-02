import React from "react";

/**
 * A fixed film-grain layer over the whole page.
 *
 * Large flat areas of near-black band visibly on ordinary displays — the
 * gradients behind this site step rather than blend. A little noise breaks the
 * bands up and stops the dark surfaces reading as flat fills.
 *
 * The texture is an inline SVG turbulence rather than an image: no request, no
 * asset to keep, and it scales to any viewport. Server-rendered — it holds no
 * state and never changes, so there is nothing here worth a client bundle.
 */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
      }}
    />
  );
}
