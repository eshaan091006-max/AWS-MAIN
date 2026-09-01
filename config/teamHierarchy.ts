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
      shortName: "Event Direction",
      code: "EVT",
      color: "from-amber-500/20 to-aws-orange/10",
      badgeColor: "text-amber-400 bg-amber-950/60 border-amber-500/30",
      description:
        "Plans and runs the calendar — speaker sessions, workshops and institutional scheduling.",
      responsibilities: [
        "Annual event calendar design & institutional scheduling",
        "Keynote speaker curation & guest dignitary relations",
        "Inter-collegiate event oversight & venue management",
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
      id: "dept-technical",
      slug: "technical",
      name: "Technical Department",
      shortName: "Cloud & Dev",
      code: "TECH",
      color: "from-emerald-500/20 to-teal-500/10",
      badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
      description:
        "Architects the club's cloud platforms, runs serverless and container labs, and maintains technical infrastructure.",
      responsibilities: [
        "Club website & cloud infrastructure maintenance",
        "Serverless and container workshop delivery",
        "AWS account governance & cost monitoring",
      ],
      currentInitiatives: ["Serverless lab series", "Club platform on AWS"],
      vcps: [
        {
          name: "Michael Fernandes",
          role: "Technical Lead",
          coordinators: ["Ricco Marcelino", "Eshaan Sinha"],
        },
      ],
    },
    {
      id: "dept-marketing",
      slug: "marketing",
      name: "Marketing Department",
      shortName: "Marketing & Media",
      code: "MKT",
      color: "from-violet-500/20 to-fuchsia-500/10",
      badgeColor: "text-violet-400 bg-violet-950/60 border-violet-500/30",
      description:
        "Builds the club's voice — campaigns, social media, design and event promotion.",
      responsibilities: [
        "Campaign design & social media scheduling",
        "Event branding, posters and motion assets",
        "Photography and post-event recaps",
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
      name: "Public Relations",
      shortName: "Outreach & Partnerships",
      code: "PR",
      color: "from-blue-500/20 to-cyan-500/10",
      badgeColor: "text-blue-400 bg-blue-950/60 border-blue-500/30",
      description:
        "Handles outreach, partnerships and communications with students, faculty and industry.",
      responsibilities: [
        "Industry and community partnerships",
        "Participant registrations & attendee communication",
        "Inter-college and faculty liaison",
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
      name: "Hackathon",
      shortName: "Competitions",
      code: "HACK",
      color: "from-rose-500/20 to-orange-500/10",
      badgeColor: "text-rose-400 bg-rose-950/60 border-rose-500/30",
      description:
        "Designs and runs the club's hackathons — problem statements, judging, mentors and logistics.",
      responsibilities: [
        "Problem statement design & judging criteria",
        "Mentor and judge coordination",
        "Timeline, scoring and prize logistics",
      ],
      currentInitiatives: ["CloudHacks 36-hour hackathon"],
      vcps: [{ name: "Karan", role: "Hackathon Lead" }],
    },
  ],
};
