"use client";

import React, { useState } from "react";
import { Server, Cpu, Cloud, Zap, Box, ShieldCheck, ArrowRight, CheckCircle2, Layers } from "lucide-react";
import { motion } from "framer-motion";

export function CloudEvolution() {
  const [activeStep, setActiveStep] = useState(2);

  const steps = [
    {
      id: 0,
      title: "Traditional Infrastructure",
      subtitle: "On-Premises Bare Metal",
      icon: Server,
      era: "1990s - 2000s",
      summary: "Physical servers in private on-premise data centers requiring manual hardware procurement, cabling, high maintenance costs, and lengthy provisioning cycles (weeks/months).",
      traits: ["High capital expense (CapEx)", "Single point of physical failure", "Manual capacity planning", "Slow deployment velocity"],
    },
    {
      id: 1,
      title: "Virtualization",
      subtitle: "Hypervisors & Virtual Machines",
      icon: Cpu,
      era: "2000s - 2006",
      summary: "Hypervisor technology (VMware, Xen) allowed slicing one physical server into multiple isolated Virtual Machines (VMs), maximizing hardware utilization.",
      traits: ["Consolidated hardware footprints", "Snapshot & backup automation", "Still bound to physical data centers", "Manual OS patching overhead"],
    },
    {
      id: 2,
      title: "Cloud Computing",
      subtitle: "Public Cloud & On-Demand APIs",
      icon: Cloud,
      era: "2006 - Present",
      summary: "AWS launched Amazon S3 & EC2 in 2006, introducing pay-as-you-go elastic infrastructure provisioned in seconds via programmatic APIs and global regions.",
      traits: ["Zero upfront hardware CapEx", "Instant global scale across AZs", "Automated elasticity & load balancing", "High reliability SLAs"],
    },
    {
      id: 3,
      title: "Serverless Computing",
      subtitle: "Event-Driven Execution",
      icon: Zap,
      era: "2014 - Present",
      summary: "AWS Lambda introduced execution without managing servers. Pay strictly per millisecond of code execution with sub-second automatic scaling and zero idle costs.",
      traits: ["Zero server management", "Sub-second event-driven triggers", "Pay-as-you-run billing model", "Built-in fault tolerance"],
    },
    {
      id: 4,
      title: "Cloud-Native & AI Mesh",
      subtitle: "Distributed Microservices & Generative Cloud",
      icon: Box,
      era: "Modern 2026",
      summary: "Containers (EKS/ECS), service meshes, immutable infrastructure via Terraform, and integrated Generative AI agents (Amazon Bedrock) form resilient distributed architectures.",
      traits: ["Microservices loosely coupled", "Declarative Infrastructure as Code (IaC)", "Automated CI/CD GitOps pipelines", "Integrated Foundation Model AI"],
    },
  ];

  const cloudModels = [
    {
      title: "IaaS",
      name: "Infrastructure as a Service",
      desc: "Fundamental compute, networking, and storage building blocks (e.g. Amazon EC2, Amazon VPC, Amazon EBS). You manage OS and app.",
      icon: Server,
      color: "border-blue-500/30 text-blue-400",
    },
    {
      title: "PaaS",
      name: "Platform as a Service",
      desc: "Managed application environments where runtime and OS are automated (e.g. AWS Elastic Beanstalk, AWS App Runner).",
      icon: Layers,
      color: "border-purple-500/30 text-purple-400",
    },
    {
      title: "SaaS",
      name: "Software as a Service",
      desc: "End-to-end managed software delivered directly over the web (e.g. Amazon WorkDocs, Salesforce, Figma).",
      icon: Cloud,
      color: "border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Serverless",
      name: "FaaS & Event-Driven",
      desc: "Run backend functions and microservices without maintaining servers (e.g. AWS Lambda, DynamoDB, API Gateway).",
      icon: Zap,
      color: "border-aws-orange/40 text-aws-orange",
    },
    {
      title: "Containers",
      name: "Docker & Kubernetes",
      desc: "Portable lightweight application packages running consistently across dev and cloud (e.g. Amazon EKS, Amazon ECS).",
      icon: Box,
      color: "border-cyan-500/30 text-cyan-400",
    },
    {
      title: "Cloud-Native",
      name: "Resilient Distributed Systems",
      desc: "Architectures built specifically for dynamic cloud environments using CI/CD, observability, and self-healing systems.",
      icon: ShieldCheck,
      color: "border-pink-500/30 text-pink-400",
    },
  ];

  return (
    <section id="cloud-evolution" className="relative py-24 z-10">
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30 mb-3">
            <Cloud className="w-3.5 h-3.5" />
            <span>CLOUD COMPUTING FOUNDATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Evolution of <span className="text-gradient-orange">Cloud Computing</span>
          </h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            From physical server rooms to serverless foundation models. Understand how distributed cloud architectures transformed modern global technology.
          </p>
        </div>

        {/* Step Selector Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${isActive
                    ? "bg-navy-800 border-aws-orange shadow-lg shadow-aws-orange/15"
                    : "bg-navy-900/60 border-white/10 hover:border-white/25 text-slate-400"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-aws-orange text-black" : "bg-navy-950 text-slate-400"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold opacity-70">
                    0{step.id + 1}
                  </span>
                </div>
                <div className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                  {step.title}
                </div>
                <div className="text-[10px] font-mono text-aws-orange-light mt-0.5">{step.era}</div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Details Card */}
        <div className="rounded-3xl bg-navy-900/80 border border-aws-orange/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-aws-orange/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-navy-950 text-aws-orange border border-white/10">
                <span>Phase 0{activeStep + 1}</span>
                <span>•</span>
                <span>{steps[activeStep].subtitle}</span>
              </div>

              <h3 className="text-2xl font-bold text-white leading-tight">
                {steps[activeStep].title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {steps[activeStep].summary}
              </p>

              <div className="pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
                  Core Architectural Characteristics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {steps[activeStep].traits.map((trait, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-950/80 border border-white/5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-aws-orange shrink-0" />
                      <span className="truncate">{trait}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-950/90 border border-white/10 flex flex-col justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aws-orange to-amber-600 flex items-center justify-center mx-auto text-black shadow-lg shadow-aws-orange/20">
                {React.createElement(steps[activeStep].icon, { className: "w-8 h-8 stroke-[2.2]" })}
              </div>
              <div className="text-sm font-bold text-white">{steps[activeStep].title}</div>
              <div className="text-xs text-slate-400 font-mono">Year: {steps[activeStep].era}</div>
              <div className="pt-2 flex justify-center gap-2">
                {activeStep > 0 && (
                  <button
                    onClick={() => setActiveStep(activeStep - 1)}
                    className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-mono border border-white/10"
                  >
                    ← Previous Phase
                  </button>
                )}
                {activeStep < steps.length - 1 && (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="px-3 py-1.5 rounded-lg bg-aws-orange hover:bg-aws-orange-light text-black text-xs font-mono font-bold"
                  >
                    Next Phase →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Computing Service Delivery Models */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white">
              Cloud Service & Architecture Paradigms
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Essential models every student cloud engineer masters at SXC AWS Club
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cloudModels.map((model) => {
              const Icon = model.icon;
              return (
                <div
                  key={model.title}
                  className={`p-6 rounded-2xl bg-navy-900/60 border ${model.color} backdrop-blur-md hover:bg-navy-900 transition-all hover:scale-102 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-950 flex items-center justify-center border border-white/10">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {model.title}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{model.name}</h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{model.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
