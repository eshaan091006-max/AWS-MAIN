"use client";

import React from "react";
import { GitBranch, Shield, Sparkles } from "lucide-react";
import { OrganizationalTree } from "@/components/teams/OrganizationalTree";

export default function TeamsPage() {
  return (
    <div className="relative pt-28 pb-24 overflow-hidden">
      {/* Header */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30 shadow-lg shadow-aws-orange/5">
            <GitBranch className="w-3.5 h-3.5" />
            <span>ORGANIZATIONAL COMMAND TREE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            SXC AWS <span className="text-gradient-orange">Leadership & Teams</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Hierarchical structure, faculty mentorship, and departmental branches driving cloud initiatives and student architecture at St. Xavier&apos;s College.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Faculty Mentors</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-aws-orange" />
              <span>Chairperson</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>4 Active Departments</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Organizational Tree Map */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <OrganizationalTree />
      </section>
    </div>
  );
}
