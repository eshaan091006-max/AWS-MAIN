import React from "react";
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Console — SXC AWS",
  // The admin area is disallowed in robots.txt, but a page can still be
  // linked or shared; this is the belt to that braces.
  robots: { index: false, follow: false },
};

/**
 * The console runs on its own visual system.
 *
 * `.adm` scopes every token and the zero-radius rule, so nothing here reaches
 * the public site, and the public site's rounded, navy world does not leak in.
 * The site chrome — navbar and footer — is deliberately absent: an operator
 * surface should not carry marketing navigation.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      {/* Rendered once for the whole console, behind everything, inert. */}
      <div className="adm-depth" aria-hidden="true" />
      <div className="adm-horizon" aria-hidden="true" />
      {children}
    </div>
  );
}
