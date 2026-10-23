import type { GalleryImageData } from "@/lib/data/initialData";

export interface GalleryAlbum {
  slug: string;
  /** Matches the `title` of the gallery entries that belong to this event. */
  title: string;
  date: string;
  blurb: string;
}

/**
 * The events that get a gallery page, oldest first. Photos are attached by
 * title rather than a new column, so entries added in the admin console join an
 * album just by using its event's title.
 */
export const galleryAlbums: GalleryAlbum[] = [
  {
    slug: "the-builders-launchpad",
    title: "The Builder's Launchpad",
    date: "2026-08-29",
    blurb: "The first AWS Student Builder Group event: from on-premise limits to the cloud.",
  },
  {
    slug: "serverless-event-driven-system",
    title: "Building a Serverless Event-Driven System on AWS",
    date: "2026-09-09",
    blurb: "A hands-on lab on building an event-driven system without servers.",
  },
  {
    slug: "from-bucket-to-server",
    title: "From Bucket to Server: AWS S3 & EC2",
    date: "2026-09-23",
    blurb: "A beginner-friendly, hands-on start with S3 and EC2.",
  },
];

export function photosFor(album: GalleryAlbum, images: GalleryImageData[]) {
  return images
    .filter((img) => img.title === album.title)
    .sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function formatAlbumDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
