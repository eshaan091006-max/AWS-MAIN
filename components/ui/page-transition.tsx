"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Eases each route in, so navigation is not a hard cut.
 *
 * Deliberately an enter-only animation with no AnimatePresence. In the App
 * Router the outgoing page unmounts as soon as the new one is ready, so an exit
 * variant either never plays or has to be bought with a wrapper that holds the
 * old tree alive and delays every navigation. A quick fade-and-rise on arrival
 * gets the continuity without making the site feel slower than it is.
 *
 * `key` on the pathname is what makes it replay: same element, new key, so
 * React remounts it and the initial state runs again.
 *
 * The travel is small and the duration short on purpose. This fires on every
 * navigation, and anything longer becomes something to sit through.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
