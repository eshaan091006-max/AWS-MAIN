"use client";

import React, { useEffect, useState } from "react";
import { Search, X, Calendar, FolderGit2, Users, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { INITIAL_EVENTS, INITIAL_PROJECTS } from "@/lib/data/initialData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEvents = INITIAL_EVENTS.filter(
    (e) =>
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredProjects = INITIAL_PROJECTS.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
      p.awsServices.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 3);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-navy-900 border border-aws-orange/40 rounded-2xl shadow-2xl shadow-aws-orange/10 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-aws-orange shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, projects, workshops, teams..."
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-base"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Quick Links if empty */}
          {!query && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 font-semibold">
                Suggested Quick Jumps
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelect("/events/aws-foundations")}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-800/60 hover:bg-navy-700/80 border border-white/5 text-left text-xs text-slate-200 hover:text-aws-orange transition-colors"
                >
                  <Calendar className="w-4 h-4 text-aws-orange" />
                  <span>AWS Foundations Event</span>
                </button>
                <button
                  onClick={() => handleSelect("/teams")}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-800/60 hover:bg-navy-700/80 border border-white/5 text-left text-xs text-slate-200 hover:text-aws-orange transition-colors"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Meet Our Teams</span>
                </button>
                <button
                  onClick={() => handleSelect("/events")}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-800/60 hover:bg-navy-700/80 border border-white/5 text-left text-xs text-slate-200 hover:text-aws-orange transition-colors"
                >
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>All Events & Workshops</span>
                </button>
                <button
                  onClick={() => handleSelect("/projects")}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-800/60 hover:bg-navy-700/80 border border-white/5 text-left text-xs text-slate-200 hover:text-aws-orange transition-colors"
                >
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <span>Showcase Projects</span>
                </button>
              </div>
            </div>
          )}

          {/* Events Results */}
          {filteredEvents.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 font-semibold">
                Events & Workshops
              </div>
              {filteredEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleSelect(`/events/${event.slug}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-navy-800/40 hover:bg-navy-800 border border-transparent hover:border-aws-orange/30 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <Calendar className="w-4 h-4 text-aws-orange shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-aws-orange truncate">
                        {event.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{event.venue}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-aws-orange shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2 font-semibold">
                Student Projects
              </div>
              {filteredProjects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => handleSelect("/projects")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-navy-800/40 hover:bg-navy-800 border border-transparent hover:border-aws-orange/30 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FolderGit2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-aws-orange truncate">
                        {proj.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{proj.shortDesc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-aws-orange shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-navy-950/60 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Press ESC to exit</span>
          <span>SXC AWS Community Search</span>
        </div>
      </div>
    </div>
  );
}
