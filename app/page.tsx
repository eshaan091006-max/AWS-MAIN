import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Code2,
  Eye,
  GraduationCap,
  Rocket,
  ShieldCheck,
  Target,
  Terminal,
  Users,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { EventCard } from "@/components/events/EventCard";
import { teamHierarchy } from "@/config/teamHierarchy";
import { db } from "@/lib/db";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "SXC AWS Group — Build. Deploy. Scale. | St. Xavier's College",
  description:
    "Official SXC AWS Student Community at St. Xavier's College. Learn cloud computing, deploy serverless architectures, compete in hackathons, and master AWS technologies.",
};

export const revalidate = 60;

/**
 * The whole club on one page.
 *
 * Every section carries an `id` that the navbar scrolls to. The deeper pages
 * still exist and are still linked from the section that summarises them —
 * this page is the overview, not a replacement for the full events browser or
 * the org tree.
 */
export default async function HomePage() {
  const events = await db.listEvents();
  const upcoming = events.filter((e) => e.status === "UPCOMING");
  // Prefer real upcoming events; fall back to featured ones so the section is
  // never empty between terms.
  const featuredEvents = (upcoming.length > 0 ? upcoming : events.filter((e) => e.isFeatured)).slice(0, 2);

  const departments = teamHierarchy.departments;

  const stats = [
    { value: "2026", label: "Launch year" },
    { value: String(departments.length), label: "Departments" },
    { value: String(events.length), label: "Events run" },
    { value: "AWS", label: "Official group" },
  ];

  const perks = [
    {
      title: "Access to AWS Console",
      desc: "Guided access to the official AWS Management Console to build, deploy, and experiment with production cloud services in real time.",
      icon: Terminal,
    },
    {
      title: "Technical Workshops",
      desc: "Hands-on code-alongs and deep-dive masterclasses on compute, databases, serverless, containers, and AI.",
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

  return (
    <div className="relative">
      <ScrollProgress />

      {/* ============================ HERO ============================ */}
      <section
        id="top"
        className="relative px-4 sm:px-8 lg:px-12 pt-36 pb-24 sm:pt-44 sm:pb-32"
      >
        {/* No background of its own.
            This hero used to stack a skewed Boxes plane on top of the site-wide
            ambient layer and the constellation canvas — three backgrounds
            competing, and the plane's own edge cutting a visible diagonal
            across the section. It now shows the same backdrop as every other
            page: light pools, a masked grid, and the drifting nodes. */}

        <div className="relative max-w-3xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono font-semibold text-zinc-300 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-aws-orange" />
            <span>Official AWS Student Community · SXC</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tight leading-[1.02]">
            <span className="text-white">Build. Deploy.</span>
            <br />
            <span className="text-gradient-orange">Scale.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            A student community at St. Xavier&apos;s College where you learn cloud by
            building it — workshops, hackathons, certifications, and real projects
            on AWS.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href={siteConfig.links.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-sm transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-2"
            >
              <span>Join the Group</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="#about"
              className="px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 hover:border-white/20 text-sm font-semibold transition-all backdrop-blur-sm flex items-center gap-2"
            >
              <span>About Us</span>
            </a>
          </div>

          {/* Stats band */}
          <div className="pt-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
              {stats.map((s) => (
                <div key={s.label} className="bg-navy-950/80 px-4 py-5 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-display font-black text-white">
                    {s.value}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ ABOUT ============================ */}
      <section id="about" className="relative px-4 sm:px-8 lg:px-12 py-24 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            eyebrow="Who we are"
            title="Empowering students to"
            highlight="build with cloud"
            sub="A student-led technical community making cloud computing accessible, practical and genuinely exciting — whatever you're studying."
          />

          <Reveal delay={0.08}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-14">
            <article className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-sm space-y-4 hover:border-white/[0.14] transition-colors">
              <div className="w-11 h-11 rounded-xl bg-aws-orange/10 border border-aws-orange/25 flex items-center justify-center text-aws-orange">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-white">Our Mission</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                To make advanced cloud education available to every student, and to
                build a place where people learn by shipping production-grade
                architectures — bridging the gap between coursework and how the
                cloud industry actually works.
              </p>
              <ul className="space-y-2 pt-1 text-xs text-zinc-400">
                {[
                  "Hands-on practice over passive theory",
                  "Free access to AWS Skill Builder certification",
                  "An inclusive community welcoming all skill levels",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-aws-orange mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-sm space-y-4 hover:border-white/[0.14] transition-colors">
              <div className="w-11 h-11 rounded-xl bg-ambient-indigo/10 border border-ambient-indigo/25 flex items-center justify-center text-ambient-violet">
                <Eye className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-bold text-white">Our Vision</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                To empower students to build, innovate and lead with cloud
                technology — so that leaving college with real deployed systems
                behind you is the norm, not the exception.
              </p>
              <ul className="space-y-2 pt-1 text-xs text-zinc-400">
                {[
                  "Introduce every student to AWS and cloud computing",
                  "Turn curiosity into deployed, working projects",
                  "Grow a community that outlasts any one cohort",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-ambient-violet mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ WHAT YOU GET ============================ */}
      <section id="build" className="relative px-4 sm:px-8 lg:px-12 py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="What you'll build"
            title="Turn ideas into"
            highlight="real projects"
            sub="Six things every member gets, from their first login to their first deployed architecture."
          />

          <Reveal delay={0.08}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px mt-14 bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <article
                  key={perk.title}
                  className="group relative bg-navy-950/85 p-7 backdrop-blur-sm hover:bg-navy-900/85 transition-colors"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-aws-orange group-hover:border-aws-orange/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-zinc-600 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{perk.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{perk.desc}</p>
                </article>
              );
            })}
          </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ EVENTS ============================ */}
      <section id="events" className="relative px-4 sm:px-8 lg:px-12 py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Events"
            title="Learn through"
            highlight="experience"
            sub="Workshops, hackathons and speaker sessions — every one built around doing rather than watching."
          />

          {featuredEvents.length > 0 ? (
            <Reveal delay={0.08}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} featured />
              ))}
            </div>
          </Reveal>
          ) : (
            <div className="mt-14 p-10 rounded-2xl bg-white/[0.02] border border-white/[0.07] text-center backdrop-blur-sm">
              <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">
                Nothing scheduled right now — the next term&apos;s calendar goes up soon.
              </p>
            </div>
          )}

          <div className="flex justify-center mt-10">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 hover:border-aws-orange/40 text-sm font-semibold transition-all"
            >
              <span>Explore all events</span>
              <ArrowRight className="w-4 h-4 text-aws-orange" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ TEAM ============================ */}
      <section id="team" className="relative px-4 sm:px-8 lg:px-12 py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Our team"
            title="The team"
            highlight="behind it all"
          />

          {/* No portraits while there are no photographs — a row of initials
              tiles is a placeholder pretending to be a design. Names and roles
              carry it until real pictures exist. */}
          <Reveal delay={0.08}>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
              {teamHierarchy.faculty.members.map((f) => (
                <div key={f.name} className="bg-navy-950/85 p-7 backdrop-blur-sm">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600">
                    {f.designation}
                  </div>
                  <div className="text-lg font-display font-bold text-white leading-snug mt-2">
                    {f.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-aws-orange/25 bg-aws-orange/[0.06] p-7">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-aws-orange">
                {teamHierarchy.chairperson.role}
              </div>
              <div className="text-2xl font-display font-bold text-white leading-snug mt-2">
                {teamHierarchy.chairperson.name}
              </div>
            </div>
          </Reveal>

          <div className="flex justify-center mt-10">
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 hover:border-aws-orange/40 text-sm font-semibold transition-all"
            >
              <Users className="w-4 h-4 text-aws-orange" />
              <span>Full showcase</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ JOIN ============================ */}
      <section id="join" className="relative px-4 sm:px-8 lg:px-12 py-24 pb-32 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16 bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm text-center space-y-6">
            <div
              className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 65%)" }}
              aria-hidden="true"
            />

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/[0.05] text-zinc-400 border border-white/10">
                Start your journey
              </div>

              <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.08]">
                Ready to start your{" "}
                <span className="text-gradient-orange">cloud journey?</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Whether you&apos;re writing your first line of code or deploying
                multi-region clusters, this is your launchpad.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={siteConfig.links.meetup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3.5 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-sm transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-2"
                >
                  <span>Become a Builder</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <Link
                  href="/contact"
                  className="px-7 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 hover:border-white/20 text-sm font-semibold transition-all"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Shared section header: eyebrow, two-tone headline, one line of context. */
function SectionHeading({
  eyebrow,
  title,
  highlight,
  sub,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  /** Optional: a section whose content already says it can leave this out. */
  sub?: string;
}) {
  return (
    <Reveal className="max-w-2xl">
      <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.08]">
        {title} <span className="text-gradient-orange">{highlight}</span>
      </h2>
      {sub && (
        <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">{sub}</p>
      )}
    </Reveal>
  );
}
