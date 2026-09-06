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
      shortName: "Workshops, meetups & competitions",
      code: "EVT",
      color: "from-amber-500/20 to-aws-orange/10",
      badgeColor: "text-amber-400 bg-amber-950/60 border-amber-500/30",
      description:
        "Everything the group puts on, from an hour-long workshop to a weekend-long build. The same work sits behind both: fixing a date, securing a room, briefing whoever is speaking or judging, and writing a running order that survives contact with the day. Hackathons add the problem statements and the teams to keep moving, and take the department from running a session to running a competition.",
      responsibilities: [
        "Workshops and hands-on sessions",
        "Speaker talks and meetups",
        "Hackathons and competitions",
        "Problem statements and judging",
        "Venues, scheduling and running order",
      ],
      currentInitiatives: ["AWS Cloud Day 2026 Summit planning", "CloudHacks 36-hour hackathon"],
      vcps: [
        {
          name: "Raphael Wol",
          role: "Events Core Committee Member",
          coordinators: ["Praneet Singh", "Harsh Arkal"],
        },
        { name: "Karan Singh", role: "Events Core Committee Member" },
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
        "Builds everything the club publishes and decides how all of it looks. That covers the website, the photography and video shot at events, and the graphics, posters and digital content the other departments hand out and post. Most of what anyone sees of the club, online or on a wall, came through here first.",
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
          role: "Digital and Creative Core Committee Member",
          // Eshaan moved up from this department's members to co-lead it.
          coordinators: ["Ricco Marcelino"],
        },
        { name: "Eshaan Sinha", role: "Digital and Creative Core Committee Member" },
      ],
    },
    {
      id: "dept-marketing",
      slug: "marketing",
      name: "Department of Marketing, Sponsorships and Finance",
      shortName: "Promotion & audience",
      code: "MKT",
      color: "from-violet-500/20 to-fuchsia-500/10",
      badgeColor: "text-violet-400 bg-violet-950/60 border-violet-500/30",
      description:
        "Gets people to turn up, and keeps them following along afterwards. The team plans the promotion around each event, runs the social channels, and manages registrations from the first announcement to the final headcount. The longer job is growing the audience the club can reach, not just talking to the one it already has.",
      responsibilities: [
        "Promotions",
        "Social media campaigns",
        "Registrations",
        "Outreach",
        "Audience growth",
      ],
      currentInitiatives: ["Cloud Day campaign", "Member spotlight series"],
      vcps: [
        { name: "Vimal Kansotia", role: "Marketing Core Committee Member" },
        { name: "Nicole Dsouza", role: "Marketing Core Committee Member" },
      ],
      // Department-level rather than under one lead: Marketing has two, and
      // these members work to both.
      coordinators: ["Athen Chettiar", "Ananya Shah", "Naomi John"],
    },
    {
      id: "dept-pr",
      slug: "admin",
      name: "Department of Admin",
      shortName: "Registration, permissions & coordination",
      code: "ADM",
      color: "from-blue-500/20 to-cyan-500/10",
      badgeColor: "text-blue-400 bg-blue-950/60 border-blue-500/30",
      description:
        "The permissions and paperwork that let everything else happen. Registrations are collected and checked here, approvals for rooms and events are taken through the college's own processes, and the group's dealings with departments and faculty run through this desk. It is invisible when it works, and the reason a session cannot go ahead when it does not.",
      responsibilities: [
        "Registration",
        "Permissions",
        "Institutional coordination",
        "Administration",
      ],
      currentInitiatives: ["Venue and permission approvals", "Registration records"],
      vcps: [
        {
          name: "Anubhav Barik",
          role: "Admin Core Committee Member",
          coordinators: ["Nyneishia Naik", "Deveshi Saha", "Bhumika Hasalkar"],
        },
      ],
    },
  ],
};
