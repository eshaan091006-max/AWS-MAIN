import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { INITIAL_GALLERY } from "@/lib/data/initialData";
import { db } from "@/lib/db";
import { AlbumPhotos } from "@/components/gallery/AlbumPhotos";
import { formatAlbumDate, galleryAlbums, photosFor } from "@/config/galleryAlbums";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return galleryAlbums.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = galleryAlbums.find((a) => a.slug === slug);
  return album ? { title: `${album.title} — Gallery` } : {};
}

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const album = galleryAlbums.find((a) => a.slug === slug);
  if (!album) notFound();

  const stored = await db.listGallery();
  const photos = photosFor(album, stored.length > 0 ? stored : INITIAL_GALLERY);

  return (
    <div className="relative pt-36 pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
        <Link
          href="/gallery#events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All events
        </Link>

        <header className="mt-8 max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
            {formatAlbumDate(album.date)}
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.05]">
            {album.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">{album.blurb}</p>
        </header>

        <div className="mt-12">
          {photos.length > 0 ? (
            <AlbumPhotos images={photos} />
          ) : (
            <div className="rounded-xl border border-white/10 bg-navy-950 px-6 py-16 text-center">
              <Camera className="w-8 h-8 mx-auto text-zinc-500" />
              <p className="mt-4 text-sm text-zinc-400">No photos from this event yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
