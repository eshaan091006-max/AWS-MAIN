import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  Eye,
  CheckCircle,
  ArrowRight,
  Terminal,
  Code2,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Rocket,
} from "lucide-react";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { DecodeText } from "@/components/ui/decode-text";
import { MagneticButton } from "@/components/ui/magnetic-button";

// A server component now. It was "use client" without using a single hook,
// which meant it could not export metadata — so the page had no title or
// description of its own and fell back to the site-wide template.
export const metadata: Metadata = {
  title: "About",
  description:
    "The SXC AWS Student Builder Group at St. Xavier's College — what we do, what we believe, and what members get.",
};

const MEMBER_PERKS = [
  {
    title: "Access to AWS Console",
    desc: "Guided access to the official AWS Management Console to build, deploy and experiment with production cloud services in real time.",
    icon: Terminal,
  },
  {
    title: "Technical Workshops",
    desc: "Hands-on code-alongs and deep-dive masterclasses on compute, databases, serverless, containers and AI.",
    icon: Code2,
  },
  {
    title: "For Tech and Non-Tech Alike",
    desc: "Foundational learning tailored for students across IT, Science, Commerce and Arts, to build confident cloud literacy.",
    icon: GraduationCap,
  },
  {
    title: "Skill Builder Certifications",
    desc: "Official digital training, resources and video guides for AWS services, free to members.",
    icon: ShieldCheck,
  },
  {
    title: "AWS in Industry",
    desc: "Real enterprise architectures, cloud migration case studies, and how global industries scale with high availability.",
    icon: Briefcase,
  },
  {
    title: "Hands-on Projects",
    desc: "Build cloud applications and GenAI prototypes that carry real weight on a technical resume.",
    icon: Rocket,
  },
];

const MISSION_POINTS = [
  "Hands-on practice over passive theory",
  "Free access to AWS Skill Builder certification",
  "An inclusive community welcoming all skill levels",
];

const VISION_POINTS = [
  "Introduce every student to AWS and cloud computing",
  "Make cloud learning accessible to non-technical backgrounds",
  "Turn curiosity into deployed, working projects",
];

export default function AboutPage() {
  return (
    <div className="relative pb-28">
      <div className="pt-32 px-4 sm:px-8 lg:px-12">
        <header className="relative max-w-6xl mx-auto">
          {/* Ghost numeral and left-aligned heading, as on the department
              pages and the home sections. The old page centred everything,
              which is the one layout the rest of the site never uses. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-3 select-none text-[9rem] sm:text-[12rem] font-display font-bold leading-none text-white/[0.035]"
          >
            00
          </span>

          <div className="relative max-w-3xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
              <DecodeText text="WHO WE ARE" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.05]">
              Building the next generation of{" "}
              <span className="text-gradient-orange">cloud leaders</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 mt-6 leading-relaxed">
              A student-driven technology community at St. Xavier&apos;s College, built
              around cloud architecture, distributed systems, DevOps and modern
              artificial intelligence.
            </p>
          </div>
        </header>
      </div>

      <ScrollSection
        id="beliefs"
        index={1}
        eyebrow="What drives us"
        title="Why the group"
        highlight="exists"
        sub="Two statements the committee works to, and the commitments underneath each."
      >
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4" step={0.08}>
          <SpotlightCard
            as="article"
            className="h-full rounded-xl border border-white/10 bg-navy-950 p-7 transition-colors duration-300 hover:border-aws-orange/30"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-aws-orange/10 border border-aws-orange/25 flex items-center justify-center text-aws-orange">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mt-5">Our mission</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mt-3">
                To make advanced cloud education available to every student, and to build
                a place where people learn by shipping production-grade architectures —
                bridging the gap between coursework and how the cloud industry actually
                works.
              </p>
              <ul className="mt-5 space-y-2">
                {MISSION_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <CheckCircle className="w-3.5 h-3.5 text-aws-orange mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>

          <SpotlightCard
            as="article"
            className="h-full rounded-xl border border-white/10 bg-navy-950 p-7 transition-colors duration-300 hover:border-ambient-violet/40"
          >
            <div className="relative">
              {/* The one place a second colour appears, and it is the ambient
                  violet the rest of the site already uses for atmosphere —
                  not a seventh accent invented for this card. */}
              <div className="w-11 h-11 rounded-xl bg-ambient-indigo/10 border border-ambient-indigo/25 flex items-center justify-center text-ambient-violet">
                <Eye className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mt-5">Our vision</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mt-3">
                To empower students to build, innovate and lead with cloud technology — so
                that leaving college with real deployed systems behind you is the norm,
                not the exception.
              </p>
              <ul className="mt-5 space-y-2">
                {VISION_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <CheckCircle className="w-3.5 h-3.5 text-ambient-violet mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>
        </RevealGroup>
      </ScrollSection>

      <ScrollSection
        id="membership"
        index={2}
        eyebrow="Member advantages"
        title="What you get as a"
        highlight="member"
        sub="Six things every member gets, from their first login to their first deployed architecture."
      >
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.08] rounded-xl overflow-hidden border border-white/10">
          {MEMBER_PERKS.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <SpotlightCard
                as="article"
                key={perk.title}
                className="group h-full bg-navy-950 p-6 transition-colors duration-300 hover:bg-navy-900"
              >
                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    {/* One accent, not six. The old page gave each card its own
                        colour — amber, blue, emerald, orange, purple, pink —
                        which is the palette fight the config warns about: with
                        everything accented, nothing reads as the action. */}
                    <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-aws-orange group-hover:border-aws-orange/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{perk.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{perk.desc}</p>
                </div>
              </SpotlightCard>
            );
          })}
        </RevealGroup>
      </ScrollSection>

      <section className="relative px-4 sm:px-8 lg:px-12 pt-4">
        <Reveal>
          <div className="max-w-6xl mx-auto rounded-xl border border-aws-orange/25 bg-gradient-to-br from-navy-900 to-navy-950 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Want to be part of the next one?
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Join as a member, a speaker, or a community partner.
              </p>
            </div>
            <MagneticButton
              as={Link}
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-sm"
            >
              <span>Get in touch</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
