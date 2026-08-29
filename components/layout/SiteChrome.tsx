"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Hides the public site chrome — navbar, footer, background canvases — on the
 * admin console.
 *
 * The console is an operator surface with its own navigation rail. Marketing
 * navigation above it would compete for the same clicks, and the animated
 * background canvases run a render loop behind a screen nobody is looking at
 * for atmosphere.
 *
 * A client component because only the client knows the current path; the root
 * layout is a server component and cannot branch on it.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
