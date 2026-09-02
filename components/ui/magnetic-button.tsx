"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * Lifted out of motion-footer, where it was defined but never exported — so
 * the only two magnetic controls on the site were the footer's own pills. It
 * is not footer-specific in any way; it just happened to live there.
 */

export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

/**
 * A control that leans toward the cursor.
 *
 * The pull is skipped on coarse pointers and under reduced motion. On touch
 * there is no hover to drive it, and the transform would only ever be applied
 * on tap — the element would jump sideways under the finger that pressed it.
 */
export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        // The original swaps these: it halves the width into `h` and the height
        // into `w`, then subtracts `h` from x and `w` from y. On a wide pill
        // that offsets the origin by tens of pixels, so the button lurches as
        // the pointer enters instead of easing toward it.
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const x = e.clientX - rect.left - halfW;
        const y = e.clientY - rect.top - halfH;

        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          rotationX: -y * 0.15,
          rotationY: x * 0.15,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
        gsap.killTweensOf(element);
      };
    }, []);

    const setRefs = (node: HTMLElement | null) => {
      (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    // createElement rather than <Tag ...>.
    //
    // The props type intersects button and anchor attributes, which leaves every
    // key they share — children included — as `never`. Writing it as JSX makes
    // TypeScript pick one arbitrary member of the ElementType union to check
    // against (it lands on SVGSymbolElement) and every prop then fails. Going
    // through createElement keeps the public prop types intact and confines the
    // looseness to this one call.
    return React.createElement(
      Component,
      {
        ...props,
        ref: setRefs,
        className: cn("cursor-pointer", className),
      } as Record<string, unknown>,
      children
    );
  }
);
MagneticButton.displayName = "MagneticButton";
