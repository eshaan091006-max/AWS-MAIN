"use client";

import React, { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { LightboxModal } from "@/components/gallery/LightboxModal";
import type { GalleryImageData } from "@/lib/data/initialData";

/** One event's photos as a grid; clicking one opens it in the lightbox. */
export function AlbumPhotos({ images }: { images: GalleryImageData[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {images.map((img, i) => (
          <Reveal key={img.id} delay={(i % 3) * 0.06}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${images.length}`}
              className="group block w-full aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-navy-900 hover:border-aws-orange/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.description}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          </Reveal>
        ))}
      </div>

      <LightboxModal
        images={images}
        currentIndex={open}
        onClose={() => setOpen(null)}
        onNavigate={setOpen}
      />
    </>
  );
}
