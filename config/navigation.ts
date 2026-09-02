export interface NavItem {
  title: string;
  href: string;
  /** Set when this item scrolls to a section of the home page. */
  section?: string;
  /**
   * Routes this item still represents. A section summarising the events page
   * should stay lit while you are on that page — otherwise following the
   * section's own "explore all" link clears the navigation entirely and you
   * lose your place.
   */
  owns?: string[];
  description?: string;
  badge?: string;
}

/**
 * The home page is one long scroll, so most nav items are anchors into it
 * rather than separate page loads. `section` is the id they scroll to; from
 * any other page the navbar turns them back into "/#section" so they still
 * work off-home.
 *
 * Contact and Gallery stay real pages: one is a form and the other a
 * full-screen scene, neither summarises to a section, and deep links to both
 * are already in circulation.
 */
export const mainNavItems: NavItem[] = [
  { title: "Home", href: "/", section: "top" },
  { title: "About", href: "/", section: "about", owns: ["/about"] },
  { title: "What You'll Build", href: "/", section: "build", owns: ["/projects"] },
  { title: "Events", href: "/", section: "events", owns: ["/events"] },
  { title: "Team", href: "/", section: "team", owns: ["/teams"] },
  { title: "Gallery", href: "/gallery" },
  { title: "Contact", href: "/contact" },
];

export const footerNavItems = {
  explore: [
    { title: "Home", href: "/" },
    { title: "About Us", href: "/about" },
    { title: "Events & Workshops", href: "/events" },
    { title: "Showcase Projects", href: "/projects" },
    { title: "Photo Gallery", href: "/gallery" },
  ],
  learn: [
    // Points at the recap rather than the event page: the session has already
    // happened, so what a visitor wants from the footer is what was covered.
    { title: "The Builder's Launchpad", href: "/events/the-builders-launchpad/recap" },
  ],
  community: [
    { title: "Meet the Teams", href: "/teams" },
    { title: "Join SXC AWS Group", href: "/contact" },
  ],
};
