import React from "react";
import Image from "next/image";
import { Github, ExternalLink, Cpu, Layers, ArrowUpRight } from "lucide-react";
import { ProjectData } from "@/lib/data/initialData";

interface ProjectCardProps {
  project: ProjectData;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-navy-900/70 border border-white/10 hover:border-aws-orange/45 transition-all duration-300 flex flex-col justify-between shadow-xl">
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-aws-orange/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Top Banner Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

        {project.isFeatured && (
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aws-orange text-black shadow-md">
            FEATURED PROJECT
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div>
          {/* Title */}
          <h3 className="text-lg font-bold text-white leading-snug group-hover:text-aws-orange transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
            {project.shortDesc}
          </p>

          {/* Problem & Solution Accordion-like boxes */}
          <div className="mt-3.5 space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-navy-950/80 border border-red-500/20 text-slate-300">
              <span className="text-[10px] font-mono font-semibold text-red-400 uppercase tracking-wider block mb-0.5">
                The Problem
              </span>
              <p className="text-[11px] text-slate-300 line-clamp-2">{project.problem}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950/80 border border-emerald-500/20 text-slate-300">
              <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5">
                AWS Architecture Solution
              </span>
              <p className="text-[11px] text-slate-300 line-clamp-2">{project.solution}</p>
            </div>
          </div>

          {/* AWS Services Badges */}
          <div className="mt-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-aws-orange" />
              <span>AWS Services Used</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.awsServices.map((service) => (
                <span
                  key={service}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-navy-800 border border-aws-orange/30 text-aws-orange-light"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Stack Tech Tags */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/5 text-slate-300 border border-white/5"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer: Contributors & Links */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          {/* Member avatars */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {project.members.map((member, idx) => (
              <div
                key={idx}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-navy-950 bg-navy-800 overflow-hidden relative"
                title={`${member.name} (${member.role})`}
              >
                {member.avatarUrl ? (
                  <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white">
                    {member.name[0]}
                  </div>
                )}
              </div>
            ))}
            <span className="text-[10px] text-slate-400 font-mono pl-3">
              {project.members.length} Architects
            </span>
          </div>

          {/* Project Action Links */}
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-navy-950 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/40 text-slate-300 hover:text-aws-orange transition-colors"
                title="View Code on GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-aws-orange/15 hover:bg-aws-orange text-aws-orange hover:text-black border border-aws-orange/30 text-[11px] font-bold transition-all flex items-center gap-1"
                title="Open Live Deployment"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
