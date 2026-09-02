"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";

export interface MobileMenuItem {
  title: string;
  href: string;
  external?: boolean;
}

interface Props {
  items: MobileMenuItem[];
  isActive: (item: MobileMenuItem) => boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Section links still scroll rather than jump; the panel closes first. */
  onItemClick?: (e: React.MouseEvent<HTMLAnchorElement>, item: MobileMenuItem) => void;
}

/**
 * Navigation below the `lg` breakpoint, where the desktop row is hidden.
 *
 * A conventional header trigger and dropdown panel: no morph, no floating
 * button. Escape and a tap outside both close it, and the trigger keeps its
 * focus ring, so it works from a keyboard on a small window as well as a phone.
 */
export function MobileMenu({ items, isActive, open, onOpenChange, onItemClick }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Escape closes, and focus goes back to the trigger rather than to the top of
  // the document — otherwise the next Tab restarts from the page beginning.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onOpenChange]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="mobile-nav"
          className="absolute left-4 right-4 top-full mt-2 rounded-xl border border-white/10 bg-navy-950/95 backdrop-blur-xl p-2 shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200"
        >
          <nav className="flex flex-col">
            {items.map((item) =>
              item.external ? (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-aws-orange hover:bg-white/[0.06] transition-colors"
                >
                  <span>{item.title}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </a>
              ) : (
                <Link
                  key={item.title}
                  href={item.href}
                  aria-current={isActive(item) ? "page" : undefined}
                  onClick={(e) => {
                    onOpenChange(false);
                    onItemClick?.(e, item);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item)
                      ? "text-white bg-white/[0.07]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {item.title}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
