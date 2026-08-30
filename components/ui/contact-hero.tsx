"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { SiGmail, SiInstagram, SiMeetup, SiDiscord, SiWhatsapp } from "react-icons/si";
import { FaAws, FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { contactChannels } from "@/config/contactChannels";
import { cn } from "@/lib/utils";
import { OrbitingIcons } from "@/components/ui/orbiting-icons";

const ICONS: Record<string, IconType> = {
  gmail: SiGmail,
  instagram: SiInstagram,
  meetup: SiMeetup,
  aws: FaAws,
  discord: SiDiscord,
  linkedin: FaLinkedin,
  whatsapp: SiWhatsapp,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

/**
 * The contact page header, built on the waitlist-hero layout: three
 * counter-rotating rings of icon tiles behind a bottom-anchored stack, with a
 * gradient that dissolves the whole thing into the page background.
 *
 * The celebration — confetti burst, expanding rings, icon pop — is the
 * waitlist-hero's submit-success moment, moved onto the channel cards. It fires
 * on click, which is the equivalent beat: the point where someone commits to
 * reaching out.
 *
 * Departures from the component as supplied:
 *
 *   - The email capture is gone. It was a setTimeout pretending to be a signup,
 *     which on a live contact page silently discards whatever someone types.
 *     The real Supabase form is directly below this.
 *   - The rotating layers were three PNGs hotlinked from framerusercontent.com,
 *     someone else's Framer CDN. Rebuilt from real elements in OrbitingIcons:
 *     no cross-origin requests for decoration, and the icons can be ones that
 *     mean something here.
 *   - One canvas and one animation loop for the whole grid rather than one per
 *     card. The original creates a fresh rAF loop per burst, so rapid clicks
 *     leave several loops running over the same canvas, each clearing what the
 *     others drew.
 */
export function ContactHero() {
  // A channel with no URL is not set up yet. Rendering it as a dead link is
  // worse than not offering it — see config/contactChannels.ts.
  const channels = contactChannels.filter((c) => c.url);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const [celebrating, setCelebrating] = useState<string | null>(null);

  // Keeps the backing store matched to the CSS size and the device pixel ratio.
  // Without the DPR step the confetti renders soft and slightly wrong-sized on
  // any retina display.
  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    sizeCanvas();

    // Every external channel opens in a new tab, which hides this one — and a
    // hidden tab stops servicing requestAnimationFrame, so the burst freezes
    // mid-air and would resume whenever the person wanders back, possibly
    // minutes later. Drop it on the way out instead.
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      particlesRef.current = [];
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvasRef.current.width / dpr, canvasRef.current.height / dpr);
      }
    };

    window.addEventListener("resize", sizeCanvas);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", sizeCanvas);
      document.removeEventListener("visibilitychange", onVisibility);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [sizeCanvas]);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      frameRef.current = null;
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity
      p.life -= 2;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(0, p.life / 100);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    // Reset, or every later fill on this context inherits the last alpha.
    ctx.globalAlpha = 1;

    // Stop the loop when there is nothing left to draw, rather than burning a
    // frame forever on an empty canvas.
    frameRef.current = particles.length > 0 ? requestAnimationFrame(tick) : null;
  }, []);

  const fireConfetti = useCallback(
    (originX: number, originY: number, brand: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Brand colour plus the site accents, so the burst belongs to the card
      // you clicked without going full rainbow.
      const palette = [brand, "#FF9900", "#A78BFA", "#6366F1", "#FAFAFA"];

      for (let i = 0; i < 46; i++) {
        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 11,
          vy: (Math.random() - 2) * 8,
          life: 100,
          color: palette[Math.floor(Math.random() * palette.length)],
          size: Math.random() * 3.5 + 1.5,
        });
      }

      if (frameRef.current === null) frameRef.current = requestAnimationFrame(tick);
    },
    [tick]
  );

  const celebrate = (e: React.MouseEvent<HTMLAnchorElement>, channel: (typeof channels)[number]) => {
    const canvas = canvasRef.current;
    const card = e.currentTarget;
    if (canvas) {
      const cRect = canvas.getBoundingClientRect();
      const bRect = card.getBoundingClientRect();
      fireConfetti(
        bRect.left + bRect.width / 2 - cRect.left,
        bRect.top + bRect.height / 2 - cRect.top,
        channel.color
      );
    }
    setCelebrating(channel.id);
    window.setTimeout(() => setCelebrating((id) => (id === channel.id ? null : id)), 900);
    // Deliberately not preventing default: the link still opens. External
    // channels open in a new tab, so the burst plays out on the page behind it.
  };

  return (
    <section className="relative w-full overflow-hidden">
      <style>{`
        @keyframes contact-ring {
          0%   { transform: translate(-50%, -50%) scale(0.35); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(1.6);  opacity: 0; }
        }
        /* Fill mode is both, not forwards. With forwards alone, a ring waiting
           out its animation-delay renders with no transform at all — so the
           centring translate(-50%,-50%) has not been applied yet and the ring
           hangs down and to the right of the card until its turn arrives.
           both makes it hold the 0% keyframe through the delay. */
        .contact-ring {
          transform: translate(-50%, -50%) scale(0.35);
          animation: contact-ring 0.8s ease-out both;
        }

        @keyframes contact-pop {
          0%   { transform: scale(1); }
          45%  { transform: scale(1.28); }
          70%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        .contact-pop { animation: contact-pop 0.6s cubic-bezier(0.175,0.885,0.32,1.275); }

        /* No reduced-motion gate on the burst or the rings: they answer a click
           the person just made, which is feedback rather than decoration, and
           suppressing it would leave the tap feeling dead. The ambient orbit is
           gated, inside OrbitingIcons. */
      `}</style>

      <OrbitingIcons />

      {/* Dissolves the backdrop into the page so the section has no hard edge. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #09090b 3%, rgba(9,9,11,0.62) 34%, rgba(9,9,11,0.25) 62%, transparent 92%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-20 w-full min-h-[86vh] flex flex-col items-center justify-end px-4 pt-40 pb-20 gap-5 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono font-semibold text-zinc-300 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-aws-orange" />
          <span>We reply to everything</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-display font-black tracking-tight leading-[1.03] text-white">
          Let&apos;s build <span className="text-gradient-orange">together.</span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
          Questions about joining, speaking, sponsoring, or collaborating — pick
          whichever channel you actually use.
        </p>

        {/* Channel grid */}
        <div className="relative w-full max-w-3xl mt-6">
          {/* One canvas for the whole grid. Overflows the grid box on purpose so
              particles can arc past the cards instead of being clipped at the
              edge, and ignores pointer events so it never eats a click. */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-20 -top-24 -bottom-16 w-[calc(100%+10rem)] h-[calc(100%+10rem)] z-30"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {channels.map((channel) => {
              const Icon = ICONS[channel.id];
              const isMail = channel.url.startsWith("mailto:");
              const isCelebrating = celebrating === channel.id;
              return (
                <a
                  key={channel.id}
                  href={channel.url}
                  onClick={(e) => celebrate(e, channel)}
                  // mailto: must not open a tab — a blank window is left behind
                  // when the mail client takes over.
                  {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 px-4 py-5 rounded-2xl",
                    "bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm",
                    "transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/70"
                  )}
                  style={{ ["--brand" as string]: channel.color }}
                >
                  {/* Brand-coloured bloom, hover only. Sits behind the content and
                      ignores pointer events so it never eats the click. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300",
                      isCelebrating ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    style={{
                      background:
                        "radial-gradient(120px circle at 50% 0%, color-mix(in srgb, var(--brand) 26%, transparent), transparent 70%)",
                      boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--brand) 34%, transparent)",
                    }}
                  />

                  {/* Celebration rings, staggered so they read as a ripple
                      rather than one thick stroke. */}
                  {isCelebrating && (
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
                      {[0, 0.15, 0.3].map((delay) => (
                        <span
                          key={delay}
                          // Circles, not rounded rectangles. A card-shaped ring
                          // scaled up puts long straight edges across its
                          // neighbours, and the section clips them into stray
                          // lines rather than anything that reads as a ripple.
                          className="contact-ring absolute top-1/2 left-1/2 w-40 h-40 rounded-full border-2"
                          style={{
                            borderColor: "color-mix(in srgb, var(--brand) 70%, transparent)",
                            animationDelay: `${delay}s`,
                          }}
                        />
                      ))}
                    </span>
                  )}

                  {Icon && (
                    <Icon
                      className={cn(
                        "relative w-6 h-6 transition-colors duration-300",
                        isCelebrating
                          ? "contact-pop text-[color:var(--brand)]"
                          : "text-zinc-400 group-hover:text-[color:var(--brand)]"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative text-sm font-semibold text-white">{channel.label}</span>
                  <span className="relative text-[11px] text-zinc-500 truncate max-w-full">
                    {channel.handle}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
