"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";

export interface TeamMember {
  id: string;
  name: string;
  /**
   * Whether this person leads. An explicit flag rather than matching the role
   * text: roles read "Events Lead", "PR Lead" and so on, so a check for the
   * exact word "lead" would quietly demote every one of them to a member and
   * leave the cluster with no centre.
   */
  kind: "lead" | "member";
  /** Display label, e.g. "Events Lead". */
  role: string;
  /**
   * Optional. Without one, a monogram is drawn instead.
   *
   * These are real, named students. Filling the grid with stock portraits of
   * strangers would put an unrelated person's face under someone's name, so a
   * missing photo stays missing and reads as a monogram until a real one is
   * supplied.
   */
  image?: string;
  social?: { linkedin?: string; instagram?: string; github?: string };
}

interface TeamShowcaseProps {
  members: TeamMember[];
  /** Tailwind gradient stops for the ambient wash behind the cluster. */
  accent?: string;
  className?: string;
}

const TINTS = [
  "from-aws-orange/35 via-amber-600/12",
  "from-indigo-500/35 via-violet-500/12",
  "from-violet-400/35 via-fuchsia-500/12",
  "from-amber-400/35 via-orange-600/12",
  "from-sky-500/30 via-indigo-500/12",
  "from-rose-400/30 via-orange-500/12",
];

/** Deterministic 0..1. Integer ops only, so server and client agree exactly. */
function hash01(seed: number) {
  let x = Math.imul(seed + 1, 2654435761) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519) >>> 0;
  x ^= x >>> 13;
  return (x >>> 0) / 4294967295;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface Placed {
  member: TeamMember;
  index: number;
  /** Percentage of stage width / height. */
  x: number;
  y: number;
  /** Tile width, as a percentage of stage width. */
  w: number;
  isCentre: boolean;
}

/**
 * Stage geometry, in "width units": the stage is 100 wide and 80 tall, which is
 * the 5:4 box the container is locked to. Everything — positions and tile sizes
 * alike — is expressed as a share of the stage, so the whole arrangement scales
 * together and the spacing proved below holds at any viewport width.
 */
const STAGE_H = 80;
const TILE_RATIO = 1.2;
const GAP = 2.6;
const CENTRE_W = 26;

/**
 * Places the cluster: the first lead at the centre, everyone else around it.
 *
 * Satellites sit on the boundary of a RECTANGLE, not an ellipse. On an ellipse
 * a satellite at a diagonal angle ends up short on both axes at once — its x
 * separation and its y separation are each about 70% of the semi-axis — and the
 * tiles overlap, which is exactly what the previous version did. On a rectangle
 * at least one axis is always at its full required separation, so no satellite
 * can touch the centre.
 *
 * The rectangle's half-extents are the two tiles' half-sizes plus a gap, which
 * makes the clearance a property of the construction rather than of the numbers
 * happening to work out. Checked for 1 to 5 satellites: no overlapping pair,
 * every tile inside the stage, tightest gap 2.6 width-units throughout.
 */
