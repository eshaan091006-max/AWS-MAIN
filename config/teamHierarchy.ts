export interface Coordinator {
  name: string;
  role: string;
}

export interface VCP {
  name: string;
  role: string;
  coordinators?: string[];
}

export interface DepartmentNode {
  id: string;
  /** URL segment for this department's page. */
  slug: string;
  name: string;
  shortName: string;
  code: string;
  color: string;
  badgeColor: string;
  description: string;
  responsibilities: string[];
  currentInitiatives: string[];
  vcps: VCP[];
  coordinators?: string[];
}

export interface TeamHierarchy {
  faculty: {
    title: string;
    /** `photo` is an optional image URL; without one an initials avatar shows. */
    members: { name: string; designation: string; photo?: string }[];
  };
  chairperson: {
    name: string;
    role: string;
    title: string;
    photo?: string;
  };
  departments: DepartmentNode[];
}

export const teamHierarchy: TeamHierarchy = {
  faculty: {
    title: "FACULTY IN CHARGE",
    members: [
      { name: "Marazban Kotwal", designation: "Vice Principal" },
      { name: "Norine Dsouza", designation: "Faculty Mentor" },
      { name: "Aaron Johns", designation: "Faculty Mentor" },
    ],
  },
  chairperson: {
    name: "Manav William",
    role: "SBG Leader",
    title: "SBG LEADER",
  },
  departments: [
    {
      id: "dept-events",
      slug: "events",
      name: "Department of Events",
      shortName: "Workshops, talks & meetups",
      code: "EVT",
      color: "from-amber-500/20 to-aws-orange/10",
      badgeColor: "text-amber-400 bg-amber-950/60 border-amber-500/30",
      description:
        "Planning and executing workshops, talks, meetups, and community activities.",
      responsibilities: [
        "Workshops",
        "Talks",
        "Meetups",
        "Community activities",
      ],
      currentInitiatives: ["AWS Cloud Day 2026 Summit planning"],
      vcps: [
        {
          name: "Raphael Wol",
          role: "Events Lead",
          coordinators: ["Praneet Singh", "Harsh Arkal"],
        },
      ],
    },
    {
      id: "dept-digital-creative",
      slug: "digital-creative",
      name: "Digital & Creative Department",
      shortName: "Web, media & design",
      code: "DIG",
      color: "from-emerald-500/20 to-teal-500/10",
      badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
      description:
        "Website, photography, videography, graphic design, posters, and digital content.",
      responsibilities: [
        "Website",
        "Photography",
        "Videography",
        "Graphic design",
        "Posters",
        "Digital content",
      ],
      currentInitiatives: ["Club platform on AWS", "Event photo and film coverage"],
      vcps: [
        {
          name: "Michael Fernandes",
          role: "Digital and Creative Lead",
          // Eshaan moved up from this department's members to co-lead it.
          coordinators: ["Ricco Marcelino"],
        },
        { name: "Eshaan Sinha", role: "Digital and Creative Lead" },
      ],
    },
    {
      id: "dept-marketing",
      slug: "marketing",
      name: "Department of Marketing",
      shortName: "Promotion & audience",
      code: "MKT",
      color: "from-violet-500/20 to-fuchsia-500/10",
      badgeColor: "text-violet-400 bg-violet-950/60 border-violet-500/30",
      description:
        "Promotions, social media campaigns, registrations, outreach, and audience growth.",
      responsibilities: [
        "Promotions",
        "Social media campaigns",
        "Registrations",
        "Outreach",
        "Audience growth",
      ],
      currentInitiatives: ["Cloud Day campaign", "Member spotlight series"],
      vcps: [
        { name: "Nicole Dsouza", role: "Marketing Lead" },
        { name: "Vimal Kansotia", role: "Marketing Lead" },
      ],
    },
    {
      id: "dept-pr",
      slug: "pr",
      name: "Department of PR",
      shortName: "Communication & relations",
      code: "PR",
      color: "from-blue-500/20 to-cyan-500/10",
      badgeColor: "text-blue-400 bg-blue-950/60 border-blue-500/30",
      description:
        "External communication, guest/speaker coordination, institutional communication, and community relations.",
      responsibilities: [
        "External communication",
        "Guest & speaker coordination",
        "Institutional communication",
        "Community relations",
      ],
      currentInitiatives: ["Sponsor outreach", "Cross-college collaborations"],
      vcps: [
        {
          name: "Anubhav Barik",
          role: "PR Lead",
          coordinators: ["Nyneishia Naik", "Deveshi Saha", "Bhumika Hasalkar"],
        },
      ],
    },
    {
      id: "dept-hackathon",
      slug: "hackathon",
      name: "Department of Hackathons",
      shortName: "Competitions",
      code: "HACK",
      color: "from-rose-500/20 to-orange-500/10",
      badgeColor: "text-rose-400 bg-rose-950/60 border-rose-500/30",
      description:
        "Hackathon planning, technical challenges, team coordination, judging, and related competitions.",
      responsibilities: [
        "Hackathon planning",
        "Technical challenges",
        "Team coordination",
        "Judging",
        "Related competitions",
      ],
      currentInitiatives: ["CloudHacks 36-hour hackathon"],
      vcps: [{ name: "Karan Singh", role: "Hackathon Lead" }],
    },
  ],
};
