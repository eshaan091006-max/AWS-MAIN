export const siteConfig = {
  name: "SXC AWS Club",
  shortName: "SXC AWS",
  description: "Empowering students to build the future with cloud computing, AWS architecture, and modern distributed systems.",
  tagline: "BUILD. DEPLOY. SCALE.",
  // Trailing slashes are stripped: this value is concatenated directly in
  // sitemap.ts and robots.ts, so "https://site.com/" would emit
  // "https://site.com//sitemap.xml".
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://sxcawsclub.vercel.app").replace(/\/+$/, ""),
  ogImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  creator: "SXC AWS Student Community",
  links: {
    github: "https://github.com/sxc-aws-club",
    linkedin: "https://linkedin.com/company/sxc-aws-club",
    instagram: "https://instagram.com/sxc_aws_club",
    discord: "https://discord.gg/sxc-aws",
    email: "contact@sxcaws.club",
    awsEducate: "https://aws.amazon.com/education/awseducate/",
  },
  stats: {
    members: "500+",
    projects: "25+",
    events: "40+",
    workshops: "15+",
    certifications: "85+",
    hoursLearned: "10,000+",
  },
  college: "St. Xavier's College",
  foundedYear: 2023,
};
