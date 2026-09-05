"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";
import { MobileMenu } from "@/components/navbar/MobileMenu";
import { scrollToSection, scrollToHashOnLoad } from "@/lib/scrollToSection";
import { mainNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [mobileOpen, setMobileOpen] = useState(false);

  const onHome = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /**
   * Resolves a nav item to a real href. On the home page an anchor is enough;
   * anywhere else it has to be "/#section", or the browser looks for the anchor
   * on the current page and does nothing.
   *
   * Embedded, section anchors are swapped for the full page each one
   * summarises. An anchor only arrives anywhere by scrolling the window it
   * lives in, and inside someone else's frame that is not reliably the window
   * the reader is looking at: the host decides the frame's height, whether it
   * scrolls internally, and whether an internal navigation survives at all —
   * and none of it can be read or driven across origins. A real route needs
   * none of that, because the frame simply loads a different page.
   */
  const hrefFor = (item: { href: string; section?: string; owns?: string[] }) => {
    if (!item.section) return item.href;
    if (isEmbedded && item.owns?.[0]) return item.owns[0];
    return onHome ? `#${item.section}` : `/#${item.section}`;
  };

  /**
   * Section links scroll rather than jump.
   *
   * Only when the section is on this page — off-home the href is "/#section"
   * and the click has to fall through to a real navigation, which the landing
   * effect below then finishes.
   */
  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: { section?: string }
  ) => {
    // Embedded, these are ordinary page links, so the click must fall through.
    if (!item.section || !onHome || isEmbedded) return;
    // Leave modified clicks alone: ctrl/cmd/middle-click means "open elsewhere".
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!scrollToSection(item.section)) return;

    e.preventDefault();
    // Keep the address bar honest without letting the browser jump there.
    window.history.replaceState(null, "", `#${item.section}`);
  };

  const isItemActive = (item: { href: string; section?: string; owns?: string[] }) => {
    if (item.owns?.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      return true;
    }
    if (item.section) return onHome && activeSection === item.section;
    return pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Keep Dark theme as default
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");

    // A fixed navbar pins itself to the top of the *iframe*, not the browser
    // window. Embedded in something like Google Sites the frame is tall enough
    // to hold the whole page, so the parent page does the scrolling and a fixed
    // header slides out of reach and never comes back. In a frame it becomes a
    // normal in-flow header instead, which stays reachable at the top of the
    // content. Wrapped because reading window.top across origins can throw.
    try {
      if (window.self !== window.top) {
        setIsEmbedded(true);
        // Lets CSS collapse the top padding that only exists to clear a fixed
        // navbar; in-flow, that padding is just a gap.
        document.documentElement.classList.add("embedded");
      }
    } catch {
      // Cross-origin access to window.top throws, which itself means framed.
      setIsEmbedded(true);
      document.documentElement.classList.add("embedded");
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    // One frame's grace so the sections have laid out before anything measures.
    const id = window.setTimeout(() => scrollToHashOnLoad(), 60);
    return () => window.clearTimeout(id);
  }, [onHome]);

  // Highlights the nav item for whichever section you are looking at.
  //
  // The rule is "the last section whose top has crossed the line a third of the
  // way down the viewport". Picking the *most visible* section instead reads
  // plausible but gets it wrong: intersection ratio is visible-height over
  // total-height, so a short section always beats a tall one it is nowhere
  // near, and the highlight lands a section behind where you are looking.
  //
  // Only sections that have a nav item are considered, so scrolling into the
  // final call-to-action leaves Team lit rather than clearing the highlight.
  useEffect(() => {
    if (!onHome) return;

    const sections = mainNavItems
      .filter((i) => i.section)
      .map((i) => document.getElementById(i.section as string))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.34;
      let current = sections[0].id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActiveSection(current);
    };

    // rAF-throttled: at most one measurement per frame, and six
    // getBoundingClientRect calls is nothing next to a state update per event.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onHome]);

  return (
    <>
      <header
        className={`${isEmbedded ? "relative" : "fixed"} top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
          ? "bg-navy-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40 py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
          {/* Logo: the programme icon and the wordmark, nothing else.
              The mark is the official Student Builder Group icon from the brand
              kit rather than the generic AWS smile from react-icons — this is a
              Builder Group, and the programme has its own. */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <span className="w-9 h-9 rounded-xl bg-aws-orange flex items-center justify-center p-[7px] transition-transform group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/program-icon-dark.svg"
                alt=""
                className="w-full h-full"
              />
            </span>
            <span className="font-display font-bold text-lg text-white tracking-tight leading-none transition-colors group-hover:text-aws-orange">
              SXC AWS <span className="text-aws-orange">Group</span>
            </span>
          </Link>

          {/* Desktop navigation.
              The pill container is gone: bare links with an underline for the
              current section read as cleaner, and the letter swap needs room to
              move that a tight pill did not give it. */}
          <nav className="hidden lg:flex items-center gap-7">
            {mainNavItems.map((item) => {
              const isActive = isItemActive(item);
              return (
                <Link
                  key={item.title}
                  href={hrefFor(item)}
                  onClick={(e) => handleSectionClick(e, item)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <RandomLetterSwap label={item.title} staggerDuration={0.025} />
                  {/* Underline: solid on the current item, drawn in on hover. */}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-0 h-px bg-aws-orange transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Join Club CTA */}
            <a
              href={siteConfig.links.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black text-xs font-bold transition-all hover:scale-105 active:scale-95"
            >
              <span>Join Group</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>

            <MobileMenu
              open={mobileOpen}
              onOpenChange={setMobileOpen}
              items={[
                ...mainNavItems.map((item) => ({ title: item.title, href: hrefFor(item) })),
                { title: "Join Group", href: siteConfig.links.meetup, external: true },
              ]}
              isActive={(item) =>
                mainNavItems.some((nav) => nav.title === item.title && isItemActive(nav))
              }
              onItemClick={(e, item) => {
                const nav = mainNavItems.find((n) => n.title === item.title);
                if (nav) handleSectionClick(e, nav);
              }}
            />
          </div>
        </div>

      </header>

    </>
  );
}
