"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Cloud,
  Target,
  Eye,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Terminal,
  Code2,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Rocket,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  const memberPerks = [
    {
      title: "Access to AWS Console",
      desc: "Gain guided access to the official AWS Management Console to build, deploy, and experiment with production cloud services in real-time.",
      icon: Terminal,
      color: "text-amber-400 border-amber-500/30",
    },
    {
      title: "Technical Workshops",
      desc: "Participate in hands-on code-alongs and deep-dive technical masterclasses on compute, databases, serverless, containers, and AI.",
      icon: Code2,
      color: "text-blue-400 border-blue-500/30",
    },
    {
      title: "Upskilling for Tech & Non-Tech Backgrounds",
      desc: "Inclusive foundational learning tailored for all students across IT, Science, Commerce, and Arts to build confident digital cloud literacy.",
      icon: GraduationCap,
      color: "text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Access to AWS Skill Builder Certifications",
      desc: "Unlock official digital training, Resources and Video Guides for AWS Servies",
      icon: ShieldCheck,
      color: "text-aws-orange border-aws-orange/40",
    },
    {
      title: "Hands-on Applications of AWS in Industry",
      desc: "Explore real-world enterprise architectures, cloud migration case studies, and how global industries scale with high availability.",
      icon: Briefcase,
      color: "text-purple-400 border-purple-500/30",
    },
    {
      title: "Learn Through Hands-on Projects",
      desc: "Build cloud applications, GenAI prototypes and Projects that elevate your technical resume.",
      icon: Rocket,
      color: "text-pink-400 border-pink-500/30",
    },
  ];

  return (
    <div className="relative pt-28 pb-20 overflow-hidden">
      {/* Header */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30">
            <Cloud className="w-3.5 h-3.5" />
            <span>WHO WE ARE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Building the Next Generation of <span className="text-gradient-orange">Cloud Leaders</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            SXC AWS Group is a premier student-driven technology community at St. Xavier&apos;s College dedicated to cloud architecture, distributed systems, DevOps engineering, and modern artificial intelligence.
          </p>
        </div>
      </section>

      {/* Mission & Vision Split */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="p-8 rounded-xl bg-navy-900/80 border border-aws-orange/30 backdrop-blur-xl shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-aws-orange/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-aws-orange/20 border border-aws-orange/40 flex items-center justify-center text-aws-orange">
              <Target className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To democratize access to advanced cloud computing education and foster a collaborative environment where students learn by building production-grade distributed architectures. We bridge the gap between theoretical computer science and modern cloud industry practice.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-mono text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-aws-orange" />
                <span>Hands-on practice over passive theory</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-aws-orange" />
                <span>Providing Access to Free AWS Skill Builder Certification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-aws-orange" />
                <span>Inclusive community welcoming all skill tiers</span>
              </li>
            </ul>
          </div>

          {/* Vision Card */}
          <div className="p-8 rounded-xl bg-navy-900/80 border border-blue-500/30 backdrop-blur-xl shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Eye className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To empower students to build, innovate, and lead with cloud technology.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-mono text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Introduce students to AWS and cloud computing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Make cloud learning accessible to non-technical backgrounds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Encourage students to learn through practical projects</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* What Members Get */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>MEMBER ADVANTAGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What You Get as a Member
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Everything you need to accelerate your technical skills, build a stellar portfolio, and break into the top tier of cloud computing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberPerks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className={`p-6 sm:p-7 rounded-xl bg-navy-900/70 border ${perk.color} backdrop-blur-md hover:bg-navy-900 transition-all hover:scale-[1.02] flex flex-col justify-between shadow-xl`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-navy-950 flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{perk.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8">
        <div className="p-8 rounded-xl bg-gradient-to-r from-navy-900 to-navy-950 border border-aws-orange/30 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-2xl">
          <div>
            <h3 className="text-2xl font-bold text-white">Want to be part of our next milestone?</h3>
            <p className="text-xs text-slate-300 mt-1">Join SXC AWS Group as a member, speaker, or community partner.</p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono shadow-lg transition-all shrink-0"
          >
            Apply to Join Today →
          </Link>
        </div>
      </section>
    </div>
  );
}
