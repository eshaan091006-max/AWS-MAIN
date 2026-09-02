"use client";

import React, { useState } from "react";
import { SiGmail, SiInstagram, SiMeetup, SiDiscord, SiWhatsapp } from "react-icons/si";
import { FaAws, FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { contactChannels } from "@/config/contactChannels";
import { cn } from "@/lib/utils";
import { LiquidButton, LiquidButtonStyles } from "@/components/ui/liquid-button";
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

interface ContactHeroProps {
  /** Hands the typed address to the real contact form below. */
  onStart: (email: string) => void;
}

export function ContactHero({ onStart }: ContactHeroProps) {
  // A channel with no URL is not set up yet. Rendering it as a dead link is
  // worse than not offering it — see config/contactChannels.ts.
  const channels = contactChannels.filter((c) => c.url);

  const [email, setEmail] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onStart(email);
    setEmail("");
  };

  return (
    <section className="relative w-full overflow-hidden">
      <LiquidButtonStyles />

      <OrbitingIcons />

      {/* Darkens the middle band so the copy stays readable, and reaches zero at
          both ends.
          It used to end at solid #09090b along the bottom, which is the same
          colour as the page but *opaque* — so it hid the site-wide backdrop
          inside the hero while that backdrop kept showing immediately below.
          Two identical colours, one with glow behind it and one without, meeting
          on a straight line: that was the visible cut between the sections. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, transparent 0%, rgba(9,9,11,0.72) 16%, rgba(9,9,11,0.5) 42%, rgba(9,9,11,0.18) 68%, transparent 90%)",
        }}
        aria-hidden="true"
      />

      {/* Content stack, mirroring the reference: app tile, headline, one line
          of support, then a single pill. Bottom-anchored so the orbit has the
          upper two thirds of the section to itself. */}
      <div className="relative z-20 w-full min-h-[88vh] flex flex-col items-center justify-end px-4 pt-40 pb-24 gap-6 text-center">
        {/* The AWS mark, as an app icon. */}
        <div className="w-16 h-16 rounded-xl ring-1 ring-white/10 shadow-2xl bg-aws-orange flex items-center justify-center">
          <FaAws className="w-10 h-10 text-black" />
        </div>

        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-white leading-[1.05]">
          Let&apos;s build together.
        </h1>

        <p className="text-lg font-medium text-zinc-400">
          Reach the group however you like.
        </p>

        {/* Pill. The reference captures an email here; so does this, except it
            hands the address to the real form below rather than a setTimeout
            that throws it away. */}
        <form
          onSubmit={handleStart}
          className="w-full max-w-md mt-2 relative h-[60px]"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            aria-label="Your email address"
            className="w-full h-[60px] pl-6 pr-[150px] rounded-full outline-none transition-shadow duration-200 bg-navy-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-aws-orange/60"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
          />
          <div className="absolute top-[6px] right-[6px] bottom-[6px]">
            <LiquidButton type="submit" size="md" className="h-full min-w-[140px]">
              Get in touch
            </LiquidButton>
          </div>
        </form>

        {/* Channels, as a compact row. The full-size cards used to live here and
            the page carried a second copy of the same four links in a sidebar;
            this is now the only place they appear. */}
        {/* Channels, as a compact row. The full-size cards used to live here and
            the page carried a second copy of the same four links in a sidebar;
            this is now the only place they appear. */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {channels.map((channel) => {
            const Icon = ICONS[channel.id];
            const isMail = channel.url.startsWith("mailto:");
            return (
              <a
                key={channel.id}
                href={channel.url}
                title={`${channel.label} — ${channel.handle}`}
                aria-label={`${channel.label}: ${channel.handle}`}
                // mailto: must not open a tab — a blank window is left behind
                // when the mail client takes over.
                {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                className={cn(
                  "group relative flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full",
                  "bg-white/[0.05] border border-white/10 backdrop-blur-sm",
                  "transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.09]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/70"
                )}
                style={{ ["--brand" as string]: channel.color }}
              >
                {Icon && (
                  <Icon
                    className="w-4 h-4 text-zinc-400 transition-colors duration-300 group-hover:text-[color:var(--brand)]"
                    aria-hidden="true"
                  />
                )}
                <span className="text-xs font-semibold text-zinc-200">{channel.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
