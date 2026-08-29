"use client";

import React from "react";

/**
 * Wireframe solids drifting behind the console.
 *
 * Real CSS 3D — each is six bordered faces assembled with preserve-3d, so they
 * rotate as objects rather than as flat squares being skewed. No WebGL, no
 * render loop: the browser composites the transforms.
 *
 * Depth is declared per object and drives three things together — scale, blur
 * and how far it shifts with the cursor — because that is what separates
 * parallax from things sliding around at random.
 */
const OBJECTS = [
  { top: "12%", left: "8%", size: 108, depth: 0.35, spin: 34, delay: 0 },
  { top: "62%", left: "16%", size: 66, depth: 0.75, spin: 26, delay: -8 },
  { top: "22%", left: "78%", size: 132, depth: 0.25, spin: 44, delay: -3 },
  { top: "72%", left: "84%", size: 80, depth: 0.6, spin: 30, delay: -14 },
  { top: "44%", left: "46%", size: 168, depth: 0.15, spin: 56, delay: -20 },
  { top: "86%", left: "56%", size: 54, depth: 0.9, spin: 22, delay: -6 },
];

const FACES = ["fz", "fzb", "fx", "fxb", "fy", "fyb"] as const;

export function FloatingObjects() {
  return (
    <div className="adm-objects" aria-hidden="true">
      {OBJECTS.map((o, i) => (
        <div
          key={i}
          className="adm-obj"
          style={
            {
              top: o.top,
              left: o.left,
              "--size": `${o.size}px`,
              "--depth": o.depth,
              "--spin": `${o.spin}s`,
              "--delay": `${o.delay}s`,
            } as React.CSSProperties
          }
        >
          <div className="adm-cube">
            {FACES.map((f) => (
              <span key={f} className={`adm-face adm-${f}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
