"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, Search, Menu, X, ArrowUpRight, Sparkles, Shield } from "lucide-react";
import { mainNavItems } from "@/config/navigation";
import { SearchModal } from "@/components/navbar/SearchModal";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Keep Dark theme as default
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#060A14]/85 backdrop-blur-xl border-b border-aws-orange/20 shadow-lg shadow-black/40 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aws-orange to-amber-600 flex items-center justify-center shadow-lg shadow-aws-orange/25 group-hover:scale-105 transition-transform">
              <Cloud className="w-6 h-6 text-black stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-display font-extrabold text-lg text-white tracking-tight leading-none group-hover:text-aws-orange transition-colors">
                SXC AWS <span className="text-aws-orange">CLUB</span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                Cloud Community
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-navy-900/80 border border-white/10 p-1.5 rounded-full backdrop-blur-md">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "text-black font-semibold bg-gradient-to-r from-aws-orange to-amber-500 shadow-md shadow-aws-orange/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.title}
                  {item.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-navy-950 text-aws-orange border border-aws-orange/40">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl bg-navy-900/80 hover:bg-navy-800 border border-white/10 text-slate-300 hover:text-aws-orange transition-all flex items-center gap-2 text-xs cursor-pointer"
              title="Search (Cmd+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </span>
            </button>

            {/* Join Club CTA */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black text-xs font-bold shadow-lg shadow-aws-orange/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Join Club</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-navy-900/80 border border-white/10 text-slate-200 hover:text-aws-orange cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-aws-orange/20 bg-navy-950/95 backdrop-blur-2xl px-4 pt-4 pb-6 mt-3 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                      isActive
                        ? "bg-aws-orange text-black border-aws-orange font-bold"
                        : "bg-navy-900/80 text-slate-200 border-white/10 hover:border-aws-orange/40"
                    }`}
                  >
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1 rounded bg-black/20">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 text-black text-center text-xs font-bold shadow-md shadow-aws-orange/20"
              >
                Join SXC AWS Club
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
