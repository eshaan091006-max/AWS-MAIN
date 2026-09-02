"use client";

import React, { useEffect, useRef, useState } from "react";
import { Users, Cloud, Server, Database, Zap, HardDrive, Shield, Globe, Layers, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

interface NodeItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  desc: string;
}

export function CloudArchitectureVisualizer() {
  const [activeNode, setActiveNode] = useState<string | null>("cloud");

  const nodes = {
    users: {
      id: "users",
      name: "Global Users & Devices",
      category: "Traffic Origin",
      icon: Users,
      color: "from-blue-400 to-indigo-500",
      desc: "50,000+ Concurrent Requests per second via Web, Mobile & IoT clients",
    },
    cloud: {
      id: "cloud",
      name: "AWS CloudFront & API Gateway",
      category: "Edge & Routing",
      icon: Cloud,
      color: "from-aws-orange to-amber-500",
      desc: "Low-latency edge caching with Route 53 DNS and AWS Shield DDoS protection",
    },
    compute: [
      {
        id: "ec2",
        name: "Amazon EC2",
        category: "Elastic Compute",
        icon: Server,
        color: "text-amber-400 border-amber-500/30",
        desc: "Auto-scaled containerized backend clusters with multi-AZ redundancy",
      },
      {
        id: "lambda",
        name: "AWS Lambda",
        category: "Serverless Compute",
        icon: Zap,
        color: "text-aws-orange border-aws-orange/40",
        desc: "Sub-millisecond event triggers handling authentication and background jobs",
      },
      {
        id: "s3",
        name: "Amazon S3",
        category: "Object Storage",
        icon: HardDrive,
        color: "text-emerald-400 border-emerald-500/30",
        desc: "11 9's durability media and document storage with CDN acceleration",
      },
    ],
    database: [
      {
        id: "rds",
        name: "Amazon RDS Aurora",
        category: "Relational DB",
        icon: Database,
        color: "text-blue-400 border-blue-500/30",
        desc: "High-performance PostgreSQL cluster with automatic failover and read replicas",
      },
      {
        id: "dynamodb",
        name: "Amazon DynamoDB",
        category: "NoSQL DB",
        icon: Layers,
        color: "text-cyan-400 border-cyan-500/30",
        desc: "Single-digit millisecond latency key-value store for session states",
      },
    ],
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-xl bg-[#091024]/80 backdrop-blur-xl border border-aws-orange/20 shadow-2xl shadow-aws-orange/5 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-aws-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-slate-300 font-semibold">aws:live-topology-v2</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-medium">99.99% UP</span>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <div className="flex flex-col items-center gap-4">
        {/* Layer 1: Users */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          onClick={() => setActiveNode("users")}
          className={`w-full max-w-xs cursor-pointer rounded-xl p-3 flex items-center justify-between border transition-all ${
            activeNode === "users"
              ? "bg-navy-800 border-indigo-400/60 shadow-lg shadow-indigo-500/20"
              : "bg-navy-900/90 border-white/10 hover:border-indigo-400/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Global Users & Traffic</div>
              <div className="text-[10px] text-slate-400 font-mono">50k+ req/sec</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
            HTTPS
          </span>
        </motion.div>

        {/* Animated Connection Arrow */}
        <div className="flex flex-col items-center text-aws-orange/80">
          <div className="w-0.5 h-3 bg-gradient-to-b from-indigo-500 to-aws-orange" />
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </div>

        {/* Layer 2: Cloud Gateway */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          onClick={() => setActiveNode("cloud")}
          className={`w-full max-w-sm cursor-pointer rounded-xl p-3.5 flex items-center justify-between border transition-all ${
            activeNode === "cloud"
              ? "bg-navy-800 border-aws-orange shadow-lg shadow-aws-orange/20"
              : "bg-navy-900/90 border-aws-orange/30 hover:border-aws-orange/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aws-orange to-amber-600 flex items-center justify-center text-navy-950 font-bold shadow-md shadow-aws-orange/30">
              <Cloud className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                AWS Cloud Core
                <span className="w-1.5 h-1.5 rounded-full bg-aws-orange animate-pulse" />
              </div>
              <div className="text-[11px] text-aws-orange-light font-mono">CloudFront • Route 53 • WAF</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-aws-orange/20 text-aws-orange font-mono border border-aws-orange/40">
            TLS 1.3
          </span>
        </motion.div>

        {/* Branching Lines */}
        <div className="w-full flex justify-center items-center gap-16 text-aws-orange/60">
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-aws-orange to-transparent" />
        </div>

        {/* Layer 3: Compute & Storage (EC2, Lambda, S3) */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {nodes.compute.map((node) => {
            const Icon = node.icon;
            const isSelected = activeNode === node.id;
            return (
              <motion.div
                key={node.id}
                whileHover={{ scale: 1.04 }}
                onClick={() => setActiveNode(node.id)}
                className={`cursor-pointer rounded-xl p-2.5 flex flex-col items-center text-center border transition-all ${
                  isSelected
                    ? `bg-navy-800 ${node.color} shadow-md`
                    : "bg-navy-900/80 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center mb-1.5 shadow-inner">
                  <Icon className="w-4 h-4 text-aws-orange" />
                </div>
                <div className="text-xs font-semibold text-white">{node.name.replace("Amazon ", "").replace("AWS ", "")}</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">{node.category}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Convergence Arrow */}
        <div className="flex flex-col items-center text-aws-orange/80">
          <div className="w-0.5 h-3 bg-gradient-to-b from-aws-orange to-blue-400" />
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </div>

        {/* Layer 4: Databases (RDS & DynamoDB) */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {nodes.database.map((dbNode) => {
            const Icon = dbNode.icon;
            const isSelected = activeNode === dbNode.id;
            return (
              <motion.div
                key={dbNode.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveNode(dbNode.id)}
                className={`cursor-pointer rounded-xl p-2.5 flex items-center gap-2.5 border transition-all ${
                  isSelected
                    ? `bg-navy-800 ${dbNode.color} shadow-md`
                    : "bg-navy-900/80 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-navy-800 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{dbNode.name.replace("Amazon ", "")}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{dbNode.category}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live Node Inspector / Telemetry Box */}
      <div className="mt-5 p-3 rounded-xl bg-navy-950/80 border border-white/10 flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-aws-orange/10 text-aws-orange shrink-0 mt-0.5">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div className="text-left text-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Active Node Telemetry</div>
          <p className="text-slate-200 mt-0.5 leading-relaxed text-xs">
            {activeNode === "users" && nodes.users.desc}
            {activeNode === "cloud" && nodes.cloud.desc}
            {nodes.compute.find((c) => c.id === activeNode)?.desc}
            {nodes.database.find((d) => d.id === activeNode)?.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
