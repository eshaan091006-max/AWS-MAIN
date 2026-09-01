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
      <section className="relative h-screen w-full overflow-hidden">
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
              {/* The hint sits with the title rather than pinned to the bottom
                  of the section, where it was a line of text stranded in an
                  empty band with nothing above or below it. */}
              <p className="mt-6 font-mono uppercase text-[10px] md:text-[11px] tracking-widest text-zinc-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                Scroll over the photos, drag, or use the arrow keys
              </p>
            </div>
          </div>
        </div>

        {/* Fades the stage into the footer. Without it the photo plane and
            the section end on the same hard horizontal line, and the footer's
            wordmark starts immediately underneath it. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-navy-950 to-transparent"
        />
      </section>

    </div>
  );
}
