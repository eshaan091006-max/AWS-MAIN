"use client";

import React from "react";
import { SiGmail, SiInstagram, SiMeetup, SiDiscord, SiWhatsapp } from "react-icons/si";
import { FaAws, FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { contactChannels } from "@/config/contactChannels";
import { cn } from "@/lib/utils";

const ICONS: Record<string, IconType> = {
  gmail: SiGmail,
  instagram: SiInstagram,
  meetup: SiMeetup,
  aws: FaAws,
  discord: SiDiscord,
  linkedin: FaLinkedin,
  whatsapp: SiWhatsapp,
};

/**
 * The contact page header, built on the waitlist-hero layout: three slowly
 * counter-rotating discs behind a bottom-anchored stack, with a gradient that
 * dissolves the whole thing into the page background.
 *
 * Two departures from the component as supplied.
 *
 * The rotating layers were three PNGs hotlinked from framerusercontent.com —
 * someone else's Framer CDN. Those are three render-blocking cross-origin
 * requests for pure decoration, and they break for good the day that account
 * rotates its assets. They are CSS gradients here: no network, no third party,
 * and they can be tinted to the site palette, which a fixed PNG cannot.
 *
 * The email capture is gone. It was a `setTimeout` pretending to be a signup —
 * fine in a demo, quietly discarding real messages in production. This page
 * already has a contact form that writes to Supabase, sitting directly below,
 * so the hero offers the channels instead.
 */
export function ContactHero() {
  // A channel with no URL is not set up yet. Rendering it as a dead link is
  // worse than not offering it — see config/contactChannels.ts.
  const channels = contactChannels.filter((c) => c.url);

  return (
    <section className="relative w-full overflow-hidden">
      <style>{`
        @keyframes contact-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes contact-spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .contact-disc-cw  { animation: contact-spin 60s linear infinite; }
        .contact-disc-ccw { animation: contact-spin-reverse 75s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .contact-disc-cw, .contact-disc-ccw { animation: none; }
        }
      `}</style>

      {/* Rotating backdrop. rotateX lays the discs down into a shallow plane so
          they read as a horizon rather than as flat circles on the screen. */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          perspective: "1200px",
          transform: "perspective(1200px) rotateX(15deg)",
          transformOrigin: "center bottom",
          // Clipping a rotateX'd plane leaves its straight edges visible as a
          // trapezoid sitting on the page. Feathering the layer instead means
          // the light just runs out, with no boundary to notice.
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 40%, #000 35%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 70% at 50% 40%, #000 35%, transparent 78%)",
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 contact-disc-cw">
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: "1600px",
              height: "1600px",
              transform: "translate(-50%, -50%)",
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.20) 60deg, transparent 140deg, rgba(255,153,0,0.16) 220deg, transparent 300deg)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="absolute inset-0 contact-disc-ccw">
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: "1000px",
              height: "1000px",
              transform: "translate(-50%, -50%)",
              background:
                "conic-gradient(from 120deg, transparent 0deg, rgba(167,139,250,0.24) 80deg, transparent 180deg, rgba(255,153,0,0.14) 280deg, transparent 340deg)",
              filter: "blur(50px)",
            }}
          />
        </div>

        <div className="absolute inset-0 contact-disc-cw">
          <div
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: "620px",
              height: "620px",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,153,0,0.22) 0%, rgba(255,153,0,0.06) 45%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
        </div>
      </div>

      {/* Dissolves the backdrop into the page so the section has no hard edge. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #09090b 8%, rgba(9,9,11,0.82) 42%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-20 w-full flex flex-col items-center justify-end px-4 pt-44 pb-20 gap-5 text-center">
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
        <div className="w-full max-w-3xl mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {channels.map((channel) => {
            const Icon = ICONS[channel.id];
            const isMail = channel.url.startsWith("mailto:");
            return (
              <a
                key={channel.id}
                href={channel.url}
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
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(120px circle at 50% 0%, color-mix(in srgb, var(--brand) 26%, transparent), transparent 70%)",
                    boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--brand) 34%, transparent)",
                  }}
                />
                {Icon && (
                  <Icon
                    className="relative w-6 h-6 text-zinc-400 transition-colors duration-300 group-hover:text-[color:var(--brand)]"
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
    </section>
  );
}
