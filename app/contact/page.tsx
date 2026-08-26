"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, MapPin, Send, CheckCircle, Sparkles, Github, Linkedin, Instagram, HelpCircle, ChevronDown, Loader2, CalendarDays, Cloud, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import { siteConfig } from "@/config/site";

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
    <div className="relative pt-28 pb-20 overflow-hidden">
      {/* Header */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30">
            <Mail className="w-3.5 h-3.5" />
            <span>GET IN TOUCH</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Join the Community & <span className="text-gradient-orange">Let&apos;s Build Together</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Have a project idea? Want to collaborate on a workshop? Or looking to break into AWS cloud engineering? Reach out to the SXC AWS team.
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Info */}
      <section className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-navy-900/80 border border-aws-orange/30 backdrop-blur-2xl shadow-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  We typically respond within 24 hours to all student and partner inquiries.
                </p>
              </div>

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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-xs shadow-xl shadow-aws-orange/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending to AWS Serverless API...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[2.2]" />
                        <span>Dispatch Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Community Prompts & Socials */}
          <div className="lg:col-span-5 space-y-6">
            {/* Why Reach Out Card */}
            <div className="p-8 rounded-3xl bg-navy-900/70 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Join the Conversation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect directly with our leadership team, get invited to our private Discord servers, and access exclusive AWS certification study materials.
              </p>

              {/* Primary join actions. Both leave the site, so both are
                  rel="noopener noreferrer" — without noopener the opened tab
                  can reach back through window.opener. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={siteConfig.links.meetup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3.5 rounded-2xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black flex items-center gap-3 transition-all shadow-lg shadow-aws-orange/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase opacity-70">Meetup Group</div>
                    <div className="text-xs font-bold truncate">Join our Meetup</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0 opacity-70 group-hover:opacity-100" />
                </a>

                <a
                  href={siteConfig.links.awsBuilder}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3.5 rounded-2xl bg-navy-950/80 hover:bg-navy-800 border border-aws-orange/30 hover:border-aws-orange/60 text-white flex items-center gap-3 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-aws-orange/20 text-aws-orange flex items-center justify-center shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase text-slate-400">AWS Builder</div>
                    <div className="text-xs font-bold truncate">Create your Builder ID</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0 text-slate-500 group-hover:text-aws-orange" />
                </a>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-navy-950/80 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aws-orange/20 text-aws-orange flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Direct Email</div>
                    <div className="text-xs font-semibold text-white truncate">{siteConfig.links.email}</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-navy-950/80 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Campus Location</div>
                    <div className="text-xs font-semibold text-white">St. Xavier&apos;s College,Fort, Mumbai</div>
                  </div>
                </div>
              </div>

              {/* Social Channels */}

            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-navy-900/70 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-aws-orange transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-aws-orange transition-transform duration-200 shrink-0 ml-2 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5 bg-navy-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
