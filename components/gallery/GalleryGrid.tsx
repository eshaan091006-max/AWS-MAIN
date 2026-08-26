"use client";

import React, { useState } from "react";
import { Camera, Sparkles, Clock, Calendar, Film } from "lucide-react";

export function GalleryGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = [
    { id: "ALL", label: "All" },
    { id: "WORKSHOPS", label: "Workshops" },
    { id: "KEYNOTES_SUMMITS", label: "Keynotes and Summits" },
  ];

  const getComingSoonDetails = () => {
    switch (selectedCategory) {
      case "WORKSHOPS":
        return {
          title: "Workshop Photos & Lab Recordings Coming Soon",
          desc: "Live photos, code-along screenshots, and student builder sessions from our upcoming AWS Serverless and Container labs will be published here.",
          tag: "WORKSHOPS ARCHIVE",
        };
      case "KEYNOTES_SUMMITS":
        return {
          title: "Keynotes & Summits Media Coming Soon",
          desc: "Keynote captures from AWS Cloud Day 2026, guest speaker sessions, and panel discussions will be archived here.",
          tag: "SUMMITS ARCHIVE",
        };
      default:
        return {
          title: "Photo & Community Gallery Coming Soon",
          desc: "High-resolution photo chronicles of our upcoming AWS workshops, cloud summits, and student hackathons are currently being curated and will be uploaded here.",
          tag: "MEDIA ARCHIVE",
        };
    }
  };

  const details = getComingSoonDetails();

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-mono transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-aws-orange text-black font-bold shadow-lg shadow-aws-orange/20 scale-105"
                : "bg-navy-900/80 text-slate-300 border border-white/10 hover:border-aws-orange/40 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Coming Soon Hero Showcase */}
      <div className="max-w-3xl mx-auto p-8 sm:p-14 rounded-3xl bg-navy-900/80 border-2 border-aws-orange/30 backdrop-blur-2xl shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-aws-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Badge */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aws-orange/20 to-amber-500/10 border border-aws-orange/40 flex items-center justify-center text-aws-orange shadow-lg shadow-aws-orange/10 mb-4">
            <Camera className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{details.tag}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {details.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            {details.desc}
          </p>
        </div>

        {/* Status Pill */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950/80 border border-white/10 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-aws-orange animate-pulse" />
            <span>Media Capture in Progress</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950/80 border border-white/10 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-aws-orange" />
            <span>2026 Academic Season</span>
          </span>
        </div>
      </div>
    </div>
  );
}
