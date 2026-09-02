"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SEEN_KEY = "sxc-intro-seen";

/**
 * A short curtain over the first page of a visit: the programme mark draws in,
 * then the panel lifts away.
 *
 * Rules it follows, because an intro that ignores them is a toll booth:
 *
 * - Once per session. sessionStorage, so it does not replay on every internal
 *   navigation, and it does return for a genuinely new visit.
 * - Skippable. Any key, click or scroll dismisses it immediately.
 * - Never shown under reduced motion.
 * - Never blocks the page. It renders above the content, which is already
 *   there and already interactive underneath — if the JS fails, nothing is
 *   covering anything.
 *
 * It starts hidden and only shows after the mount check, so the server never
 * renders a curtain that a returning visitor would see flash before it is
 * dismissed.
 */
export function IntroCurtain() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Private mode and blocked storage both throw. Treat it as seen: a
      // curtain on every page load is far worse than none.
    }
    if (seen) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    setShow(true);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}

    const done = () => setShow(false);
    const timer = window.setTimeout(done, 1900);
    window.addEventListener("keydown", done);
    window.addEventListener("wheel", done, { passive: true });
    window.addEventListener("pointerdown", done);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", done);
      window.removeEventListener("wheel", done);
      window.removeEventListener("pointerdown", done);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <motion.img
            src="/brand/program-icon-orange.svg"
            alt=""
            className="w-20 h-20"
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
