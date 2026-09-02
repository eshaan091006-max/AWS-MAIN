import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  /** Real photo. Without one, an initials avatar is drawn. */
  photo?: string;
  /** Index picks the tint, so a row of avatars is not all one colour. */
  index?: number;
  size?: "sm" | "lg" | "tile";
  className?: string;
}

const TINTS = [
  "from-aws-orange/40 to-amber-700/15",
  "from-indigo-500/40 to-violet-600/15",
  "from-violet-400/40 to-fuchsia-600/15",
  "from-sky-500/35 to-indigo-600/15",
];

const SIZES = {
  sm: "w-11 h-11 rounded-full text-xs",
  lg: "w-16 h-16 rounded-full text-lg",
  /** Portrait tile, matching the department cluster. */
  tile: "w-full aspect-[5/6] rounded-xl text-3xl md:text-4xl",
};

/**
 * A person's picture, or their initials when there is no picture.
 *
 * The fallback is initials rather than a stock portrait on purpose: these are
 * real, named people, and a photo of an unrelated stranger under someone's name
 * misrepresents them. Set `photo` in config/teamHierarchy.ts and the real
 * image takes over with no other change.
 */
export function PersonAvatar({ name, photo, index = 0, size = "sm", className }: Props) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden border border-white/10",
        SIZES[size],
        className
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="w-full h-full object-cover" />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br",
            TINTS[index % TINTS.length]
          )}
        >
          <span className="font-display font-bold text-white/85 tracking-tight">{initials}</span>
        </div>
      )}
    </div>
  );
}
