"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Camera } from "lucide-react";
import type { GalleryImageData } from "@/lib/data/initialData";

/**
 * three.js plus the React renderer is roughly half a megabyte of JavaScript.
 * Loading it from a `dynamic` boundary keeps it out of the shared bundle, so
 * every other page on the site pays nothing for it.
 *
 * `ssr: false` because a WebGL canvas cannot render on the server, and
 * `useTexture` suspends on image decode — which on the server means the page
 * hangs waiting for something that will never resolve there.
 */
const InfiniteGallery = dynamic(() => import("@/components/ui/3d-gallery-photography"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center gap-3">
      <Camera className="w-6 h-6 text-zinc-600 animate-pulse" />
      <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">
        Loading gallery
      </p>
    </div>
  ),
});

export function GalleryStage({ images }: { images: GalleryImageData[] }) {
  if (images.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center px-6">
        <Camera className="w-7 h-7 text-zinc-600" />
        <p className="text-sm text-zinc-400">No photos yet.</p>
        <p className="text-xs text-zinc-600">
          Add them from the admin console and they appear here.
        </p>
      </div>
    );
  }

  return (
    <InfiniteGallery
      images={images.map((img) => ({ src: img.imageUrl, alt: img.title }))}
      speed={1.2}
      visibleCount={Math.min(12, Math.max(6, images.length))}
      className="h-full w-full"
    />
  );
}
