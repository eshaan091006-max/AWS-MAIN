export const siteConfig = {
  name: "SXC AWS Club",
  shortName: "SXC AWS",
  description: "Empowering students to build the future with cloud computing, AWS architecture, and modern distributed systems.",
  tagline: "BUILD. DEPLOY. SCALE.",
  // Server-only: no NEXT_PUBLIC_ prefix. Only layout.tsx, robots.ts and
  // sitemap.ts read this, all of which run on the server, so there is no
  // reason to compile it into the browser bundle.
  //
  // NEXT_PUBLIC_SITE_URL is still accepted so an existing deployment keeps
  // working until the variable is renamed.
  //
  // Trailing slashes are stripped: this value is concatenated directly in
  // sitemap.ts and robots.ts, so "https://site.com/" would emit
  // "https://site.com//sitemap.xml".
  url: (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://sxcawsclub.vercel.app"
  ).replace(/\/+$/, ""),
  ogImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  creator: "SXC AWS Student Community",
  links: {
    github: "https://github.com/sxc-aws-club",
    linkedin: "https://linkedin.com/company/sxc-aws-club",
    instagram: "https://instagram.com/sxc_aws_club",
    discord: "https://discord.gg/sxc-aws",
    email: "contact@sxcaws.club",
    awsEducate: "https://aws.amazon.com/education/awseducate/",
    meetup:
      "https://www.meetup.com/aws-sbg-at-saint-xaviers-college-mumbai/?utm_medium=referral",
    // bit.ly/44VWyNV — kept expanded so the destination is visible in review
    // and survives the shortener being retired.
    awsBuilder:
      "https://builder.aws.com/start?trk=5a6e9ca6-bc8b-49c0-ab29-d73e01649878&sc_channel=el",
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
