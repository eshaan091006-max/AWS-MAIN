export interface NavItem {
  title: string;
  href: string;
  description?: string;
  badge?: string;
}

export const mainNavItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Teams", href: "/teams" },
  { title: "Events", href: "/events" },
  { title: "Gallery", href: "/gallery" },
  { title: "Projects", href: "/projects" },
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
    { title: "Cloud Fundamentals", href: "/#cloud-evolution" },
    { title: "AWS Foundations Workshop", href: "/events/aws-foundations" },
    { title: "Student Community Projects", href: "/projects" },
  ],
  community: [
    { title: "Meet the Teams", href: "/teams" },
    { title: "Executive Board", href: "/teams#executive-board" },
    { title: "Join SXC AWS Club", href: "/contact" },
  ],
};
