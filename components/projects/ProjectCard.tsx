"use client";

import React from "react";
import Image from "next/image";
import { Github, ExternalLink, ArrowUpRight } from "lucide-react";
import { ProjectData } from "@/lib/data/initialData";
import { SpotlightCard } from "@/components/ui/spotlight-card";

interface ProjectCardProps {
  project: ProjectData;
}

/**
 * A project, in the same card language as the rest of the site: cursor
 * spotlight, a slight lean toward the pointer, one accent.
 *
 * The problem and solution used to sit in a red-bordered box and a
 * green-bordered box. Red and green read as failure and success — a status,
 * not a heading — on a card where nothing has a status. They are plain
 * labelled paragraphs now, and the only colour left is the orange the rest of
 * the site uses for things you can act on.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <SpotlightCard
      as="article"
      className="group/card h-full flex flex-col rounded-xl border border-white/10 bg-navy-950 transition-colors duration-300 hover:border-aws-orange/40"
    >
      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden shrink-0">
        <Image
          src={project.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />

        {project.isFeatured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-aws-orange text-black">
            Featured
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        <h3 className="text-lg font-display font-bold text-white leading-snug">
          {project.title}
        </h3>
        {/* zinc-400 throughout: the slate-300/400 this used measures fine on
            its own but belongs to a palette the site no longer uses. */}
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed line-clamp-2">
          {project.shortDesc}
        </p>

        <dl className="mt-5 space-y-3">
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
              The problem
            </dt>
            <dd className="text-xs text-zinc-400 leading-relaxed mt-1 line-clamp-2">
              {project.problem}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
              The architecture
            </dt>
            <dd className="text-xs text-zinc-400 leading-relaxed mt-1 line-clamp-2">
              {project.solution}
            </dd>
          </div>
        </dl>

        {project.awsServices.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.awsServices.map((service) => (
              <span
                key={service}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-aws-orange/10 border border-aws-orange/25 text-aws-orange"
              >
                {service}
              </span>
            ))}
          </div>
        )}

        {project.technologies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/[0.04] border border-white/10 text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Footer pinned to the bottom, so cards of different content lengths
            still line their actions up with each other. */}
        <div className="mt-auto pt-6 flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0">
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((member, idx) => (
                <span
                  key={idx}
                  title={`${member.name} — ${member.role}`}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-navy-950 bg-navy-800 overflow-hidden relative shrink-0"
                >
                  {member.avatarUrl ? (
                    <Image src={member.avatarUrl} alt="" fill className="object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white">
                      {member.name[0]}
                    </span>
                  )}
                </span>
              ))}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 pl-3 truncate">
              {project.members.length}{" "}
              {project.members.length === 1 ? "builder" : "builders"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} source on GitHub`}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-aws-orange/40 text-zinc-300 hover:text-aws-orange transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-aws-orange/10 hover:bg-aws-orange text-aws-orange hover:text-black border border-aws-orange/25 text-[11px] font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>Live</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {!project.githubUrl && !project.liveDemoUrl && (
              <ArrowUpRight className="w-4 h-4 text-zinc-600" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
