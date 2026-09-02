"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * An AWS architecture that draws itself.
 *
 * The hero was the least designed part of the site — a centred block of text on
 * the ambient background, while the footer, contact and gallery each had a
 * set piece. This is the hero's: the shape of a real deployment, assembling
 * itself behind the headline.
 *
 * Every coordinate is a literal. Nothing here is random or time-seeded, so the
 * server and the client render identical markup — the hydration mismatches this
 * project has already hit twice came from exactly that (Math.random in one
 * component, Math.sin precision in another).
 */

/** viewBox units. The whole diagram is authored against this box and scaled. */
const W = 1200;
const H = 520;

interface Node {
  id: string;
  label: string;
  /** Centre of the node, in viewBox units. */
  x: number;
  y: number;
  /** The accented node in each tier. */
  accent?: boolean;
}

const NODES: Node[] = [
  { id: "users", label: "Users", x: 90, y: 260 },
  { id: "route53", label: "Route 53", x: 300, y: 140 },
  { id: "vpc", label: "VPC", x: 300, y: 380 },
  { id: "ec2", label: "EC2", x: 560, y: 140, accent: true },
  { id: "lambda", label: "Lambda", x: 560, y: 380 },
  { id: "rds", label: "RDS", x: 840, y: 90 },
  { id: "s3", label: "S3", x: 840, y: 260, accent: true },
  { id: "bedrock", label: "Bedrock", x: 840, y: 430 },
  { id: "cloudwatch", label: "CloudWatch", x: 1090, y: 260 },
];

const EDGES: [string, string][] = [
  ["users", "route53"],
  ["users", "vpc"],
  ["route53", "ec2"],
  ["vpc", "lambda"],
  ["ec2", "rds"],
  ["ec2", "s3"],
  ["lambda", "s3"],
  ["lambda", "bedrock"],
  ["rds", "cloudwatch"],
  ["s3", "cloudwatch"],
  ["bedrock", "cloudwatch"],
];

const NODE_W = 132;
const NODE_H = 52;

const byId = (id: string) => NODES.find((n) => n.id === id)!;

export function ArchitectureDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      // Decorative: the headline over it already says what the club does, and a
      // screen reader reading out nine service names would be noise.
      aria-hidden="true"
      focusable="false"
      // meet, not slice: slice crops to fill, and at hero proportions that
      // left two nodes on screen out of nine — the diagram only reads as an
      // architecture if you can see the whole shape of it.
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id="arch-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(255 153 0)" stopOpacity="0.05" />
          <stop offset="50%" stopColor="rgb(255 153 0)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(255 153 0)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Edges draw first, in the order the request would travel. */}
      {EDGES.map(([fromId, toId], i) => {
        const from = byId(fromId);
        const to = byId(toId);
        return (
          <motion.line
            key={`${fromId}-${toId}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="url(#arch-edge)"
            strokeWidth={1.25}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.25 + i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}

      {/* Traffic. One packet per edge, offset so they do not move in lockstep. */}
      {EDGES.map(([fromId, toId], i) => {
        const from = byId(fromId);
        const to = byId(toId);
        return (
          <motion.circle
            key={`packet-${fromId}-${toId}`}
            r={2.5}
            fill="rgb(255 153 0)"
            initial={{ cx: from.x, cy: from.y, opacity: 0 }}
            animate={{
              cx: [from.x, to.x],
              cy: [from.y, to.y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.4,
              delay: 1.2 + i * 0.35,
              repeat: Infinity,
              repeatDelay: 2.6,
              ease: "linear",
            }}
          />
        );
      })}

      {/* Nodes settle in after their edges. */}
      {NODES.map((node, i) => (
        <motion.g
          key={node.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.15 + i * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        >
          <rect
            x={node.x - NODE_W / 2}
            y={node.y - NODE_H / 2}
            width={NODE_W}
            height={NODE_H}
            rx={12}
            fill="rgb(9 9 11)"
            stroke={node.accent ? "rgb(255 153 0)" : "rgb(255 255 255)"}
            strokeOpacity={node.accent ? 0.5 : 0.14}
            strokeWidth={1}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            letterSpacing={0.5}
            fill={node.accent ? "rgb(255 153 0)" : "rgb(228 228 231)"}
            fillOpacity={node.accent ? 0.95 : 0.6}
            className="font-mono"
          >
            {node.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
