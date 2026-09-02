"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BoxesProps {
  className?: string;
  /**
   * Grid size. The upstream component hardcodes 150 x 100, which is 15,000
   * framer-motion nodes plus 3,750 inline SVGs — enough to lock the main thread
   * for seconds on a mid-range laptop, for cells that the skew transform pushes
   * far outside the viewport anyway. Defaults here cover a full-bleed hero with
   * room to spare, at 64px square per cell; raise them for something wider.
   */
  rows?: number;
  cols?: number;
  /** Hover colours. Defaults to the site palette rather than the candy one. */
  colors?: string[];
}

// Orange, amber, indigo, violet, plum — the same accents used everywhere else
// on the site. The upstream sky/pink/green/yellow/red set looks great on a
// neutral demo page and fights an orange-accented one.
const DEFAULT_COLORS = [
  "rgb(255 153 0)", // aws orange
  "rgb(255 168 38)", // aws orange-light
  "rgb(245 158 11)", // amber-500
  "rgb(99 102 241)", // indigo-500
  "rgb(129 140 248)", // indigo-400
  "rgb(167 139 250)", // violet-400
  "rgb(192 132 252)", // plum / purple-400
  "rgb(244 244 245)", // zinc-100, for the occasional bright hit
];

export const BoxesCore = ({
  className,
  rows: rowCount = 44,
  cols: colCount = 20,
  colors = DEFAULT_COLORS,
  ...rest
}: BoxesProps) => {
  const rows = new Array(rowCount).fill(1);
  const cols = new Array(colCount).fill(1);

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  return (
    // Square on, not skewed. The upstream transform threw the plane into a
    // 48-degree isometric, which cut a visible diagonal edge across the section
    // and pushed most of the cells off screen. Centring is left to Tailwind:
    // the inline transform this used to carry would have silently overridden
    // -translate-x-1/2, which is the same thing that clipped the footer
    // wordmark earlier.
    <div
      className={cn(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex z-0",
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          // No fixed height on the column: its cells stack in normal flow, so a
          // h-8 here left the container 32px tall while 1280px of cells spilled
          // out of it — and -translate-y-1/2 then centred the 32px box, not the
          // grid, hanging the whole plane below the middle of the section.
          className="w-16 border-l border-white/[0.07] relative"
        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              key={`col` + j}
              className="w-16 h-16 border-r border-t border-white/[0.07] relative"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute h-6 w-10 -top-[12px] -left-[20px] text-white/[0.09] stroke-[1px] pointer-events-none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
