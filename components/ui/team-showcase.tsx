"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";

export interface TeamMember {
  id: string;
  name: string;
  /** "Lead" or "Member" — drives how large the tile is. */
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
  social?: {
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
}

interface TeamShowcaseProps {
  members: TeamMember[];
  className?: string;
}

const TINTS = [
  "from-aws-orange/30 via-amber-600/10",
  "from-indigo-500/30 via-violet-500/10",
  "from-violet-400/30 via-fuchsia-500/10",
  "from-amber-400/30 via-orange-600/10",
  "from-sky-500/25 via-indigo-500/10",
  "from-rose-400/25 via-orange-500/10",
];

/**
 * Deterministic 0..1 from an index.
 *
 * Integer ops only. Math.random would differ between the server render and the
 * client, and Math.sin is not required to agree between engines either — both
 * produce a hydration mismatch on every tile that carries a jittered size.
 */
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

/**
 * Tile size.
 *
 * Leads are simply bigger, so the hierarchy is carried by the picture rather
 * than by a heading above a second grid — that is what lets leads and members
 * share one cluster instead of sitting in two separate blocks. A deterministic
 * ±14% on top keeps the cluster from reading as two tidy size buckets.
 */
function sizeFor(role: string, index: number) {
  const base = role.toLowerCase() === "lead" ? 186 : 142;
  const jitter = 0.86 + hash01(index) * 0.28;
  const w = Math.round(base * jitter);
  return { w, h: Math.round(w * (1.04 + hash01(index + 99) * 0.22)) };
}

export default function TeamShowcase({ members, className }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (members.length === 0) return null;

  const sized = members.map((m, i) => ({ member: m, index: i, ...sizeFor(m.role, i) }));
  const columns = [0, 1, 2].map((c) => sized.filter((_, i) => i % 3 === c));

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-start gap-10 lg:gap-16 select-none w-full",
        className
      )}
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* One cluster, leads and members together. */}
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ shown: { transition: { staggerChildren: 0.06 } } }}
        className="flex gap-3 md:gap-4 flex-shrink-0 overflow-x-auto pb-2 lg:pb-0 [perspective:1000px]"
      >
        {columns.map((col, ci) => (
          <div
            key={ci}
            className="flex flex-col gap-3 md:gap-4"
            // Uneven column tops are what stop three stacks reading as a table.
            style={{ marginTop: [0, 56, 24][ci] }}
          >
            {col.map(({ member, index, w, h }) => (
              <Tile
                key={member.id}
                member={member}
                index={index}
                width={w}
                height={h}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}
          </div>
        ))}
      </motion.div>

      {/* Name list */}
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ shown: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } } }}
        className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-5 flex-1 w-full pt-1"
      >
        {members.map((m) => (
          <MemberRow key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} />
        ))}
      </motion.div>
    </div>
  );
}

const RISE = {
  hidden: { opacity: 0, y: 26, scale: 0.92 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

function Tile({
  member,
  index,
  width,
  height,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  index: number;
  width: number;
  height: number;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const isLead = member.role.toLowerCase() === "lead";

  return (
    <motion.div
      variants={RISE}
      animate={{
        opacity: isDimmed ? 0.35 : 1,
        scale: isActive ? 1.06 : 1,
        rotateY: isActive ? (index % 2 === 0 ? 6 : -6) : 0,
        rotateX: isActive ? -4 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onMouseEnter={() => onHover(member.id)}
      style={{ width, height, transformStyle: "preserve-3d" }}
      className={cn(
        "relative overflow-hidden rounded-2xl flex-shrink-0 border cursor-default",
        isActive ? "border-aws-orange/45" : "border-white/[0.07]"
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
            isActive ? "saturate-100" : "saturate-[0.2]"
          )}
        >
          <span
            className={cn(
              "font-display font-black tracking-tight transition-colors duration-500",
              isLead ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
              isActive ? "text-white" : "text-white/40"
            )}
          >
            {initials(member.name)}
          </span>
        </div>
      )}

      {/* Role tag, revealed on hover — the cluster stays clean until you look
          at someone in particular. */}
      <motion.span
        aria-hidden="true"
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 8 }}
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

      {/* Sheen that sweeps across on hover. */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ x: isActive ? "180%" : "-120%" }}
        transition={{ duration: isActive ? 0.85 : 0, ease: "easeOut" }}
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12"
      />
    </motion.div>
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
  const isLead = member.role.toLowerCase() === "lead";
  const social = member.social ?? {};
  const hasSocial = Boolean(social.linkedin || social.instagram || social.github);

  return (
    <motion.div
      variants={RISE}
      animate={{ opacity: isDimmed ? 0.4 : 1, x: isActive ? 6 : 0 }}
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
          {/* Same letter swap the navbar uses, so hovering a name behaves the
              same way everywhere on the site. */}
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
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
                className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
              >
                <FaLinkedinIn size={11} />
              </a>
            )}
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on GitHub`}
                className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
              >
                <FaGithub size={11} />
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on Instagram`}
                className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
              >
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
