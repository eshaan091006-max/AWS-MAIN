import React from "react";
import Link from "next/link";
import { Cloud, Terminal } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNavItems } from "@/config/navigation";
import { BackToTop } from "./BackToTop";

/** The tagline, split so the marquee can space it out. Same words as before. */
const MARQUEE_WORDS = ["Learn", "Build", "Deploy", "Scale"];

const LINK_GROUPS = [
  { heading: "Explore", items: footerNavItems.explore },
  { heading: "AWS Learning", items: footerNavItems.learn },
  { heading: "Community", items: footerNavItems.community },
];

export function Footer() {
  return (
    <footer className="relative z-10 bg-[#050506] overflow-hidden">
      {/* ---------- Tilted marquee ---------- */}
      <div className="relative border-y border-white/[0.07] py-4 -mt-px">
        {/* Rotated and over-wide so the tilt never exposes a corner of the page
            behind it. overflow-hidden on the parent keeps the excess off-screen. */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-1/2 w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-2">
            <div className="flex whitespace-nowrap will-change-transform footer-marquee">
              {/* Rendered twice: the animation translates by exactly half the
                  track, so the second copy is in the first one's place when it
                  loops and the seam never shows. */}
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                  {MARQUEE_WORDS.map((word) => (
                    <span key={word} className="flex items-center">
                      <span className="px-8 text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        {word}
                      </span>
                      <span className="text-aws-orange/70 text-xs">&#10022;</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Reserves the strip's height; the marquee above is absolutely placed. */}
        <div className="h-7" />
      </div>

      <div className="relative">
        {/* ---------- Ghost wordmark ---------- */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-16 flex items-end justify-center select-none"
        >
          <span className="font-display font-black leading-[0.8] tracking-tighter text-[22vw] bg-gradient-to-b from-white/[0.05] to-white/[0.012] bg-clip-text text-transparent">
            AWS SBG
          </span>
        </div>

        <div className="relative max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-16 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Brand */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-aws-orange flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-black stroke-[2.2]" />
                </div>
                <div className="font-display font-extrabold text-xl text-white tracking-tight">
                  SXC AWS <span className="text-aws-orange">Group</span>
                </div>
              </Link>

              <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                {siteConfig.description}
              </p>

              <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-aws-orange" />
                <span>Learn. Build. Deploy. Scale.</span>
              </div>
            </div>

            {/* Links, as pill rows rather than plain lists. */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {LINK_GROUPS.map((group) => (
                <div key={group.heading}>
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">
                    {group.heading}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item.href + item.title}>
                        <Link
                          href={item.href}
                          className="inline-flex px-3.5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 transition-all hover:bg-white/[0.07] hover:text-white hover:border-white/20"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Clearance so the wordmark behind has room before the bottom bar. */}
          <div className="h-28 sm:h-36" />

          {/* ---------- Bottom bar ---------- */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 border-t border-white/[0.07]">
            <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-600 order-2 sm:order-1">
              © {new Date().getFullYear()} SXC AWS Group. All rights reserved.
            </p>

            <div className="flex items-center gap-3 order-1 sm:order-2">
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                <Terminal className="w-3.5 h-3.5 text-aws-orange" />
                <span>Learn. Build. Deploy. Scale.</span>
              </span>
              <BackToTop />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
