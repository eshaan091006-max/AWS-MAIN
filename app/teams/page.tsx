import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { teamHierarchy } from "@/config/teamHierarchy";

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

        {/* Departments only. Names and their people are on the department's own
            page rather than all flattened onto one screen. */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {departments.map((dept) => {
            const leads = dept.vcps.length;
            const members = dept.vcps.reduce(
              (total, vcp) => total + (vcp.coordinators?.length ?? 0),
              0
            );

            return (
              <Link
                key={dept.id}
                href={`/teams/${dept.slug}`}
                className="group relative bg-navy-950/85 p-8 backdrop-blur-sm transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-aws-orange">
                    {dept.code}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-600 transition-all group-hover:text-aws-orange group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>

                <h2 className="mt-4 text-2xl font-display font-bold text-white leading-tight transition-colors group-hover:text-aws-orange">
                  {dept.name}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{dept.shortName}</p>

                <div className="mt-6 text-[11px] font-mono text-zinc-600">
                  {leads} {leads === 1 ? "lead" : "leads"}
                  {members > 0 && ` · ${members} ${members === 1 ? "member" : "members"}`}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
