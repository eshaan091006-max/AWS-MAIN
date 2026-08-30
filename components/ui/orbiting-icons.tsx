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
  /** Brand colour for the glyph. */
  color: string;
}

/**
 * The tiles that orbit behind the contact hero.
 *
 * A mix of the club's live channels and the stack it teaches, so the field
 * reads as "the world this club lives in" rather than a random logo wall.
 *
 * Deliberately no Discord, LinkedIn or WhatsApp: those three have no confirmed
 * URL, and putting their marks in the backdrop would advertise channels the
 * page cannot actually send anyone to.
 */
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

const RING_INNER: Tile[] = [
  { Icon: FaAws, color: "#FF9900" },
  { Icon: SiGmail, color: "#EA4335" },
  { Icon: SiReact, color: "#61DAFB" },
  { Icon: SiTypescript, color: "#3178C6" },
  { Icon: SiNextdotjs, color: "#F5F5F5" },
  { Icon: SiPython, color: "#3776AB" },
];

/**
 * Deterministic pseudo-random in [-1, 1], seeded by index.
 *
 * Integer math on purpose. The obvious version of this is
 * `Math.sin(seed * 127.1) * 43758.5453`, and it does not work here: Math.sin is
 * only required to be *approximately* correct, so Node and the browser can
 * disagree in the low digits. That difference reaches the DOM as
 * `rotate(212.93deg)` server-side against `rotate(212.9296755187097deg)` on the
 * client — a hydration mismatch on every tile, which React does not patch up.
 *
 * Math.imul, xor and unsigned shift are all exactly specified, so this returns
 * the identical bits in both places.
 */
function jitter(seed: number) {
  let x = Math.imul(seed + 1, 2654435761) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 3266489917) >>> 0;
  x ^= x >>> 16;
  return (x / 4294967295) * 2 - 1;
}

interface RingProps {
  tiles: Tile[];
  radiusX: number;
  radiusY: number;
  size: number;
  blur: number;
  opacity: number;
  spinClass: string;
  seedOffset: number;
}

function Ring({ tiles, radiusX, radiusY, size, blur, opacity, spinClass, seedOffset }: RingProps) {
  return (
    <div className={`absolute inset-0 ${spinClass}`} style={{ opacity }}>
      {tiles.map((tile, i) => {
        // Nudge each tile off its exact slot so the ring does not read as a
        // clock face.
        const angle = (i / tiles.length) * 360 + jitter(i + seedOffset) * 16;
        const rad = (angle * Math.PI) / 180;
        // Elliptical, not circular. A hero is roughly twice as wide as it is
        // tall, so a circle of this radius would park most of its tiles above
        // and below the section, where they are simply clipped away.
        const x = (Math.cos(rad) * radiusX).toFixed(2);
        const y = (Math.sin(rad) * radiusY).toFixed(2);
        const tilt = (jitter(i + seedOffset + 50) * 26).toFixed(2);
        const scale = (1 + jitter(i + seedOffset + 100) * 0.16).toFixed(3);
        const Icon = tile.Icon;

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${tilt}deg) scale(${scale})`,
            }}
          >
            <div
              className="flex items-center justify-center rounded-[22%] border border-white/10"
              style={{
                width: size,
                height: size,
                filter: blur > 0 ? `blur(${blur}px)` : undefined,
                background:
                  "linear-gradient(145deg, rgba(39,39,42,0.95), rgba(18,18,20,0.95))",
                boxShadow: "0 8px 24px rgba(0,0,0,0.55)",
              }}
            >
              <Icon style={{ color: tile.color, width: size * 0.52, height: size * 0.52 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Three counter-rotating rings of app-icon tiles on a tilted plane.
 *
 * This is the waitlist-hero backdrop rebuilt from parts. The original achieved
 * it with three PNGs from framerusercontent.com — sheets of app icons baked
 * into an image, spun as a whole. Real elements instead: no cross-origin
 * requests for decoration, nothing that breaks when someone else's CDN rotates
 * its assets, and the icons can be the ones that actually mean something here.
 *
 * Depth comes from the outer ring being larger and blurrier than the inner one,
 * which is what sells it as a field you are looking into rather than a circle
 * of logos.
 */
export function OrbitingIcons() {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes orbit-cw  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes orbit-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .orbit-cw-slow  { animation: orbit-cw  120s linear infinite; }
        .orbit-ccw-mid  { animation: orbit-ccw 90s  linear infinite; }
        .orbit-cw-fast  { animation: orbit-cw  70s  linear infinite; }
        .orbit-ccw-slowest { animation: orbit-ccw 160s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .orbit-cw-slow, .orbit-ccw-mid, .orbit-cw-fast, .orbit-ccw-slowest { animation: none; }
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          perspective: "1200px",
          transform: "perspective(1200px) rotateX(15deg)",
          transformOrigin: "center bottom",
          // Feathered rather than clipped: a rotateX'd plane cut off at the
          // container leaves its straight edges showing as a trapezoid.
          maskImage: "radial-gradient(ellipse 92% 85% at 50% 42%, #000 40%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 92% 85% at 50% 42%, #000 40%, transparent 88%)",
        }}
      >
        <Ring
          tiles={RING_FAR}
          radiusX={880}
          radiusY={470}
          size={116}
          blur={11}
          opacity={0.55}
          spinClass="orbit-ccw-slowest"
          seedOffset={600}
        />
        <Ring
          tiles={RING_OUTER}
          radiusX={620}
          radiusY={330}
          size={92}
          blur={6}
          opacity={0.78}
          spinClass="orbit-cw-slow"
          seedOffset={0}
        />
        <Ring
          tiles={RING_MID}
          radiusX={430}
          radiusY={235}
          size={66}
          blur={2}
          opacity={0.85}
          spinClass="orbit-ccw-mid"
          seedOffset={200}
        />
        <Ring
          tiles={RING_INNER}
          radiusX={260}
          radiusY={150}
          size={48}
          blur={0}
          opacity={0.9}
          spinClass="orbit-cw-fast"
          seedOffset={400}
        />
      </div>

      {/* A little warmth behind the tiles so they sit in light rather than on
          flat black. */}
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
