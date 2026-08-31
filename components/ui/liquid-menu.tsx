"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scrollToSection";

export interface LiquidMenuItem {
  title: string;
  href: string;
  external?: boolean;
}

interface LiquidMenuProps {
  items: LiquidMenuItem[];
  isActive?: (item: LiquidMenuItem) => boolean;
  className?: string;
}

/**
 * A floating panel that morphs open from its own footer bar.
 *
 * The whole card is one element with `layout`, so opening is a single
 * continuous shape change — the box grows, the corner radius eases, and the
 * "Menu" bar rides down to the new bottom edge — rather than a panel appearing
 * next to a button. Framer measures before and after and interpolates the
 * difference, which is what makes it read as one thing stretching instead of
 * two things swapping.
 *
 * Anchored top-right and mobile-only; it replaces the header hamburger, which
 * put the only navigation on a phone in the hardest corner to reach.
 */
export function LiquidMenu({ items, isActive, className }: LiquidMenuProps) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);

    // Restore whatever was there rather than clearing, so this cannot stomp on
    // a scroll lock something else owns.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const spring = reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.7 };

  return (
    <div className={cn("lg:hidden", className)}>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      <motion.div
        ref={panelRef}
        layout
        transition={spring}
        style={{ borderRadius: 26 }}
        className={cn(
          "fixed top-4 right-4 z-50 overflow-hidden",
          "bg-[#161618]/95 backdrop-blur-xl border border-white/[0.09]",
          "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]"
        )}
      >
        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              key="links"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.1 : 0.22 }}
              className="flex flex-col items-center gap-1 px-8 pt-7 pb-4 min-w-[220px]"
            >
              {items.map((item, i) => {
                const active = isActive?.(item) ?? false;
                return (
                  <motion.div
                    key={item.href + item.title}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{
                      duration: reduced ? 0.1 : 0.28,
                      delay: reduced ? 0 : 0.06 + i * 0.035,
                    }}
                  >
                    <Link
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      onClick={(e) => {
                        setOpen(false);
                        // Same eased scroll the desktop nav uses, so the two
                        // navigations do not behave differently.
                        const hash = item.href.startsWith("#")
                          ? item.href.slice(1)
                          : item.href.startsWith("/#")
                            ? item.href.slice(2)
                            : null;
                        if (!hash || e.metaKey || e.ctrlKey || e.shiftKey) return;
                        // Wait for the panel to collapse first, or the scroll
                        // starts while the page is still locked.
                        window.setTimeout(() => {
                          if (scrollToSection(hash)) {
                            window.history.replaceState(null, "", `#${hash}`);
                          }
                        }, 180);
                        e.preventDefault();
                      }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block py-1.5 text-center text-xl font-display font-semibold uppercase tracking-wide transition-colors",
                        "focus-visible:outline-none focus-visible:underline underline-offset-4",
                        active ? "text-aws-orange" : "text-zinc-200 hover:text-white"
                      )}
                    >
                      {item.title}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* The bar. Present in both states — it is what the card grows out of,
            and keeping the same element on both sides of the change is what
            lets the layout animation treat this as one shape. */}
        <motion.button
          ref={triggerRef}
          layout
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "flex items-center justify-between gap-6 w-full",
            "px-5 py-3.5 text-sm font-medium text-zinc-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/70 focus-visible:ring-inset",
            open && "border-t border-white/[0.08]"
          )}
        >
          <motion.span layout="position">Menu</motion.span>
          <motion.span layout="position" className="relative w-4 h-4 shrink-0">
            <Menu
              className={cn(
                "absolute inset-0 w-4 h-4 transition-all duration-200",
                open ? "opacity-0 scale-75" : "opacity-100 scale-100"
              )}
            />
            <X
              className={cn(
                "absolute inset-0 w-4 h-4 transition-all duration-200",
                open ? "opacity-100 scale-100" : "opacity-0 scale-75"
              )}
            />
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}