function place(members: TeamMember[]): Placed[] {
  const isLead = (m: TeamMember) => m.kind === "lead";
  const centre = members.find(isLead) ?? members[0];
  const rest = members.filter((m) => m.id !== centre.id);

  const placed: Placed[] = [
    { member: centre, index: members.indexOf(centre), x: 50, y: 40, w: CENTRE_W, isCentre: true },
  ];

  const halfCX = CENTRE_W / 2;
  const halfCY = (CENTRE_W * TILE_RATIO) / 2;
  // Fewer satellites means each can afford to be larger.
  const satW = Math.max(15, 18.5 - rest.length * 0.8);

  rest.forEach((m, i) => {
    const idx = members.indexOf(m);
    const step = 360 / Math.max(rest.length, 1);

    // A second lead is drawn larger, so the clearance rectangle has to be built
    // from THIS satellite's size rather than the base one — sizing the rectangle
    // once from the smaller value pushed the bigger tile off the stage.
    // MAX_SAT_W is what keeps the far edge inside: halfCY + 2*halfSY + GAP <= 40.
    const MAX_SAT_W = 18;
    const w = Math.min(MAX_SAT_W, isLead(m) ? satW * 1.15 : satW);
    const halfSX = w / 2;
    const halfSY = (w * TILE_RATIO) / 2;
    const rectX = halfCX + halfSX + GAP;
    const rectY = halfCY + halfSY + GAP;
    // A small deterministic wobble so the ring is not a clock face. Capped well
    // inside the step so neighbours cannot close on each other.
    const angle = -90 + i * step + (hash01(idx) - 0.5) * (step * 0.22);
    const t = (angle * Math.PI) / 180;
    const c = Math.cos(t);
    const sn = Math.sin(t);
    // Distance to the rectangle's edge along this ray.
    const k = 1 / Math.max(Math.abs(c) / rectX, Math.abs(sn) / rectY);

    placed.push({
      member: m,
      index: idx,
      x: 50 + k * c,
      y: 40 + k * sn,
      w,
      isCentre: false,
    });
  });

  return placed;
}

export default function TeamShowcase({ members, accent, className }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (members.length === 0) return null;
  const placed = place(members);
  const centre = placed[0];

  return (
    <div
      className={cn("flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full", className)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* Stage */}
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ shown: { transition: { staggerChildren: 0.09 } } }}
        className="relative w-full lg:flex-[1.4] aspect-[5/4] select-none [perspective:1200px]"
      >
        {/* Ambient wash, so the centre sits in light rather than on flat black. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] aspect-square rounded-full blur-[80px] bg-gradient-to-br to-transparent",
            accent ?? "from-aws-orange/20 via-indigo-500/10"
          )}
        />

        {/* Spokes from the centre out to each satellite. Drawn behind the tiles
            in the same percentage space, so they stay attached at any size. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full"
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
        >
          {placed.slice(1).map((p) => {
            const lit = hoveredId === p.member.id || hoveredId === centre.member.id;
            return (
              <line
                key={p.member.id}
                x1={centre.x}
                y1={centre.y}
                x2={p.x}
                y2={p.y}
                stroke="currentColor"
                strokeWidth={0.15}
                className={cn(
                  "transition-colors duration-300",
                  lit ? "text-aws-orange/60" : "text-white/[0.09]"
                )}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {placed.map((p) => (
          <Tile
            key={p.member.id}
            placed={p}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </motion.div>

      {/* Name list */}
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ shown: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
        className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-5 flex-1 w-full"
      >
        {members.map((m) => (
          <MemberRow key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} />
        ))}
      </motion.div>
    </div>
  );
}

