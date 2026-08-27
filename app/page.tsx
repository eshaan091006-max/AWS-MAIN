import React from "react";
import Link from "next/link";
import { Cloud, ArrowRight, ArrowUpRight, Sparkles, Terminal, Code, Users, Trophy, Cpu, Zap, Shield, Rocket, CheckCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { EventCard } from "@/components/events/EventCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { db } from "@/lib/db";

export const metadata = {
  title: "SXC AWS Group — Build. Deploy. Scale. | St. Xavier's College",
  description: "Official SXC AWS Student Community at St. Xavier's College. Learn cloud computing, deploy serverless architectures, compete in hackathons, and master AWS technologies.",
};

export const revalidate = 60;

export default async function HomePage() {
  const events = await db.listEvents();
  const projects = db.getProjects();
  const featuredEvents = events.filter((e) => e.isFeatured || e.status === "UPCOMING").slice(0, 2);
  const featuredProjects = projects.filter((p) => p.isFeatured).slice(0, 3);

  const whatWeDo = [
    {
      title: "Learn",
      category: "Cloud Education",
      desc: "Hands-on workshops, AWS certification roadmaps, and cloud masterclasses led by certified mentors.",
      icon: Terminal,
      color: "from-amber-500/20 to-aws-orange/5",
      border: "border-amber-500/30",
      accent: "text-amber-400",
    },
    {
      title: "Build",
      category: "Real-World Systems",
      desc: "Build applications, services, and AI models on AWS infrastructure.",
      icon: Code,
      color: "from-blue-500/20 to-cyan-500/5",
      border: "border-blue-500/30",
      accent: "text-blue-400",
    },
    {
      title: "Connect",
      category: "Industry & Mentorship",
      desc: "Network with Cloud Enthuisasts, Collaborate and Build Applications Together",
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/5",
      border: "border-emerald-500/30",
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="relative overflow-hidden pt-28 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-16">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl space-y-6 text-center">
            {/* Small AWS Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900/90 border border-aws-orange/40 text-aws-orange text-xs font-mono font-bold shadow-lg shadow-aws-orange/10">
              <span className="w-2 h-2 rounded-full bg-aws-orange animate-pulse" />
              <span>AWS COMMUNITY • SXC</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white leading-[1.08]">
                BUILD. DEPLOY. <br />
                <span className="text-gradient-orange">SCALE.</span>
              </h1>
              <div className="text-xl sm:text-2xl font-mono font-bold text-slate-300 tracking-wider">
                St. Xavier&apos;s College AWS Group
              </div>
            </div>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Empowering students to build the future with cloud computing, AWS architecture, distributed systems, and generative artificial intelligence.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/about"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-sm shadow-xl shadow-aws-orange/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Explore the Club</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/events"
                className="px-6 py-3 rounded-xl bg-navy-900/80 hover:bg-navy-800 text-slate-200 hover:text-aws-orange border border-white/15 hover:border-aws-orange/50 text-sm font-semibold transition-all backdrop-blur-md flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-aws-orange" />
                <span>Upcoming Events</span>
              </Link>
            </div>

            {/* Verified Cloud Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-aws-orange" />
                <span>AWS Educate Partner</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-aws-orange" />
                <span>Zero Server Overhead</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-aws-orange" />
                <span>50+ Active Builders</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT WE DO CARDS */}
      <section className="relative max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY PILLARS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What We Do at <span className="text-aws-orange">SXC AWS</span>
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            A comprehensive ecosystem designed to transform passionate students into elite cloud engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {whatWeDo.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`p-6 rounded-2xl bg-gradient-to-b ${item.color} bg-navy-900/80 border ${item.border} backdrop-blur-xl hover:border-aws-orange transition-all duration-300 hover:scale-103 flex flex-col justify-between shadow-xl`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-navy-950/80 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                    <Icon className={`w-6 h-6 ${item.accent}`} />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FEATURED EVENTS SECTION */}
      <section className="relative max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>LIVE GATHERINGS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Featured Events & <span className="text-gradient-orange">Workshops</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Join hands-on cloud labs, flagship hackathons, and live architecture reviews.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-aws-orange hover:text-white transition-colors"
          >
            <span>View All Events ({events.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} featured />
          ))}
        </div>
      </section>

      {/* 6. FEATURED PROJECTS SHOWCASE */}
      <section className="relative max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
              <Rocket className="w-3.5 h-3.5" />
              <span>STUDENT INNOVATION</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Featured Cloud <span className="text-gradient-orange">Projects</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Real distributed systems built by SXC AWS student architects and deployed to production.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-aws-orange hover:text-white transition-colors"
          >
            <span>Explore Projects Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl bg-navy-900/70 border border-white/10 text-center space-y-4 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-aws-orange/15 border border-aws-orange/30 flex items-center justify-center mx-auto text-aws-orange">
            <Rocket className="w-7 h-7" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Student Projects Coming Soon</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Our 2026 student cohort projects are currently undergoing architecture reviews. Deployments will be featured here soon.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono transition-all shadow-md mt-2"
          >
            <span>View Projects Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION BANNER */}
      <section className="relative max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-10 pb-16">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-aws-orange/40 shadow-2xl text-center space-y-6">
          {/* Cyber accents */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-aws-orange/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/20 text-aws-orange border border-aws-orange/40">
            <span>SXC AWS STUDENT COMMUNITY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto">
            Ready to Build Your First <span className="text-gradient-orange">Cloud Architecture?</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Whether you are writing your first line of code or deploying complex multi-region Kubernetes clusters, SXC AWS Group is your launchpad.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-sm shadow-xl shadow-aws-orange/25 transition-all hover:scale-105 active:scale-95"
            >
              Join the Community Today
            </Link>
            <Link
              href="/teams"
              className="px-8 py-3.5 rounded-xl bg-navy-950 hover:bg-navy-800 text-slate-200 hover:text-aws-orange border border-white/15 hover:border-aws-orange text-sm font-semibold transition-all"
            >
              Meet Our Teams
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
