import React from "react";
import { INITIAL_GALLERY } from "@/lib/data/initialData";
import { GalleryStage } from "@/components/gallery/GalleryStage";
import { db } from "@/lib/db";

export const metadata = {
  title: "Photo & Community Gallery — SXC AWS Club",
  description:
    "Browse photos, workshops, hackathon highlights, and team moments from SXC AWS Club events.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const stored = await db.listGallery();

  // The gallery table exists but is empty until someone adds photos in the
  // admin console. Falling back to the seed keeps this page from being a blank
  // canvas — an empty 3D gallery is just a dark rectangle with no explanation.
  const images = stored.length > 0 ? stored : INITIAL_GALLERY;

  return (
    <div className="relative">
      {/* Full-bleed stage. The wheel is captured while the pointer is over the
          canvas, so scrolling there drives the gallery instead of the page;
          move off the canvas and the page scrolls normally again. */}
      <section className="relative h-[92vh] w-full">
        <div className="absolute inset-0">
          <GalleryStage images={images} />
        </div>

        {/* Title sits over the canvas. mix-blend-exclusion keeps it legible
            whatever photo happens to drift behind it. */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center px-4 text-center mix-blend-exclusion">
          <div>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-white">
              Gallery
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/80">
              Workshops, hackathons, and the people behind them.
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 pointer-events-none text-center font-mono uppercase text-[11px] tracking-widest text-zinc-500">
          <p>Scroll over the photos, drag, or use the arrow keys</p>
          <p className="opacity-60 mt-1">Drifts on its own after a moment</p>
        </div>
      </section>

    </div>
  );
}
