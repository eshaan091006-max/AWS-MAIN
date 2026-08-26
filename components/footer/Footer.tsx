import React from "react";
import Link from "next/link";
import { Cloud, Github, Linkedin, Instagram, Mail, MessageSquare, Terminal, Heart, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNavItems } from "@/config/navigation";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-aws-orange/20 bg-[#04070F] pt-16 pb-12 overflow-hidden">
      {/* Background cyber grid */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-aws-orange/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aws-orange to-amber-600 flex items-center justify-center shadow-lg shadow-aws-orange/20">
                <Cloud className="w-6 h-6 text-black stroke-[2.2]" />
              </div>
              <div className="font-display font-extrabold text-xl text-white tracking-tight">
                SXC AWS <span className="text-aws-orange">CLUB</span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>

            <div className="text-xs font-mono text-aws-orange-light flex items-center gap-2">
              <Terminal className="w-4 h-4 text-aws-orange" />
              <span>Learn. Build. Deploy. Scale.</span>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-900 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/50 flex items-center justify-center text-slate-300 hover:text-aws-orange transition-all"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-900 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/50 flex items-center justify-center text-slate-300 hover:text-aws-orange transition-all"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-900 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/50 flex items-center justify-center text-slate-300 hover:text-aws-orange transition-all"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteConfig.links.discord}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-900 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/50 flex items-center justify-center text-slate-300 hover:text-aws-orange transition-all"
                title="Discord"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${siteConfig.links.email}`}
                className="w-9 h-9 rounded-lg bg-navy-900 hover:bg-navy-800 border border-white/10 hover:border-aws-orange/50 flex items-center justify-center text-slate-300 hover:text-aws-orange transition-all"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerNavItems.explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-aws-orange transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Learn Cloud */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-4">
              AWS Learning
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerNavItems.learn.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-aws-orange transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Community */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-4">
              Community
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerNavItems.community.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-aws-orange transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}


      </div>
    </footer>
  );
}
