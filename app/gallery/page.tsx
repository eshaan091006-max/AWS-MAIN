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

        {/* Title sits high and left, out of the band the photos travel through.
            It used to be centred with mix-blend-exclusion, which inverts against
            whatever is behind it — so every time a photo drifted past, the
            heading turned into a negative of it and became unreadable. Out of
            the way and opaque beats clever blending. */}
        <div className="absolute top-0 left-0 right-0 pt-32 px-6 sm:px-12 lg:px-16 pointer-events-none">
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
            Gallery
          </h1>
          <p className="mt-3 max-w-md text-sm md:text-base text-zinc-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Workshops, hackathons, and the people behind them.
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 pointer-events-none text-center font-mono uppercase text-[11px] tracking-widest text-zinc-500">
          <p>Scroll over the photos, drag, or use the arrow keys</p>
        </div>
      </section>

    </div>
  );
}
