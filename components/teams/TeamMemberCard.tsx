import React from "react";
import Image from "next/image";
import { Linkedin, Github, Mail, Sparkles, Award } from "lucide-react";
import { TeamMemberData } from "@/lib/data/initialData";

interface TeamMemberCardProps {
  member: TeamMemberData;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-navy-900/70 border border-white/10 hover:border-aws-orange/50 transition-all duration-300 flex flex-col justify-between shadow-xl">
      {/* Radiant glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-aws-orange/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Top Banner & Photo */}
      <div className="relative pt-6 px-6 flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-aws-orange/30 group-hover:border-aws-orange transition-colors shrink-0 shadow-lg shadow-black/50">
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="80px"
          />
        </div>

        <div className="overflow-hidden">
          {member.isExecutive && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-aws-orange/20 text-aws-orange border border-aws-orange/40 mb-1">
              <Award className="w-2.5 h-2.5" />
              <span>EXEC BOARD</span>
            </div>
          )}
          <h3 className="text-base font-bold text-white group-hover:text-aws-orange transition-colors truncate">
            {member.name}
          </h3>
          <div className="text-xs text-aws-orange font-mono font-medium leading-tight mt-0.5 truncate">
            {member.position}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {member.departmentName}
          </div>
        </div>
      </div>

      {/* Bio & Skills */}
      <div className="p-6 pt-4 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
          {member.bio}
        </p>

        {/* Skills Tags */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
            Expertise & Focus
          </div>
          <div className="flex flex-wrap gap-1">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-navy-950 border border-white/10 text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Social Links Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">Connect</span>
          <div className="flex items-center gap-2">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/40 text-slate-400 hover:text-aws-orange transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/40 text-slate-400 hover:text-aws-orange transition-colors"
                title="GitHub Profile"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/40 text-slate-400 hover:text-aws-orange transition-colors"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
