"use client";

import React from "react";
import Link from "next/link";
import { Construction, HardHat, Sparkles, ArrowRight, Compass, Terminal, ShieldAlert } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="relative pt-28 pb-24 overflow-hidden">
      {/* Header */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30 shadow-lg shadow-aws-orange/5">
            <Construction className="w-3.5 h-3.5 text-aws-orange" />
            <span>OPEN-SOURCE CLOUD LAB</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Architected by <span className="text-gradient-orange">SXC Builders</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Real-world distributed systems, automated FinOps tools, Kubernetes microservices, and Generative AI applications engineered by our student architects.
          </p>
        </div>
      </section>

      {/* Projects Under Construction / Coming Soon Showcase */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-3xl mx-auto p-8 sm:p-14 rounded-xl bg-navy-900/80 border-2 border-aws-orange/30 backdrop-blur-2xl shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Ambient Cyber Lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-aws-orange/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Construction Icon Badge */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-aws-orange/25 via-amber-500/15 to-transparent border-2 border-aws-orange/50 flex items-center justify-center text-aws-orange shadow-2xl shadow-aws-orange/20 mb-4 animate-pulse">
              <Construction className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <HardHat className="w-3.5 h-3.5" />
              <span>UNDER ACTIVE DEVELOPMENT</span>
            </div>
          </div>

          {/* Main Title & Description */}
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Projects Coming Soon
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
              Our student engineering cohorts and cloud squads are currently architecting open-source AWS solutions, serverless platforms, and AI prototypes. Showcase deployments will go live here soon.
            </p>
          </div>

          {/* Status Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-navy-950/90 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-aws-orange animate-ping" />
              <span>Sprint 2026 Underway</span>
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-navy-950/90 border border-white/10">
              <Terminal className="w-3.5 h-3.5 text-aws-orange" />
              <span>Open-Source Repos In Review</span>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/events"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-xs font-mono shadow-xl shadow-aws-orange/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Upcoming Events</span>
            </Link>

            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-navy-950 hover:bg-navy-800 text-slate-200 hover:text-aws-orange border border-white/15 hover:border-aws-orange/50 text-xs font-mono font-semibold transition-all flex items-center gap-2"
            >
              <span>Submit a Project Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
