"use client";

import { useState } from "react";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import { cn } from "@/lib/utils";

export interface TeamMember {
  id: string;
  name: string;
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

/** Deterministic tint per person, so a monogram is not just a grey box. */
const TINTS = [
  "from-aws-orange/25 to-amber-600/10",
  "from-indigo-500/25 to-violet-500/10",
  "from-violet-400/25 to-fuchsia-500/10",
  "from-amber-400/25 to-orange-600/10",
  "from-sky-500/20 to-indigo-500/10",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TeamShowcase({ members, className }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  if (members.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-start gap-8 md:gap-10 lg:gap-14 select-none w-full",
        className
      )}
    >
      {/* Photo / monogram grid */}
      <div className="flex gap-2 md:gap-3 flex-shrink-0 overflow-x-auto pb-1 md:pb-0">
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((m) => (
            <Tile
              key={m.id}
              member={m}
              index={members.indexOf(m)}
              className="w-[110px] h-[120px] sm:w-[130px] sm:h-[140px] md:w-[155px] md:h-[165px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 md:gap-3 mt-[48px] sm:mt-[56px] md:mt-[68px]">
          {col2.map((m) => (
            <Tile
              key={m.id}
              member={m}
              index={members.indexOf(m)}
              className="w-[122px] h-[132px] sm:w-[145px] sm:h-[155px] md:w-[172px] md:h-[182px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 md:gap-3 mt-[22px] sm:mt-[26px] md:mt-[32px]">
          {col3.map((m) => (
            <Tile
              key={m.id}
              member={m}
              index={members.indexOf(m)}
              className="w-[115px] h-[125px] sm:w-[136px] sm:h-[146px] md:w-[162px] md:h-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* Name list */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-4 md:gap-5 pt-0 md:pt-2 flex-1 w-full">
        {members.map((m) => (
          <MemberRow key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} />
        ))}
      </div>
    </div>
  );
}

function Tile({
  member,
  index,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  index: number;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl flex-shrink-0 transition-opacity duration-300 border border-white/[0.07]",
        className,
        isDimmed ? "opacity-50" : "opacity-100"
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {member.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.image}
          alt=""
          className="w-full h-full object-cover transition-[filter] duration-500"
          style={{
            filter: isActive ? "grayscale(0) brightness(1)" : "grayscale(1) brightness(0.75)",
          }}
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br transition-all duration-500",
            TINTS[index % TINTS.length],
            isActive ? "saturate-100" : "saturate-[0.25]"
          )}
        >
          <span
            className={cn(
              "font-display font-black tracking-tight text-2xl md:text-3xl transition-colors duration-500",
              isActive ? "text-white" : "text-white/45"
            )}
          >
            {initials(member.name)}
          </span>
        </div>
      )}
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
  const social = member.social ?? {};
  const hasSocial = Boolean(social.linkedin || social.instagram || social.github);

  return (
    <div
      className={cn("transition-opacity duration-300", isDimmed ? "opacity-45" : "opacity-100")}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            "h-3 rounded-[5px] flex-shrink-0 transition-all duration-300",
            isActive ? "bg-aws-orange w-5" : "bg-white/20 w-4"
          )}
        />
        <span
          className={cn(
            "text-base md:text-[18px] font-semibold leading-none tracking-tight transition-colors duration-300",
            isActive ? "text-white" : "text-zinc-300"
          )}
        >
          {member.name}
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

      <p className="mt-1.5 pl-[27px] text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
        {member.role}
      </p>
    </div>
  );
}