function Tile({
  placed,
  hoveredId,
  onHover,
}: {
  placed: Placed;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const { member, index, x, y, w, isCentre } = placed;
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const isLead = member.kind === "lead";

  // Two elements on purpose.
  //
  // The outer one does the centring with a plain CSS translate and is never
  // animated. framer-motion writes an inline `transform` for scale and
  // rotation, and an inline transform replaces whatever CSS set — so putting
  // `-translate-x-1/2 -translate-y-1/2` on the animated element means the
  // centring is thrown away the moment a tween runs, and every tile hangs half
  // its own size down and to the right of where it belongs.
  return (
    <div
      style={{
        left: `${x}%`,
        // y is in stage-height units; the element wants a percentage of height.
        top: `${(y / STAGE_H) * 100}%`,
        width: `${w}%`,
        zIndex: isActive ? 30 : isCentre ? 20 : 10,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 aspect-[5/6]"
    >
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.7 },
        shown: {
          opacity: 1,
          scale: 1,
          transition: { type: "spring" as const, stiffness: 220, damping: 20 },
        },
      }}
      animate={{
        opacity: isDimmed ? 0.28 : 1,
        scale: isActive ? 1.08 : 1,
        rotateY: isActive ? (index % 2 === 0 ? 7 : -7) : 0,
        rotateX: isActive ? -5 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onMouseEnter={() => onHover(member.id)}
      style={{ transformStyle: "preserve-3d" }}
      className="relative w-full h-full"
    >
      <div
        className={cn(
          "relative w-full h-full overflow-hidden rounded-2xl border",
          isActive
            ? "border-aws-orange/50 shadow-[0_0_40px_-6px_rgba(255,153,0,0.35)]"
            : isCentre
              ? "border-white/20"
              : "border-white/[0.08]"
        )}
      >
        {member.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.image}
            alt=""
            className="w-full h-full object-cover transition-[filter] duration-500"
            style={{ filter: isActive ? "grayscale(0) brightness(1)" : "grayscale(1) brightness(0.7)" }}
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center bg-gradient-to-br to-transparent transition-all duration-500",
              TINTS[index % TINTS.length],
              isActive || isCentre ? "saturate-100" : "saturate-[0.2]"
            )}
          >
            <span
              className={cn(
                "font-display font-black tracking-tight transition-colors duration-500",
                isCentre ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl",
                isActive || isCentre ? "text-white" : "text-white/40"
              )}
            >
              {initials(member.name)}
            </span>
          </div>
        )}

        {/* The centre keeps its badge permanently; satellites only on hover. */}
        <motion.span
          aria-hidden="true"
          animate={{ opacity: isCentre || isActive ? 1 : 0, y: isCentre || isActive ? 0 : 8 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm",
            isLead
              ? "bg-aws-orange text-black font-bold"
              : "bg-navy-950/80 text-zinc-300 border border-white/10"
          )}
        >
          {member.role}
        </motion.span>

        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ x: isActive ? "200%" : "-130%" }}
          transition={{ duration: isActive ? 0.9 : 0, ease: "easeOut" }}
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/14 to-transparent skew-x-12"
        />
      </div>

      {/* A slow pulse ring, centre tile only, so the eye starts there. */}
      {isCentre && (
        <motion.span
          aria-hidden="true"
          animate={{ scale: [1, 1.14, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-2xl border border-aws-orange/40"
        />
      )}
    </motion.div>
    </div>
  );
}

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const isLead = member.kind === "lead";
  const social = member.social ?? {};
  const hasSocial = Boolean(social.linkedin || social.instagram || social.github);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        shown: {
          opacity: 1,
          y: 0,
          transition: { type: "spring" as const, stiffness: 300, damping: 26 },
        },
      }}
      animate={{ opacity: isDimmed ? 0.35 : 1, x: isActive ? 6 : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      onMouseEnter={() => onHover(member.id)}
    >
      <div className="flex items-center gap-2.5">
        <motion.span
          aria-hidden="true"
          animate={{ width: isActive ? 22 : 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={cn(
            "h-3 rounded-[5px] flex-shrink-0",
            isActive ? "bg-aws-orange" : isLead ? "bg-white/35" : "bg-white/15"
          )}
        />
        <span
          className={cn(
            "text-base md:text-[18px] font-semibold leading-none tracking-tight transition-colors duration-300",
            isActive ? "text-white" : "text-zinc-300"
          )}
        >
          <RandomLetterSwap label={member.name} staggerDuration={0.02} />
        </span>

        {hasSocial && (
          <div
            className={cn(
              "flex items-center gap-1.5 ml-0.5 transition-all duration-200",
              isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
            )}
          >
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="p-1 rounded text-zinc-500 hover:text-white transition-colors">
                <FaLinkedinIn size={11} />
              </a>
            )}
            {social.github && (
              <a href={social.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on GitHub`} className="p-1 rounded text-zinc-500 hover:text-white transition-colors">
                <FaGithub size={11} />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Instagram`} className="p-1 rounded text-zinc-500 hover:text-white transition-colors">
                <FaInstagram size={11} />
              </a>
            )}
          </div>
        )}
      </div>

      <p
        className={cn(
          "mt-1.5 pl-[27px] text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
          isActive ? "text-aws-orange" : isLead ? "text-zinc-500" : "text-zinc-600"
        )}
      >
        {member.role}
      </p>
    </motion.div>
  );
}
