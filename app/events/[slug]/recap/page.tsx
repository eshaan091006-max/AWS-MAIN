import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { eventRecaps, findRecap } from "@/config/eventRecaps";
import { RecapShowcase } from "@/components/events/RecapShowcase";

interface Props {
  params: Promise<{ slug: string }>;
}

// Recaps are written into the repo rather than the database, so every one that
// exists is known at build time and none of them are dynamic.
export const dynamicParams = false;

export function generateStaticParams() {
  return eventRecaps.map((recap) => ({ slug: recap.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recap = findRecap(slug);
  if (!recap) return { title: "Recap Not Found" };
  return {
    title: `${recap.title} — Session Recap`,
    description: recap.summary,
  };
}

export default async function RecapPage({ params }: Props) {
  const { slug } = await params;
  const recap = findRecap(slug);
  if (!recap) notFound();

  return (
    <div className="relative pt-36 pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        <Link
          href={`/events/${recap.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to the event
        </Link>

        <header className="mt-8 max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
            Session recap
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.05]">
            {recap.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">{recap.summary}</p>
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mt-5">
            Presented by {recap.presenter}
          </p>
        </header>

        <RecapShowcase recap={recap} />
      </div>
    </div>
  );
}
