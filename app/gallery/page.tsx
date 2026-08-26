import React from "react";
import { Camera, Sparkles } from "lucide-react";
import { INITIAL_GALLERY } from "@/lib/data/initialData";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata = {
  title: "Photo & Community Gallery — SXC AWS Club",
  description: "Browse photos, workshops, hackathon highlights, and team moments from SXC AWS Club events.",
};

export default function GalleryPage() {
  return (
    <div className="relative pt-28 pb-20 overflow-hidden">
      {/* Header */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30">
            <Camera className="w-3.5 h-3.5" />
            <span>COMMUNITY MEMORIES</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Photo & Moment <span className="text-gradient-orange">Gallery</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            A visual chronicle of our hackathons, hands-on serverless labs, leadership sessions, and student celebrations across the cloud journey.
          </p>
        </div>
      </section>

      {/* Gallery Grid Section with Filter Tabs & Coming Soon State */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <GalleryGrid />
      </section>
    </div>
  );
}
