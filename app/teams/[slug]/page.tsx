import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { teamHierarchy } from "@/config/teamHierarchy";
import { DecodeText } from "@/components/ui/decode-text";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  DepartmentPeople,
  type DepartmentPerson,
} from "@/components/teams/DepartmentPeople";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Every department is known at build time, so all of them can be static. */
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
  const index = teamHierarchy.departments.findIndex((d) => d.slug === slug);
  const dept = teamHierarchy.departments[index];
  if (!dept) notFound();

  // VCPs are core committee members; everyone under them is a coordinator.
  // Coordinators are stored per-VCP, or on the department itself where it has
  // co-leads and someone answers to both. Both sources are flattened and
  // de-duplicated — the same person can appear under two leads in the source.
  const leads: DepartmentPerson[] = dept.vcps.map((vcp) => ({
    name: vcp.name,
    role: vcp.role,
    kind: "lead",
  }));

  const seen = new Set<string>();
  const coordinators: DepartmentPerson[] = [];
  const addCoordinator = (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    coordinators.push({ name, role: "Coordinator", kind: "coordinator" });
  };
  dept.vcps.forEach((vcp) => (vcp.coordinators ?? []).forEach(addCoordinator));
  (dept.coordinators ?? []).forEach(addCoordinator);

  const people = [...leads, ...coordinators];

  return (
    <div className="relative pt-32 pb-28">
      {/* The department's own colour, as an ambient wash behind the header.
          Every department already carries a gradient in the config and nothing
          rendered it — so all four pages looked identical apart from the words.
          Masked at the bottom so it fades into the page rather than ending on
          a line. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-br ${dept.color} [mask-image:linear-gradient(to_bottom,black,transparent)]`}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
        <MagneticButton
          as={Link}
          href="/teams"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All departments
        </MagneticButton>

        <header className="relative mt-10 max-w-3xl">
          {/* Oversized ghost numeral, as on the department cards and the home
              sections. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-3 select-none text-[9rem] sm:text-[12rem] font-display font-bold leading-none text-white/[0.035]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="relative">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
              <DecodeText text={dept.code} />
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.05]">
              {dept.name}
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-4">{dept.shortName}</p>
          </div>
        </header>

        {/* Counts, as the home page states them: the number counts up, the
            label stays put. */}
        <Reveal delay={0.1}>
          <div className="mt-12 flex items-center gap-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 tabular-nums">
              <CountUp value={String(leads.length)} />{" "}
              {leads.length === 1 ? "core committee member" : "core committee members"}
              {coordinators.length > 0 && (
                <>
                  {" · "}
                  <CountUp value={String(coordinators.length)} />{" "}
                  {coordinators.length === 1 ? "coordinator" : "coordinators"}
                </>
              )}
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </Reveal>

        <section className="mt-10">
          <DepartmentPeople people={people} accent={dept.color} />
        </section>

        {/* The writeup sits after the people: the page is about who is in the
            department first and what it does second. The heading pins while
            the content scrolls past it, matching the home page's sections. */}
        <section className="relative mt-24 pt-14 border-t border-white/10 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange">
              <DecodeText text="WHAT THEY DO" />
            </h2>
            <span
              aria-hidden="true"
              className="mt-6 block h-px w-16 bg-aws-orange/50"
            />
          </div>

          <div className="lg:col-span-3">
            <Reveal>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                {dept.description}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {dept.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-400">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] w-3 h-px bg-aws-orange shrink-0"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
}
