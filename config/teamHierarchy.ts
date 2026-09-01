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
      id: "dept-events-dir",
      slug: "events",
      name: "Department of Events",
      shortName: "Event Direction",
      code: "EVT-DIR",
      color: "from-amber-500/20 to-aws-orange/10",
      badgeColor: "text-amber-400 bg-amber-950/60 border-amber-500/30",
      description: "Directs high-level event planning, institutional approvals, speaker invitations, and strategic milestones.",
      responsibilities: [
        "Annual event calendar design & institutional scheduling",
        "Keynote speaker curation & guest dignitary relations",
        "Hackathon problem statement & timeline alignment",
        "Inter-collegiate event oversight & venue management",
      ],
      currentInitiatives: [
        "AWS Cloud Day 2026 Summit planning",
        "CloudHacks National 36-hour Hackathon schedule",
      ],
      vcps: [
        {
          name: "Raphael Wol",
          role: "Lead",
          coordinators: ["Praneet Singh", "Harsh Arkal"],
        },
      ],
    },
    {
      id: "dept-events-coord",
      slug: "event-coordination",
      name: "Event Coordination",
      shortName: "Operations & Logistics",
      code: "EVT-OPS",
      color: "from-blue-500/20 to-cyan-500/10",
      badgeColor: "text-blue-400 bg-blue-950/60 border-blue-500/30",
      description: "Manages live operational execution, crowd flow, AV infrastructure, lab setup, and participant registrations.",
      responsibilities: [
        "Real-time attendee check-in and seating allocation",
        "Audio-visual, networking, and projection lab setup",
        "Volunteer task delegation and schedule adherence",
        "Post-event feedback collection and certificate dispatch",
      ],
      currentInitiatives: [
        "Automated QR code check-in scanner app",
        "Live technical lab networking stations",
      ],
      vcps: [
        {
          name: "Anubhav Barik",
          role: "Lead",
          coordinators: ["Nyneishia Naik", "Deveshi Saha", "Bhumika Hasalkar"],
        },
      ],
    },
    {
      id: "dept-marketing",
      slug: "marketing",
      name: "Marketing Department",
      shortName: "Marketing & Media",
      code: "MKT-PR",
      color: "from-purple-500/20 to-pink-500/10",
      badgeColor: "text-purple-400 bg-purple-950/60 border-purple-500/30",
      description: "Drives visual branding, social campaigns, community outreach, publicity collateral, and external collaborations.",
      responsibilities: [
        "Multi-channel publicity across Discord, Instagram, and LinkedIn",
        "Digital flyer, motion graphic, and teaser production",
        "Campus ambassador network & student outreach",
        "Sponsorship deck distribution and brand consistency",
      ],
      currentInitiatives: [
        "SXC AWS Cloud Pulse newsletter release",
        "Cross-campus tech community outreach campaign",
      ],
      vcps: [
        {
          name: "Vimal Kansotia",
          role: "Lead",
        },
        {
          name: "Nicole Dsouza",
          role: "Lead",
        },
      ],
      coordinators: ["Athen Chettiar", "Naomi John", "Ananya Shah"],
    },
    {
      id: "dept-technical",
      slug: "technical",
      name: "Technical Department",
      shortName: "Cloud & Dev",
      code: "TECH-SYS",
      color: "from-emerald-500/20 to-teal-500/10",
      badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
      description: "Architects club cloud platforms, leads serverless and container labs, and manages technical infrastructure.",
      responsibilities: [
        "Core website, API backend, and database architecture",
        "Hands-on AWS workshop code repository curation",
        "Cloud sandbox management and security boundaries",
        "Student Projects Review",
      ],
      currentInitiatives: [
        "SXC Cloud Sandbox multi-tenant portal development",
        "Serverless Microservices and Bedrock AI curriculum",
      ],
      vcps: [
        {
          name: "Michael Fernandes",
          role: "Lead",
          coordinators: ["Ricco Marcelino", "Eshaan Sinha"],
        },
      ],
    },
  ],
};
