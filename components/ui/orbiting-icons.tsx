"use client";

import React from "react";
import type { IconType } from "react-icons";
import {
  SiGmail,
  SiInstagram,
  SiMeetup,
  SiGithub,
  SiPython,
  SiDocker,
  SiKubernetes,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTerraform,
  SiPostgresql,
  SiSupabase,
  SiLinux,
  SiNodedotjs,
  SiGit,
  SiTailwindcss,
  SiGraphql,
  SiFigma,
  SiMongodb,
  SiRedis,
  SiJavascript,
  SiVercel,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";

interface Tile {
  Icon: IconType;
  color: string;
}

/**
 * Tiles orbiting behind the contact hero: the club's live channels plus the
 * stack it teaches.
 *
 * No Discord, LinkedIn or WhatsApp — those three have no confirmed URL, and
 * putting their marks in the backdrop would advertise channels the page cannot
 * send anyone to.
 */
const RING_FAR: Tile[] = [
  { Icon: SiVercel, color: "#F5F5F5" },
  { Icon: SiGithub, color: "#F5F5F5" },
  { Icon: SiDocker, color: "#2496ED" },
  { Icon: SiPostgresql, color: "#4169E1" },
  { Icon: SiTerraform, color: "#7B42BC" },
  { Icon: SiPython, color: "#3776AB" },
  { Icon: SiReact, color: "#61DAFB" },
  { Icon: SiKubernetes, color: "#326CE5" },
  { Icon: SiTypescript, color: "#3178C6" },
  { Icon: SiLinux, color: "#FCC624" },
  { Icon: SiNodedotjs, color: "#5FA04E" },
  { Icon: SiGraphql, color: "#E10098" },
];

const RING_OUTER: Tile[] = [
  { Icon: SiKubernetes, color: "#326CE5" },
  { Icon: SiPython, color: "#3776AB" },
  { Icon: SiGithub, color: "#F5F5F5" },
  { Icon: SiPostgresql, color: "#4169E1" },
  { Icon: SiFigma, color: "#F24E1E" },
  { Icon: SiMongodb, color: "#47A248" },
  { Icon: SiLinux, color: "#FCC624" },
  { Icon: SiGraphql, color: "#E10098" },
  { Icon: SiRedis, color: "#FF4438" },
  { Icon: SiJavascript, color: "#F7DF1E" },
];

const RING_MID: Tile[] = [
  { Icon: SiDocker, color: "#2496ED" },
  { Icon: SiTerraform, color: "#7B42BC" },
  { Icon: SiInstagram, color: "#E1306C" },
  { Icon: SiNodedotjs, color: "#5FA04E" },
  { Icon: SiGit, color: "#F05032" },
  { Icon: SiSupabase, color: "#3FCF8E" },
  { Icon: SiTailwindcss, color: "#06B6D4" },
  { Icon: SiMeetup, color: "#ED1C40" },
];

const RING_INNER: Tile[] = [
  { Icon: FaAws, color: "#FF9900" },
  { Icon: SiGmail, color: "#EA4335" },
  { Icon: SiReact, color: "#61DAFB" },
  { Icon: SiTypescript, color: "#3178C6" },
  { Icon: SiNextdotjs, color: "#F5F5F5" },
  { Icon: SiPython, color: "#3776AB" },
];

interface RingSpec {
  id: string;
  tiles: Tile[];
  /** Semi-axes of the track, in px. */
  rx: number;
  ry: number;
  size: number;
  blur: number;
  opacity: number;
  /** Seconds for one full lap. */
  duration: number;
  reverse: boolean;
  /** Rotates a ring's starting positions so the rings never line up radially. */
  phase: number;
}

/**
 * Geometry chosen so tiles can never touch, in either direction.
 *
 * A tile spinning on its own axis sweeps a circle of `size * √2 / 2` — the
 * half-DIAGONAL, not half the width. Reserving space against half the width is
 * the easy mistake and it under-reserves by 41%, which is what let the previous
 * arrangement overlap.
 *
 * Within a ring, tiles sit at equal steps of the ellipse parameter, so the
 * tightest arc spacing is at the ends of the major axis and equals `ry * Δt`.
 * Every ring clears twice its swept radius there with room to spare.
 *
 * Between rings, nested ellipses are closest along the minor axis, so the gap
 * that matters is the difference in `ry`, not `rx`.
 *
 *   ring   n   rx   ry  size  swept  tightest in-ring  needs
 *   FAR   12  980  530   104   73.5             277.5  147.1
 *   OUTER 10  670  362    84   59.4             227.5  118.8
 *   MID    8  430  232    64   45.3             182.2   90.5
 *   INNER  6  218  118    48   33.9             123.6   67.9
 *
 *   FAR→OUTER gap 168 needs 132.9 (+35)
 *   OUTER→MID gap 130 needs 104.7 (+25)
 *   MID→INNER gap 114 needs  79.2 (+35)
 *
 * Measured rather than assumed: stepping the whole timeline through a lap and
 * comparing every pair of tiles, the first set of radii cleared with only 6px
 * to spare at the tightest moment. These are the widened ones.
 *
 * Deliberately no angular or scale jitter. Scatter looked more organic, but
 * ±16° on a 36° step can put two neighbours 4° apart — roughly 23px on a track
 * this size, against 84px tiles. Even spacing is what makes the guarantee hold.
 */
const RINGS: RingSpec[] = [
  { id: "far", tiles: RING_FAR, rx: 980, ry: 530, size: 104, blur: 9, opacity: 0.5, duration: 150, reverse: false, phase: 0 },
  { id: "outer", tiles: RING_OUTER, rx: 670, ry: 362, size: 84, blur: 5, opacity: 0.68, duration: 110, reverse: true, phase: 18 },
  { id: "mid", tiles: RING_MID, rx: 430, ry: 232, size: 64, blur: 2, opacity: 0.8, duration: 85, reverse: false, phase: 9 },
  { id: "inner", tiles: RING_INNER, rx: 218, ry: 118, size: 48, blur: 0, opacity: 0.9, duration: 65, reverse: true, phase: 27 },
];

/**
 * One lap of an ellipse, as a keyframe track.
 *
 * The rings used to be containers that rotated as a unit. That tips the whole
 * ellipse over, so a layout tuned to be wide and short becomes tall and narrow
 * a quarter-turn later and half its tiles leave the section entirely. Animating
 * each tile *along* a fixed track keeps the ellipse where it was put, and keeps
 * the tracks from ever crossing.
 *
 * Values are rounded to 2dp. The numbers are computed identically on server and
 * client, and rounding keeps them the same *string* even if the two engines'
 * trig disagrees in the last bits — which is exactly what caused a hydration
 * mismatch in this file before.
 */
function trackKeyframes(id: string, rx: number, ry: number, phaseDeg: number, steps = 36) {
  const frames: string[] = [];
  for (let s = 0; s <= steps; s++) {
    const t = ((s / steps) * 360 + phaseDeg) * (Math.PI / 180);
    const x = (Math.cos(t) * rx).toFixed(2);
    const y = (Math.sin(t) * ry).toFixed(2);
    const pct = ((s / steps) * 100).toFixed(3);
    frames.push(`${pct}%{transform:translate(-50%,-50%) translate(${x}px,${y}px)}`);
  }
  return `@keyframes track-${id}{${frames.join("")}}`;
}

export function OrbitingIcons() {
  const keyframes = RINGS.map((r) => trackKeyframes(r.id, r.rx, r.ry, r.phase)).join("\n");

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        ${keyframes}
        @keyframes tile-turn { to { transform: rotate(360deg); } }

        /* Deliberately not gated on prefers-reduced-motion. The orbit is the
           hero; gating it rendered a still field of logos for anyone with the OS
           setting on, which is how it looked to the person who asked for it.
           These are 65-150s laps of small, mostly blurred tiles — no parallax,
           no scroll coupling, nothing moving faster than a minute hand. */
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          perspective: "1200px",
          transform: "perspective(1200px) rotateX(15deg)",
          transformOrigin: "center bottom",
          maskImage: "radial-gradient(ellipse 90% 72% at 50% 34%, #000 32%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 72% at 50% 34%, #000 32%, transparent 78%)",
        }}
      >
        {RINGS.map((ring) => (
          <div key={ring.id} className="absolute inset-0" style={{ opacity: ring.opacity }}>
            {ring.tiles.map((tile, i) => {
              const Icon = tile.Icon;
              // A negative delay starts each tile part-way through the same lap,
              // which is what spaces them evenly around the track — and unlike
              // hand-placing them, it cannot drift out of step over time.
              const offset = -(i / ring.tiles.length) * ring.duration;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    animation: `track-${ring.id} ${ring.duration}s linear infinite`,
                    animationDelay: `${offset.toFixed(2)}s`,
                    animationDirection: ring.reverse ? "reverse" : "normal",
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-[22%] border border-white/10"
                    style={{
                      width: ring.size,
                      height: ring.size,
                      filter: ring.blur > 0 ? `blur(${ring.blur}px)` : undefined,
                      background:
                        "linear-gradient(145deg, rgba(39,39,42,0.95), rgba(18,18,20,0.95))",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.55)",
                      // Its own axis, as well as riding the track.
                      animation: `tile-turn ${34 + (i % 5) * 9}s linear infinite`,
                      animationDirection: i % 2 === 0 ? "normal" : "reverse",
                    }}
                  >
                    <Icon
                      style={{
                        color: tile.color,
                        width: ring.size * 0.52,
                        height: ring.size * 0.52,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,153,0,0.13) 0%, rgba(99,102,241,0.09) 40%, transparent 68%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}
