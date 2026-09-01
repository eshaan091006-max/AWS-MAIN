import { NextResponse } from "next/server";
import sharp from "sharp";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
// Decoding and re-encoding a phone-sized photo takes longer than the default.
export const maxDuration = 30;

// Auth is handled by middleware.ts for the whole /api/admin/* tree.

const BUCKET = "gallery";
const MAX_BYTES = 10 * 1024 * 1024;
/** Longest edge kept. A 4000px phone photo is far more than the page ever shows. */
const MAX_EDGE = 2000;

/**
 * Accepted uploads.
 *
 * Matched on extension as well as MIME type: browsers are inconsistent about
 * HEIC, reporting `image/heic`, `image/heif`, or an empty string for the same
 * file depending on the platform, so trusting the type alone rejects valid
 * iPhone photos.
 */
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "heic", "heif"]);
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export async function POST(req: Request) {
  try {
    const service = getServiceSupabase();
    if (!service) {
      return NextResponse.json(
        { error: "Uploads require SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    // Parsing is fallible for a reason worth separating out: an over-large body
    // makes formData() throw, and collapsing that into "no file was sent" tells
    // someone uploading a 12MB photo to check whether they attached one.
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "That file was too large to receive. The limit is 10MB." },
        { status: 413 }
      );
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was sent." }, { status: 400 });
    }

    const ext = extensionOf(file.name);
    if (!ALLOWED_EXT.has(ext) && !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG and HEIC images can be uploaded." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 10MB.` },
        { status: 400 }
      );
    }

    const input = Buffer.from(await file.arrayBuffer());

    // Everything is re-encoded, not just HEIC.
    //
    // It normalises the output to one web-safe format, strips EXIF (which
    // carries GPS coordinates from a phone — publishing the exact location a
    // photo was taken is not something anyone uploading a group photo expects),
    // and applies the rotation EXIF was describing before that tag is dropped,
    // so portrait shots do not come out sideways.
    let processed: Buffer;
    let width: number | undefined;
    let height: number | undefined;
    try {
      const pipeline = sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true });

      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
      processed = data;
      width = info.width;
      height = info.height;
    } catch (err) {
      console.error("[api/admin/gallery/upload] decode failed:", (err as Error)?.message);
      return NextResponse.json(
        { error: "That file could not be read as an image." },
        { status: 400 }
      );
    }

    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(key, processed, { contentType: "image/jpeg", cacheControl: "31536000" });

    if (uploadError) {
      console.error("[api/admin/gallery/upload] upload failed:", uploadError.message);
      const missingBucket = /bucket/i.test(uploadError.message);
      return NextResponse.json(
        {
          error: missingBucket
            ? "The gallery storage bucket does not exist yet. Run supabase/schema.sql, then try again."
            : "Could not store the image. Please try again.",
        },
        { status: 500 }
      );
    }

    const { data } = service.storage.from(BUCKET).getPublicUrl(key);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      width,
      height,
      bytes: processed.length,
    });
  } catch (err) {
    console.error("[api/admin/gallery/upload] failed:", (err as Error)?.message);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
