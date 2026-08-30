"use client";

import React, { useRef, useState } from "react";
import { Send, CheckCircle, ChevronDown, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { siteConfig } from "@/config/site";
import { ContactHero } from "@/components/ui/contact-hero";
import { LiquidButton } from "@/components/ui/liquid-button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const formRef = useRef<HTMLDivElement>(null);

  // The hero pill collects an address and hands it here, rather than being a
  // second form that posts somewhere of its own. One submit path, one place the
  // message can actually go.
  const startFromHero = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Focus the first thing still empty, so the pill genuinely saves a step.
    window.setTimeout(() => {
      formRef.current?.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    }, 500);
  };

  const faqs = [
    {
      q: "Who can join the SXC AWS Club?",
      a: "Any student enrolled at St. Xavier's College (any department, year, or background) with an interest in software engineering, cloud computing, or modern technology is welcome to join.",
    },
    {
      q: "Do I need prior AWS experience or certifications to join?",
      a: "Not at all! We provide complete foundational tracks starting from scratch with basic Linux and JavaScript/Python up to advanced serverless and containerized microservices.",
    },
    {
      q: "How much does membership cost?",
      a: "SXC AWS Club is 100% free for all students. We also assist with free AWS Educate credits, free workshop access, and exam voucher support.",
    },
    {
      q: "How can industry mentors or sponsors collaborate?",
      a: "We actively collaborate with cloud architects, AWS Heroes, and corporate tech recruiters for guest lectures, workshop sponsorships, and hackathon judging. Simply select 'Sponsorship / Partnership' in the contact form.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch message. Please try again.");
      }

      setSubmitted(true);
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#FF9900", "#0073BB", "#FFFFFF"],
        });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pb-20 overflow-hidden">
      {/* The channel grid lives in the hero now; the form below is still the
          way to send an actual message, and still writes to Supabase. */}
      <ContactHero onStart={startFromHero} />

      {/* Main Grid: Form + Info */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-3xl mx-auto">
          <div ref={formRef} className="scroll-mt-28">
            {/* No heading and no card. The hero already said "reach the club";
                announcing "Send Us a Message" over a form that is visibly a
                message form was saying it a third time, and the orange-bordered
                panel is what made the page look like two pages stapled
                together. */}
            <div className="space-y-6">

              {submitted ? (
                <div className="p-8 rounded-2xl bg-navy-950 border border-emerald-500/40 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Dispatched Successfully!</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out, <strong className="text-aws-orange">{formData.name}</strong>! Our core leadership team has received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Your Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Maya Patel"
                        className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. maya@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Subject / Topic *</label>
                    <input
                      required
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Student Membership Inquiry / Hackathon Sponsorship"
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Message / Idea *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your background, project proposal, or questions..."
                      className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs resize-none"
                    />
                  </div>

                  <LiquidButton
                    type="submit"
                    disabled={loading}
                    size="md"
                    className="w-full disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {/* "Sending to AWS Serverless API" described the
                            plumbing, not what is happening to the message. */}
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[2.2]" />
                        <span>Send message</span>
                      </>
                    )}
                  </LiquidButton>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* FAQ. Two columns, hairline rules, no card chrome — the question list
          is the content, and boxing each row was fighting it. */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight">
              FAQs
            </h2>
            <p className="text-base text-zinc-400 mt-3">Your questions answered</p>
            <p className="text-sm text-zinc-500 mt-6 leading-relaxed">
              Can&apos;t find what you&apos;re looking for?{" "}
              <button
                type="button"
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="text-zinc-300 underline underline-offset-4 hover:text-aws-orange transition-colors"
              >
                Send us a message
              </button>{" "}
              and we&apos;ll get back to you.
            </p>
          </div>

          <div className="lg:col-span-8">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-white/10">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full py-5 text-left flex items-center justify-between gap-4 group"
                  >
                    <span className="text-base text-white group-hover:text-aws-orange transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {/* Grid-rows trick: animates open and closed without needing a
                      fixed height, which an answer of unknown length cannot have. */}
                  <div
                    className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pr-8 text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
