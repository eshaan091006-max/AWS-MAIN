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

        {/* Centred over the photos, but drawn normally rather than with
            mix-blend-exclusion. That blend mode inverts against whatever is
            behind it, so a photo drifting past turned the heading into a
            negative of itself. A soft scrim and a shadow keep it readable over
            anything without the title changing colour as the gallery moves. */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center px-4 text-center">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-x-24 -inset-y-16 rounded-full blur-2xl"
              style={{ background: "radial-gradient(ellipse at center, rgba(9,9,11,0.72), transparent 72%)" }}
            />
            <div className="relative">
              <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.95)]">
                Gallery
              </h1>
              <p className="mt-3 text-sm md:text-base text-zinc-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Workshops, hackathons, and the people behind them.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 pointer-events-none text-center font-mono uppercase text-[11px] tracking-widest text-zinc-500">
          <p>Scroll over the photos, drag, or use the arrow keys</p>
        </div>
      </section>

    </div>
  );
}
