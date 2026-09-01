import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { teamHierarchy } from "@/config/teamHierarchy";
import TeamShowcase, { type TeamMember } from "@/components/ui/team-showcase";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Every department is known at build time, so all four can be static. */
export function generateStaticParams() {
  return teamHierarchy.departments.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dept = teamHierarchy.departments.find((d) => d.slug === slug);
  if (!dept) return { title: "Department not found" };
  return { title: dept.name, description: dept.description };
}

export default async function DepartmentPage({ params }: PageProps) {
  const { slug } = await params;
  const dept = teamHierarchy.departments.find((d) => d.slug === slug);
  if (!dept) notFound();

  // VCPs are Leads and coordinators are Members now. The coordinators are
  // stored per-VCP, so they are flattened and de-duplicated — the same person
  // can be listed under two leads in the source data.
  const leads: TeamMember[] = dept.vcps.map((vcp, i) => ({
    id: `lead-${i}`,
    name: vcp.name,
    role: "Lead",
  }));

  const seen = new Set<string>();
  const members: TeamMember[] = [];
  dept.vcps.forEach((vcp) => {
    (vcp.coordinators ?? []).forEach((name) => {
      if (seen.has(name)) return;
      seen.add(name);
      members.push({ id: `member-${seen.size}`, name, role: "Member" });
    });
  });

  // Leads first so the largest tiles land at the top of the cluster.
  const people: TeamMember[] = [...leads, ...members];

  return (
    <div className="relative pt-36 pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All departments
        </Link>

        <header className="mt-8 max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
            {dept.code}
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-[1.05]">
            {dept.name}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
            {dept.description}
          </p>
        </header>

        {/* Leads and members in one cluster. They were two separate
            showcases with their own headings, which split a department of four
            people into two half-empty grids; the tile size carries the
            hierarchy instead. */}
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600">
              {leads.length} {leads.length === 1 ? "lead" : "leads"}
              {members.length > 0 &&
                ` · ${members.length} ${members.length === 1 ? "member" : "members"}`}
            </span>
            <span className="h-px flex-1 bg-white/[0.07]" />
          </div>

          <TeamShowcase members={people} accent={dept.color} />
        </section>

      </div>
    </div>
  );
}
