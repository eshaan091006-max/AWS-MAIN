import React from "react";
import type { Metadata } from "next";
import { teamHierarchy } from "@/config/teamHierarchy";
import { DepartmentGrid } from "@/components/teams/DepartmentGrid";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The departments running the SXC AWS Student Builder Group — events, operations, marketing and technical.",
};

export default function TeamsPage() {
  const { departments, chairperson, faculty } = teamHierarchy;

  return (
    <div className="relative pt-36 pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
        <header className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
            Team
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-[1.05]">
            Four <span className="text-gradient-orange">departments</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
            {chairperson.name} leads the group, backed by {faculty.members.length} faculty
            mentors. Open a department to see who runs it.
          </p>
        </header>

        <DepartmentGrid departments={departments} />

      </div>
    </div>
  );
}
