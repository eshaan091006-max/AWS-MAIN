"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}
@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear infinite; }
.animate-footer-heartbeat { animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }

/* Hovering the marquee holds it still, which is the pause mechanism WCAG 2.2.2
   asks for on content that moves by itself for more than five seconds. */
.animate-footer-scroll-marquee:hover { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .animate-footer-scroll-marquee { animation-duration: 100s; }
  .animate-footer-breathe { animation: none; }
  .animate-footer-heartbeat { animation: none; }
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 15%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

/* Centred by inset-x-0 plus text-align, deliberately not by a translate.
   GSAP animates the transform property on this element for the parallax, which
   overwrites any transform set in CSS — so a -translate-x-1/2 centering is
   silently thrown away the moment the tween runs, and the wordmark ends up half
   its own width to the right and clipped.

   18vw rather than 22vw: at 22vw the wordmark measured 99% of the viewport, so
   it touched both edges with nothing to spare. */
.footer-giant-bg-text {
  font-size: 18vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
`;

export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

/**
 * A control that leans toward the cursor.
 *
 * The pull is skipped on coarse pointers and under reduced motion. On touch
 * there is no hover to drive it, and the transform would only ever be applied
 * on tap — the element would jump sideways under the finger that pressed it.
 */
const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        // The original swaps these: it halves the width into `h` and the height
        // into `w`, then subtracts `h` from x and `w` from y. On a wide pill
        // that offsets the origin by tens of pixels, so the button lurches as
        // the pointer enters instead of easing toward it.
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const x = e.clientX - rect.left - halfW;
        const y = e.clientY - rect.top - halfH;

        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          rotationX: -y * 0.15,
          rotationY: x * 0.15,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
        gsap.killTweensOf(element);
      };
    }, []);

    const setRefs = (node: HTMLElement | null) => {
      (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    // createElement rather than <Tag ...>.
    //
    // The props type intersects button and anchor attributes, which leaves every
    // key they share — children included — as `never`. Writing it as JSX makes
    // TypeScript pick one arbitrary member of the ElementType union to check
    // against (it lands on SVGSymbolElement) and every prop then fails. Going
    // through createElement keeps the public prop types intact and confines the
    // looseness to this one call.
    return React.createElement(
      Component,
      {
        ...props,
        ref: setRefs,
        className: cn("cursor-pointer", className),
      } as Record<string, unknown>,
      children
    );
  }
);
MagneticButton.displayName = "MagneticButton";

export interface CinematicFooterProps {
  /** Big metallic statement. */
  heading: string;
  /** Words cycled through the diagonal marquee. */
  marqueeWords: string[];
  /** Ghosted wordmark behind everything. */
  wordmark: string;
  /** Prominent calls to action. */
  primaryLinks: { label: string; href: string; icon?: React.ReactNode; external?: boolean }[];
  /** Grouped navigation, rendered as pills. */
  linkGroups: { heading: string; items: { title: string; href: string }[] }[];
  /** Bottom-left line. Omit to leave that side empty. */
  copyright?: string;
  /** Bottom-right badge text. */
  badge?: React.ReactNode;
}

/**
 * Copies of the word list laid end to end. Must stay even: the loop swaps the
 * first half for the second, which only works if they match.
 */
const MARQUEE_RUNS = 8;

function MarqueeRun({ words }: { words: string[] }) {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="flex items-center">
          <span className="px-8">{word}</span>
          <span className={i % 2 === 0 ? "text-primary/60" : "text-muted-foreground/50"}>✦</span>
        </span>
      ))}
    </div>
  );
}

export function CinematicFooter({
  heading,
  marqueeWords,
  wordmark,
  primaryLinks,
  linkGroups,
  copyright,
  badge,
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        // Land everything in its final state rather than skipping the setup —
        // a `fromTo` that never runs would leave the content at opacity 0.
        gsap.set([giantTextRef.current, headingRef.current, linksRef.current], {
          y: 0,
          opacity: 1,
          scale: 1,
        });
        return;
      }

      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        The curtain reveal: this wrapper occupies real space in the flow, and its
        clip-path makes it the containing block for the fixed footer inside — so
        the footer is only ever painted within these bounds and the page appears
        to slide off it.
      */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground">
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[4vh] inset-x-0 text-center whitespace-nowrap z-0 pointer-events-none select-none"
          >
            {wordmark}
          </div>

          {/* Diagonal marquee */}
          <div className="absolute top-20 md:top-24 left-0 w-full overflow-hidden border-y border-border bg-background/60 backdrop-blur-md py-3 md:py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase">
              {/* The keyframe shifts by exactly -50%, so the second half lands
                  where the first began and the loop has no seam. That only
                  fills the band if each half is at least as wide as the screen
                  — with two runs of four short words, half the track was
                  narrower than a desktop viewport and the strip ran out mid-way
                  with blank band after it. MARQUEE_RUNS is even so the halves
                  stay identical, and high enough that half the track overflows
                  an ultrawide display. */}
              {Array.from({ length: MARQUEE_RUNS }, (_, i) => (
                <MarqueeRun key={i} words={marqueeWords} />
              ))}
            </div>
          </div>

          {/* Centre content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-36 md:mt-24 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl md:text-7xl font-display font-black footer-text-glow tracking-tighter mb-6 md:mb-10 text-center"
            >
              {heading}
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-4 md:gap-6 w-full">
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {primaryLinks.map((link) => (
                  <MagneticButton
                    key={link.href + link.label}
                    as="a"
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="footer-glass-pill px-8 py-4 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3"
                  >
                    {link.icon}
                    {link.label}
                  </MagneticButton>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 sm:gap-10 w-full mt-1 md:mt-2">
                {linkGroups.map((group) => (
                  <div key={group.heading} className="flex flex-col items-center gap-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
                      {group.heading}
                    </span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {group.items.map((item) => (
                        <MagneticButton
                          key={item.href + item.title}
                          as="a"
                          href={item.href}
                          className="footer-glass-pill px-4 py-2 rounded-full text-muted-foreground font-medium text-[11px] md:text-xs"
                        >
                          {item.title}
                        </MagneticButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className={cn(
              "relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center gap-6",
              // With the copyright and badge gone there is one control left, and
              // justify-between would park it against the left edge.
              copyright || badge ? "justify-between" : "justify-end"
            )}
          >
            {copyright && (
              <div className="text-muted-foreground text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
                {copyright}
              </div>
            )}

            {badge && (
              <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default">
                {badge}
              </div>
            )}

            <MagneticButton
              as="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground group order-3 shrink-0"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
