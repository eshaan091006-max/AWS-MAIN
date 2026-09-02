"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HoverSlider,
  HoverSliderImage,
  HoverSliderImageWrap,
  HoverSliderPanel,
  TextStaggerHover,
  useActiveSlide,
} from "@/components/ui/animated-slideshow";
import type { EventRecap, RecapSlide } from "@/config/eventRecaps";

/**
 * The deck, rebuilt as a page.
 *
 * The running order is the navigation: hovering, tapping or tabbing to a title
 * brings up that slide's artwork and what was said on it. The writeup lives
 * below the visual rather than beside it, so the line length stays readable at
 * every width instead of collapsing into a narrow column on a laptop.
 */
export function RecapShowcase({ recap }: { recap: EventRecap }) {
  return (
    <HoverSlider className="mt-14">
      <div className="grid items-start gap-8 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        {/* Running order */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-5">
            {recap.slides.length} slides
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:gap-2">
            {recap.slides.map((slide, index) => (
              <div key={slide.title} className="flex items-baseline gap-3 sm:gap-4">
                <span className="text-[10px] font-mono text-zinc-600 tabular-nums w-5 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <TextStaggerHover
                  index={index}
                  text={slide.title}
                  className="cursor-pointer text-lg sm:text-xl md:text-2xl font-display font-black uppercase tracking-tight text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Visual. Pinned: the running order is taller than the viewport, so an
            unpinned panel would sit off-screen exactly when a title near the
            bottom of the list is selected. On small screens it leads instead of
            trailing, for the same reason. */}
        <div className="order-first lg:order-none lg:sticky lg:top-28">
          <HoverSliderImageWrap className="rounded-xl border border-white/10 bg-white/[0.04] aspect-[3/2]">
            {recap.slides.map((slide, index) =>
              slide.image ? (
                <HoverSliderImage
                  key={slide.title}
                  index={index}
                  src={slide.image}
                  alt={slide.alt ?? ""}
                  className="size-full object-contain bg-white"
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <HoverSliderPanel
                  key={slide.title}
                  index={index}
                  className="p-5 sm:p-10 overflow-y-auto bg-gradient-to-br from-navy-900 to-navy-950"
                >
                  <TextOnlySlide slide={slide} />
                </HoverSliderPanel>
              )
            )}
          </HoverSliderImageWrap>

          <RecapDetail slides={recap.slides} />
        </div>
      </div>
    </HoverSlider>
  );
}

/** The title card, the group activity and the closing quote. */
function TextOnlySlide({ slide }: { slide: RecapSlide }) {
  if (slide.questions) {
    return (
      <ol className="space-y-2.5 sm:space-y-4 w-full max-w-md">
        {slide.questions.map((q, i) => (
          <li key={q} className="flex gap-3 sm:gap-4 items-baseline">
            <span className="text-aws-orange font-mono text-[10px] sm:text-xs shrink-0">{i + 1}</span>
            <span className="text-[13px] sm:text-base text-zinc-200 leading-snug sm:leading-relaxed">{q}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <p className="text-base sm:text-2xl font-display font-black text-white text-center text-balance leading-snug max-w-lg">
      {slide.quote}
    </p>
  );
}

/**
 * What was said on the slide currently showing.
 *
 * Three slides deliberately carry no writeup — the title card, the group
 * activity (whose content was whatever the room answered) and the closing
 * quote. Rather than leave a hole, each says what it is.
 */
function RecapDetail({ slides }: { slides: RecapSlide[] }) {
  const active = useActiveSlide();
  const slide = slides[active];

  return (
    <div className="mt-6 min-h-[13rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {slide.writeup ? (
            <>
              <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
                {slide.writeup}
              </p>
              {slide.points && (
                <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {slide.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-xs text-zinc-400 leading-relaxed">
                      <span aria-hidden="true" className="text-aws-orange/70 shrink-0">
                        —
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500 leading-relaxed italic">
              {slide.questions
                ? "Worked through in the room — the answers were the attendees' own."
                : "The slide speaks for itself."}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
