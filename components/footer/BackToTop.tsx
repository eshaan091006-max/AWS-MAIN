"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

/**
 * The only interactive part of the footer, so it is the only part that has to
 * be a client component — the rest stays server-rendered.
 *
 * Honours reduced motion: a smooth scroll across a 5,000px page is a long
 * unbroken slide, which is exactly the kind of movement that setting is for.
 */
export function BackToTop() {
  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 flex items-center justify-center transition-all hover:bg-white/[0.09] hover:text-white hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/70"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
