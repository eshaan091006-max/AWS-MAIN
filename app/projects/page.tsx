import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Construction } from "lucide-react";
import { db } from "@/lib/db";
import { ScrollSection } from "@/components/ui/scroll-section";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { DecodeText } from "@/components/ui/decode-text";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ProjectCard } from "@/components/projects/ProjectCard";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Cloud projects built by students of the SXC AWS Student Builder Group — architectures, tooling and prototypes on AWS.",
};

// Projects live in the database and are edited in the admin console, so this
// page cannot be frozen at build time.
export const revalidate = 60;

export default async function ProjectsPage() {
  // This page never read the database before: it rendered a hardcoded "coming
  // soon" panel, and ProjectCard was never mounted anywhere. The admin console
  // has had a Projects tab writing to a table that nothing on the public site
  // could ever display. It reads that table now, and falls back to the empty
  // state only when there is genuinely nothing to show.
  const projects = await db.listProjects();
  const featured = projects.filter((p) => p.isFeatured);
  const rest = projects.filter((p) => !p.isFeatured);
  const ordered = [...featured, ...rest];

  return (
    <div className="relative pb-28">
      <div className="pt-32 px-4 sm:px-8 lg:px-12">
        <header className="relative max-w-6xl mx-auto">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-3 select-none text-[9rem] sm:text-[12rem] font-display font-bold leading-none text-white/[0.035]"
          >
            00
          </span>

          <div className="relative max-w-3xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
              <DecodeText text="OPEN-SOURCE CLOUD LAB" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.05]">
              Architected by <span className="text-gradient-orange">SXC builders</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 mt-6 leading-relaxed">
              Distributed systems, automation tooling, Kubernetes services and generative
              AI applications — built on AWS by students of the group.
            </p>
          </div>
        </header>
      </div>

      <ScrollSection
        id="showcase"
        index={1}
        eyebrow={ordered.length > 0 ? "The work" : "Status"}
        title={ordered.length > 0 ? "What students have" : "Nothing shipped"}
        highlight={ordered.length > 0 ? "shipped" : "yet"}
        sub={
          ordered.length > 0
            ? "Every one of these was designed, built and deployed by members."
            : "The first showcase deployments will appear here as they go live."
        }
      >
        {ordered.length > 0 ? (
          <RevealGroup
            className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            step={0.07}
          >
            {ordered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </RevealGroup>
        ) : (
          <Reveal>
            {/* The empty state, in the same surfaces as the rest of the site.
                It used to be a centred panel with a pulsing badge, a pinging
                dot, a gradient button and amber as a second accent — five
                attention-grabbing devices on a page that has nothing to show. */}
            <div className="rounded-xl border border-white/10 bg-navy-950 p-8 sm:p-10">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-aws-orange">
                <Construction className="w-5 h-5" />
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-6">
                Projects are still being built
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mt-3 max-w-xl">
                Members are currently working on open-source AWS solutions, serverless
                platforms and AI prototypes. Each one appears here once it is deployed and
                its repository is public.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <MagneticButton
                  as={Link}
                  href="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-sm"
                >
                  <Compass className="w-4 h-4" />
                  <span>See upcoming events</span>
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 hover:border-aws-orange/40 text-sm font-semibold"
                >
                  <span>Propose a project</span>
                  <ArrowRight className="w-4 h-4 text-aws-orange" />
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        )}
      </ScrollSection>
    </div>
  );
}
