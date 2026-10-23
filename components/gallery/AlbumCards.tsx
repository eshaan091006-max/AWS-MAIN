import React from "react";
import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import {
  formatAlbumDate,
  galleryAlbums,
  photosFor,
} from "@/config/galleryAlbums";
import type { GalleryImageData } from "@/lib/data/initialData";
import { cn } from "@/lib/utils";

/** One card per event, each linking to that event's photos. */
export function AlbumCards({
  images,
  className,
}: {
  images: GalleryImageData[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8",
        className,
      )}
    >
      {galleryAlbums.map((album, i) => {
        const photos = photosFor(album, images);
        return (
          <Reveal key={album.slug} delay={i * 0.08} className="h-full">
            <Link
              href={`/gallery/${album.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-navy-950 hover:border-aws-orange/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/60"
            >
              <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-500/20 to-aws-orange/5">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundSize: "32px 32px",
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    maskImage:
                      "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-3 -bottom-8 font-display font-black leading-none text-[8rem] xl:text-[11rem] text-white/[0.06] select-none transition-transform duration-500 group-hover:-translate-y-1"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-navy-950/70 border border-aws-orange/30 flex items-center justify-center text-aws-orange shadow-lg shadow-aws-orange/10">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                    View photos
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-aws-orange">
                  Event {i + 1} · {formatAlbumDate(album.date)}
                </div>
                <h3 className="mt-2 text-lg font-display font-bold text-white tracking-tight leading-snug">
                  {album.title}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    {photos.length > 0
                      ? `${photos.length} photos`
                      : "No photos yet"}
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
