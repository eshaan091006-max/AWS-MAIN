export interface DepartmentData {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

export interface TeamMemberData {
  id: string;
  name: string;
  position: string;
  departmentId: string;
  departmentName: string;
  bio: string;
  photoUrl: string;
  linkedin: string;
  github: string;
  email: string;
  isExecutive: boolean;
  skills: string[];
  order: number;
}

export interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDetails: string;
  date: string;
  time: string;
  venue: string;
  category: "WORKSHOP" | "HACKATHON" | "SEMINAR" | "BOOTCAMP";
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  isFeatured: boolean;
  imageUrl: string;
  bannerUrl: string;
  speakerNames: string[];
  prerequisites: string[];
  agenda: { time: string; title: string; description: string }[];
  maxSeats: number;
  currentRegistrations: number;
  /**
   * Extra Co-curricular Credits awarded for attending. 0 means the event
   * carries none, and the badge is hidden rather than showing "0 ECC".
   */
  eccPoints: number;
}

export interface ProjectData {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  problem: string;
  solution: string;
  technologies: string[];
  awsServices: string[];
  imageUrl: string;
  githubUrl: string;
  liveDemoUrl: string;
  isFeatured: boolean;
  members: { name: string; role: string; avatarUrl: string }[];
}

export interface GalleryImageData {
  id: string;
  title: string;
  description: string;
  category: "WORKSHOPS" | "HACKATHONS" | "TEAM" | "EVENTS" | "COMMUNITY";
  imageUrl: string;
  date: string;
  featured: boolean;
}

export interface AWSModuleData {
  id: string;
  title: string;
  slug: string;
  serviceCode: string;
  category: "COMPUTE" | "STORAGE" | "DATABASE" | "NETWORKING" | "SECURITY" | "ANALYTICS" | "AIML";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  shortDesc: string;
  description: string;
  iconName: string;
  keyConcepts: string[];
  cliExamples: { command: string; description: string }[];
  architectureDiagram?: string;
  labGuide: string;
  order: number;
  resources: { title: string; url: string; type: "DOCS" | "TUTORIAL" | "VIDEO" | "LAB" }[];
}

export interface ContactMessageData {
  id: string;
  name: string;
  email: string;
  subject: string;
  category?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const INITIAL_DEPARTMENTS: DepartmentData[] = [
  {
    id: "dept-1",
    name: "Executive Board",
    slug: "executive-board",
    description: "Guiding the strategic vision, community partnerships, and overall operations of SXC AWS Club.",
    order: 1,
  },
  {
    id: "dept-2",
    name: "Technical Department",
    slug: "technical",
    description: "Developing cloud infrastructure, architecting student projects, and leading AWS hands-on labs.",
    order: 2,
  },
  {
    id: "dept-3",
    name: "Marketing & Design",
    slug: "marketing-design",
    description: "Building our visual brand, engaging cloud content, and managing social media campaigns.",
    order: 3,
  },
  {
    id: "dept-4",
    name: "Events & Operations",
    slug: "events-operations",
    description: "Organizing hackathons, technical bootcamps, speaker sessions, and community logistics.",
    order: 4,
  },
  {
    id: "dept-5",
    name: "PR & Corporate Outreach",
    slug: "pr-outreach",
    description: "Connecting students with AWS User Groups, cloud architects, and industry recruiters.",
    order: 5,
  },
];

export const INITIAL_TEAM_MEMBERS: TeamMemberData[] = [
  {
    id: "member-1",
    name: "Aarav Sharma",
    position: "President & AWS Community Lead",
    departmentId: "dept-1",
    departmentName: "Executive Board",
    bio: "AWS Certified Solutions Architect with a passion for serverless microservices and distributed computing. Leading 500+ student innovators.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/aaravsharma-aws",
    github: "https://github.com/aaravsharma-cloud",
    email: "president@sxcaws.club",
    isExecutive: true,
    skills: ["AWS Solutions Architecture", "Terraform", "Kubernetes", "Next.js"],
    order: 1,
  },
  {
    id: "member-2",
    name: "Rhea Sen",
    position: "Vice President",
    departmentId: "dept-1",
    departmentName: "Executive Board",
    bio: "DevOps specialist and cloud-native researcher. Driving student certification programs and industry hackathons.",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/rheasen-cloud",
    github: "https://github.com/rheasen",
    email: "vp@sxcaws.club",
    isExecutive: true,
    skills: ["CI/CD Pipelines", "Docker", "AWS Lambda", "Python"],
    order: 2,
  },
  {
    id: "member-3",
    name: "Kabir Mehta",
    position: "Secretary & Operations Head",
    departmentId: "dept-1",
    departmentName: "Executive Board",
    bio: "Managing institutional partnerships, AWS Academy curricula, and inter-collegiate tech symposiums.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/kabirmehta",
    github: "https://github.com/kabirmehta",
    email: "secretary@sxcaws.club",
    isExecutive: true,
    skills: ["Cloud Economics", "Event Strategy", "PostgreSQL", "AWS IAM"],
    order: 3,
  },
  {
    id: "member-4",
    name: "Ananya Roy",
    position: "Treasurer & Cloud FinOps Lead",
    departmentId: "dept-1",
    departmentName: "Executive Board",
    bio: "Focused on AWS Cost Optimization, AWS Budgets, and financial management for club hackathons and cloud credits.",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/ananyaroy",
    github: "https://github.com/ananyaroy",
    email: "treasurer@sxcaws.club",
    isExecutive: true,
    skills: ["AWS Cost Explorer", "CloudWatch", "FinOps", "Python"],
    order: 4,
  },
  {
    id: "member-5",
    name: "Vikramaditya Banerjee",
    position: "Technical Head & Cloud Architect",
    departmentId: "dept-2",
    departmentName: "Technical Department",
    bio: "Specializing in high-throughput distributed systems, event-driven backends, and multi-tenant AWS architectures.",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/vikram-banerjee",
    github: "https://github.com/vikrambanerjee",
    email: "tech@sxcaws.club",
    isExecutive: false,
    skills: ["Amazon ECS/EKS", "DynamoDB", "EventBridge", "Go", "TypeScript"],
    order: 5,
  },
  {
    id: "member-6",
    name: "Sneha Mukherjee",
    position: "AI/ML Lead & Cloud Researcher",
    departmentId: "dept-2",
    departmentName: "Technical Department",
    bio: "Building generative AI pipelines on Amazon Bedrock, SageMaker distributed training, and LLM orchestration.",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/snehamukherjee",
    github: "https://github.com/snehamukherjee",
    email: "aiml@sxcaws.club",
    isExecutive: false,
    skills: ["Amazon Bedrock", "SageMaker", "PyTorch", "LangChain", "Vector DBs"],
    order: 6,
  },
  {
    id: "member-7",
    name: "Devanshu Patel",
    position: "DevOps & Infrastructure Subhead",
    departmentId: "dept-2",
    departmentName: "Technical Department",
    bio: "Automating cloud infrastructure with Terraform, AWS CDK, GitHub Actions, and Prometheus monitoring.",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/devanshupatel",
    github: "https://github.com/devanshupatel",
    email: "devops@sxcaws.club",
    isExecutive: false,
    skills: ["Terraform", "AWS CDK", "Docker", "GitHub Actions", "Grafana"],
    order: 7,
  },
  {
    id: "member-8",
    name: "Ishita Bose",
    position: "Design & Creative Head",
    departmentId: "dept-3",
    departmentName: "Marketing & Design",
    bio: "Crafting futuristic UI/UX aesthetics, 3D cloud visuals, and cyberpunk branding for SXC AWS Club.",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/ishitabose",
    github: "https://github.com/ishitabose",
    email: "design@sxcaws.club",
    isExecutive: false,
    skills: ["Figma", "Three.js", "Motion Graphics", "Tailwind CSS"],
    order: 8,
  },
  {
    id: "member-9",
    name: "Rohan Varma",
    position: "Events & Hackathons Head",
    departmentId: "dept-4",
    departmentName: "Events & Operations",
    bio: "Directing large-scale technical hackathons, AWS game days, and interactive hands-on coding challenges.",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/rohanvarma",
    github: "https://github.com/rohanvarma",
    email: "events@sxcaws.club",
    isExecutive: false,
    skills: ["AWS GameDay", "Hackathon Organization", "Public Speaking"],
    order: 9,
  },
  {
    id: "member-10",
    name: "Pooja Hegde",
    position: "PR & Industry Outreach Head",
    departmentId: "dept-5",
    departmentName: "PR & Corporate Outreach",
    bio: "Fostering relations with AWS Heroes, AWS User Groups, and leading tech employers for internships.",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://linkedin.com/in/poojahegde-pr",
    github: "https://github.com/poojahegde",
    email: "pr@sxcaws.club",
    isExecutive: false,
    skills: ["Corporate Relations", "Sponsorships", "AWS User Groups"],
    order: 10,
  }
];

export const INITIAL_EVENTS: EventData[] = [
  {
    id: "event-1",
    title: "The Builder's Launchpad",
    slug: "the-builders-launchpad",
    description: "The first event of the AWS Student Builder Group at St. Xavier's College, Mumbai, introducing students to cloud computing and AWS.",
    fullDetails: "The Builder's Launchpad marks the first event of the AWS Student Builder Group at St. Xavier's College, Mumbai. It aims to introduce students to cloud computing and AWS while creating a platform where students from different streams can explore technology, develop practical skills, collaborate, and turn their ideas into real-world solutions.\n\nThe event features an introductory session on \"From On-Premise Limitations to the Cloud\", covering the limitations of traditional infrastructure, scalability, availability, infrastructure costs, and how cloud computing and AWS can address real-world challenges.",
    date: "2026-08-29T14:00:00+05:30",
    time: "02:00 PM - 04:00 PM IST",
    venue: "St. Xavier's College, Mumbai",
    category: "SEMINAR",
    status: "COMPLETED",
    isFeatured: true,
    imageUrl: "/events/the-builders-launchpad.jpeg",
    bannerUrl: "/events/the-builders-launchpad.jpeg",
    speakerNames: [],
    prerequisites: [],
    agenda: [],
    maxSeats: 120,
    currentRegistrations: 0,
    eccPoints: 0,
  },
  {
    id: "event-2",
    title: "Building a Serverless Event-Driven System on AWS",
    slug: "serverless-event-driven-system",
    description: "A hands-on AWS workshop using serverless services such as S3, Lambda and DynamoDB. No ECC points are awarded for this session.",
    fullDetails: "A hands-on AWS workshop where serverless services like S3, Lambda and DynamoDB are used to build an event-driven system.\n\nNote: No ECC points will be given.",
    date: "2026-09-09T12:00:00+05:30",
    time: "12:00 PM - 02:00 PM IST",
    venue: "St. Xavier's College (Autonomous), Mumbai",
    category: "WORKSHOP",
    status: "COMPLETED",
    isFeatured: false,
    imageUrl: "/events/serverless-event-driven-system.jpeg",
    bannerUrl: "/events/serverless-event-driven-system.jpeg",
    speakerNames: [],
    prerequisites: [],
    agenda: [],
    maxSeats: 40,
    currentRegistrations: 0,
    eccPoints: 0,
  },
  {
    id: "event-3",
    title: "From Bucket to Server: AWS S3 & EC2",
    slug: "from-bucket-to-server",
    description: "A beginner-friendly, hands-on introduction to AWS: create an S3 bucket and launch an EC2 instance.",
    fullDetails: "Learn the fundamentals of Amazon Web Services through a hands-on introduction to S3 and EC2.\n\nUnderstand how cloud storage and computing work in real-world applications. Get practical experience creating an S3 bucket and launching an EC2 instance. Perfect for beginners looking to take their first step into AWS and cloud computing.",
    date: "2026-09-23T08:00:00+05:30",
    time: "08:00 AM - 10:00 AM IST",
    venue: "St. Xavier's College (Autonomous), Mumbai",
    category: "WORKSHOP",
    status: "COMPLETED",
    isFeatured: false,
    imageUrl: "/events/from-bucket-to-server.jpeg",
    bannerUrl: "/events/from-bucket-to-server.jpeg",
    speakerNames: ["Prof. Aaron Johns"],
    prerequisites: [],
    agenda: [],
    maxSeats: 30,
    currentRegistrations: 0,
    eccPoints: 0,
  },
];

/**
 * Deliberately empty.
 *
 * This held three invented projects — CloudPulse, AutoScalerX, CloudDocs AI —
 * credited to eight people who do not exist, each with a stock photograph of a
 * real stranger used as their portrait, and GitHub URLs that resolve to
 * nothing.
 *
 * That was survivable while /projects was a hardcoded "coming soon" page that
 * never read the database. It is not survivable now that the page renders this
 * list: db.listProjects() falls back to it whenever Supabase is unreachable or
 * the table is missing, so a single outage would have published fabricated
 * student work under invented names on the college's site.
 *
 * The page's empty state covers this case properly. Add real projects through
 * the admin console.
 */
export const INITIAL_PROJECTS: ProjectData[] = [];

/**
 * Photos from the three events held so far.
 * Files live in public/gallery; supabase/schema.sql seeds the same rows.
 */
export const INITIAL_GALLERY: GalleryImageData[] = [
  {
    id: "gal-event-2-01",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "The workshop hall during the hands-on session, every seat at a workstation.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/124242.jpg",
    date: "2026-09-09",
    featured: true,
  },
  {
    id: "gal-event-2-02",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "The session lead walking the room through a step on the projector.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/124142.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-03",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Taking questions from the room mid-session.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/124908.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-04",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Presenting the next step to participants at their screens.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/123418.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-05",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "A full room working through the lab.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/134201.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-06",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "One-to-one help for a participant at their laptop.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/123435.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-07",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Wrapping up, with the AWS Builder Center QR code on screen.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/142500.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-08",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "The room filling up as the session begins.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/122250.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-3-09",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Presenters and participants together at the end of the workshop.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/095717.jpg",
    date: "2026-09-23",
    featured: true,
  },
  {
    id: "gal-event-3-10",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "A group selfie to close the day.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/0957300.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-11",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Explaining how to choose an EC2 instance type for a use case.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/085328.jpg",
    date: "2026-09-23",
    featured: true,
  },
  {
    id: "gal-event-3-12",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Walking through cloud storage concepts.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/083352.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-13",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Opening with the building blocks of a cloud.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/083154.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-14",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Comparing AWS with traditional IT infrastructure.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/084500.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-15",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "A live walkthrough in the AWS console.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/090121.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-16",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Participants following along in the terminal.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/090448.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-17",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "The opening session, with the room ready to start.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/082644.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-18",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Participants working through the hands-on exercises.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/093409.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-2-19",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Helping a participant with their setup.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/123944.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-20",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Checking in with participants at their desks.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/122312.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-21",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "The session lead moving through the lab.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/122324.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-22",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "The lab in progress, with the walkthrough on the projector.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/123546.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-23",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Answering a question from the front of the room.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/124905.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-24",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Participants working through the exercise.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/130526.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-25",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "Participants' screens mid-exercise.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/124251.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-2-26",
    title: "Building a Serverless Event-Driven System on AWS",
    description: "The hall from the back as the session gets going.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-2/122732.jpg",
    date: "2026-09-09",
    featured: false,
  },
  {
    id: "gal-event-3-27",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Participants following the cloud basics talk.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/083427.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-28",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Students listening in during the opening talk.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/083405.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-29",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Pointing out a detail in the console demo.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/090123.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-30",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "A console command running on the projector.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/090253.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-31",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "A participant working on the lab exercise.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/092213.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-32",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Participants working at their workstations.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/093414.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-33",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "The presenter wrapping up the hands-on section.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/093843.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-34",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Participants settling in before the first talk.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/083124.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-35",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Covering cloud computing deployment models.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/083623.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-3-36",
    title: "From Bucket to Server: AWS S3 & EC2",
    description: "Walking through the categories of AWS services.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-3/084641.jpg",
    date: "2026-09-23",
    featured: false,
  },
  {
    id: "gal-event-1-01",
    title: "The Builder's Launchpad",
    description: "A packed auditorium for the first AWS Student Builder Group event.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/20260829_150016.jpg",
    date: "2026-08-29",
    featured: true,
  },
  {
    id: "gal-event-1-02",
    title: "The Builder's Launchpad",
    description: "Students filling the hall during the opening session.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/20260829_150040.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-03",
    title: "The Builder's Launchpad",
    description: "The auditorium from the back, with the talk under way.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/20260829_150125.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-04",
    title: "The Builder's Launchpad",
    description: "The speaker addressing the full hall.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG-20260829-WA0104.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-05",
    title: "The Builder's Launchpad",
    description: "Rows of students listening in.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG-20260829-WA0103.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-06",
    title: "The Builder's Launchpad",
    description: "The speaker introducing AWS to the audience.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/20260829_145809.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-07",
    title: "The Builder's Launchpad",
    description: "Walking through what AWS offers.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/20260829_145847.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-08",
    title: "The Builder's Launchpad",
    description: "Making a point to the room with a mic in hand.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG-20260829-WA0132.jpg",
    date: "2026-08-29",
    featured: true,
  },
  {
    id: "gal-event-1-09",
    title: "The Builder's Launchpad",
    description: "The speaker addressing the hall from the front.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_143931.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-10",
    title: "The Builder's Launchpad",
    description: "Presenting The Builder's Journey.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_144720.jpg",
    date: "2026-08-29",
    featured: true,
  },
  {
    id: "gal-event-1-11",
    title: "The Builder's Launchpad",
    description: "Taking a question from students in the front row.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_144537.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-12",
    title: "The Builder's Launchpad",
    description: "Speaking among the audience.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_150849.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-13",
    title: "The Builder's Launchpad",
    description: "A speaker presenting from the podium.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG-20260829-WA0102.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-14",
    title: "The Builder's Launchpad",
    description: "Welcoming the audience from the podium.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_143407.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-15",
    title: "The Builder's Launchpad",
    description: "Introducing the group's coordinators.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_143010.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-16",
    title: "The Builder's Launchpad",
    description: "The team at the front of the hall, with the sign-up QR code on screen.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG-20260829-WA0053.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-17",
    title: "The Builder's Launchpad",
    description: "A group activity, with questions up on the screen.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_152043.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-18",
    title: "The Builder's Launchpad",
    description: "Students working through the group activity.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_152539.jpg",
    date: "2026-08-29",
    featured: false,
  },
  {
    id: "gal-event-1-19",
    title: "The Builder's Launchpad",
    description: "Closing the session, with the QR code on screen.",
    category: "WORKSHOPS",
    imageUrl: "/gallery/event-1/IMG_20260829_154658.jpg",
    date: "2026-08-29",
    featured: false,
  },
];

export const INITIAL_AWS_MODULES: AWSModuleData[] = [
  // Compute
  {
    id: "mod-ec2",
    title: "Amazon EC2",
    slug: "ec2",
    serviceCode: "EC2",
    category: "COMPUTE",
    difficulty: "BEGINNER",
    shortDesc: "Secure and resizable compute capacity in the cloud for scalable application hosting.",
    description: "Amazon Elastic Compute Cloud (Amazon EC2) provides on-demand, scalable computing capacity. It eliminates your need to invest in hardware upfront, so you can develop and deploy applications faster. You can use Amazon EC2 to launch as many or as few virtual servers as you need, configure security and networking, and manage storage.",
    iconName: "Server",
    keyConcepts: [
      "Instance Types (General Purpose, Compute, Memory, Storage Optimized)",
      "Amazon Machine Images (AMIs) & Custom Golden Images",
      "Security Groups & Network Access Control Lists (NACLs)",
      "Auto Scaling Groups (ASG) & Elastic Load Balancing (ELB)",
      "Purchasing Options (On-Demand, Savings Plans, Spot Instances)",
      "Key Pairs & Secure Shell (SSH) Access"
    ],
    cliExamples: [
      {
        command: "aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --count 1 --instance-type t3.micro --key-name MyKeyPair --security-group-ids sg-903004f8 --subnet-id subnet-6e7f829e",
        description: "Launch a new t3.micro EC2 instance with specified AMI and security group."
      },
      {
        command: "aws ec2 describe-instances --filters \"Name=instance-state-name,Values=running\" --query \"Reservations[*].Instances[*].[InstanceId,PublicIpAddress,InstanceType]\" --output table",
        description: "List all currently running EC2 instances with their IP and type."
      },
      {
        command: "aws ec2 terminate-instances --instance-ids i-1234567890abcdef0",
        description: "Safely terminate an EC2 instance."
      }
    ],
    labGuide: "1. Log in to the AWS Management Console.\n2. Navigate to EC2 and click 'Launch Instance'.\n3. Select Amazon Linux 2023 AMI and t3.micro instance type.\n4. Configure Security Group with Port 80 (HTTP) and Port 22 (SSH).\n5. Pass User Data bash script to install Apache Web Server (httpd).\n6. Access your public IPv4 in browser to see your live web server!",
    order: 1,
    resources: [
      { title: "Official Amazon EC2 User Guide", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html", type: "DOCS" },
      { title: "EC2 Instance Types Reference", url: "https://aws.amazon.com/ec2/instance-types/", type: "DOCS" },
      { title: "SXC AWS EC2 Hands-on Lab Repo", url: "https://github.com/sxc-aws-club/lab-ec2-starter", type: "LAB" }
    ]
  },
  {
    id: "mod-lambda",
    title: "AWS Lambda",
    slug: "lambda",
    serviceCode: "LAMBDA",
    category: "COMPUTE",
    difficulty: "INTERMEDIATE",
    shortDesc: "Run code without thinking about servers. Pay only for the compute time you consume.",
    description: "AWS Lambda is an event-driven serverless computing platform. It runs code in response to events and automatically manages the underlying compute resources. You can run code for virtually any type of application or backend service with zero administration.",
    iconName: "Zap",
    keyConcepts: [
      "Event-Driven Architecture & Event Sources (S3, SQS, API Gateway, DynamoDB Streams)",
      "Execution Environment, Cold Starts, & Provisioned Concurrency",
      "IAM Execution Roles & Permissions Policies",
      "Lambda Layers for Shared Dependencies",
      "Memory Allocation & CPU Scaling Proportionality",
      "Dead Letter Queues (DLQ) & Error Handling"
    ],
    cliExamples: [
      {
        command: "aws lambda create-function --function-name MyCloudFunction --runtime nodejs18.x --role arn:aws:iam::123456789012:role/lambda-role --handler index.handler --zip-file fileb://function.zip",
        description: "Deploy a Node.js Lambda function from a zip archive."
      },
      {
        command: "aws lambda invoke --function-name MyCloudFunction --payload '{\"key\":\"value\"}' response.json",
        description: "Directly invoke the Lambda function and save response output."
      }
    ],
    labGuide: "1. Create a Lambda function with Node.js 18.x.\n2. Write a handler function returning a JSON greeting.\n3. Add an Amazon API Gateway HTTP trigger.\n4. Test the generated endpoint in your browser or Postman.\n5. Attach an S3 bucket trigger to process file uploads in real-time.",
    order: 2,
    resources: [
      { title: "AWS Lambda Documentation", url: "https://docs.aws.amazon.com/lambda/", type: "DOCS" },
      { title: "Serverless Land Patterns", url: "https://serverlessland.com/patterns", type: "TUTORIAL" }
    ]
  },
  {
    id: "mod-ecs",
    title: "Amazon ECS & EKS",
    slug: "ecs-eks",
    serviceCode: "ECS",
    category: "COMPUTE",
    difficulty: "ADVANCED",
    shortDesc: "Highly scalable, high-performance container orchestration for Docker and Kubernetes.",
    description: "Amazon Elastic Container Service (ECS) and Amazon Elastic Kubernetes Service (EKS) allow you to easily run, scale, and secure containerized applications on AWS. With AWS Fargate, you can run containers without managing servers.",
    iconName: "Box",
    keyConcepts: [
      "Container Images & Amazon Elastic Container Registry (ECR)",
      "Task Definitions, Services, & Tasks in ECS",
      "AWS Fargate Serverless Compute for Containers",
      "Kubernetes Pods, Deployments, Services, & Ingress in EKS",
      "Service Mesh & Application Load Balancer Integration"
    ],
    cliExamples: [
      {
        command: "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com",
        description: "Authenticate Docker client with Amazon ECR private repository."
      },
      {
        command: "aws ecs update-service --cluster sxc-cluster --service web-app --force-new-deployment",
        description: "Trigger a rolling deployment update for an ECS service."
      }
    ],
    labGuide: "1. Build and tag a Next.js Docker container image.\n2. Push the image to Amazon ECR.\n3. Create an ECS Fargate Task Definition with 0.5 vCPU and 1GB RAM.\n4. Deploy an ECS Service behind an Application Load Balancer.\n5. Verify zero-downtime rolling deployments on code update.",
    order: 3,
    resources: [
      { title: "Amazon ECS Developer Guide", url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html", type: "DOCS" },
      { title: "Amazon EKS Best Practices", url: "https://aws.github.io/aws-eks-best-practices/", type: "TUTORIAL" }
    ]
  },

  // Storage
  {
    id: "mod-s3",
    title: "Amazon S3",
    slug: "s3",
    serviceCode: "S3",
    category: "STORAGE",
    difficulty: "BEGINNER",
    shortDesc: "Object storage built to retrieve any amount of data from anywhere with 99.999999999% durability.",
    description: "Amazon Simple Storage Service (Amazon S3) is an industry-leading object storage service offering high scalability, data availability, security, and performance. Store and protect data for websites, mobile applications, backup and restore, enterprise applications, IoT devices, and big data analytics.",
    iconName: "HardDrive",
    keyConcepts: [
      "Buckets, Objects, Keys, & Versioning",
      "Storage Classes (Standard, Intelligent-Tiering, Glacier Flexible, Glacier Deep Archive)",
      "Bucket Policies, Access Control Lists (ACLs), & Block Public Access",
      "S3 Lifecycle Management & Automatic Archival Rules",
      "Static Website Hosting & Cross-Origin Resource Sharing (CORS)",
      "Server-Side Encryption (SSE-S3, SSE-KMS, SSE-C)"
    ],
    cliExamples: [
      {
        command: "aws s3 mb s3://sxc-aws-club-assets-2026",
        description: "Create a new globally unique S3 bucket."
      },
      {
        command: "aws s3 sync ./build s3://sxc-aws-club-assets-2026/site --delete",
        description: "Sync local website build directory to S3 bucket."
      },
      {
        command: "aws s3 presign s3://sxc-aws-club-assets-2026/workshop-slides.pdf --expires-in 3600",
        description: "Generate a secure pre-signed download URL valid for 1 hour."
      }
    ],
    labGuide: "1. Create an S3 bucket with a unique name.\n2. Enable bucket versioning and default KMS encryption.\n3. Upload static HTML/CSS assets.\n4. Configure static website hosting and attach a read-only bucket policy.\n5. Integrate with CloudFront for global HTTPS distribution.",
    order: 4,
    resources: [
      { title: "Amazon S3 User Guide", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html", type: "DOCS" },
      { title: "S3 Storage Classes Comparison", url: "https://aws.amazon.com/s3/storage-classes/", type: "DOCS" }
    ]
  },

  // Database
  {
    id: "mod-rds",
    title: "Amazon RDS & Aurora",
    slug: "rds-aurora",
    serviceCode: "RDS",
    category: "DATABASE",
    difficulty: "INTERMEDIATE",
    shortDesc: "Managed relational database engine supporting PostgreSQL, MySQL, MariaDB, and Aurora.",
    description: "Amazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale a relational database in the cloud. Amazon Aurora is a MySQL and PostgreSQL-compatible relational database built for the cloud, combining the performance and availability of traditional enterprise databases with the simplicity and cost-effectiveness of open source databases.",
    iconName: "Database",
    keyConcepts: [
      "Multi-AZ Deployments & High Availability Failover",
      "Read Replicas for Scale-Out Read Workloads",
      "Automated Backups, Point-in-Time Restore, & Snapshots",
      "Aurora Serverless v2 Auto-Scaling Storage & Compute",
      "VPC Security Groups & Database Subnet Groups",
      "IAM Database Authentication & Secrets Manager Integration"
    ],
    cliExamples: [
      {
        command: "aws rds create-db-instance --db-instance-identifier sxc-pg-db --db-instance-class db.t4g.micro --engine postgres --master-username sxcadmin --master-user-password SuperSecretPassword123! --allocated-storage 20",
        description: "Provision a managed PostgreSQL database instance."
      }
    ],
    labGuide: "1. Create a DB Subnet Group across two private subnets.\n2. Launch an RDS PostgreSQL database with Multi-AZ disabled (dev mode).\n3. Store credentials securely in AWS Secrets Manager.\n4. Connect using Prisma ORM from an EC2 or ECS service.",
    order: 5,
    resources: [
      { title: "Amazon RDS Documentation", url: "https://docs.aws.amazon.com/rds/", type: "DOCS" },
      { title: "Amazon Aurora Architecture", url: "https://aws.amazon.com/rds/aurora/", type: "DOCS" }
    ]
  },
  {
    id: "mod-dynamodb",
    title: "Amazon DynamoDB",
    slug: "dynamodb",
    serviceCode: "DYNAMODB",
    category: "DATABASE",
    difficulty: "INTERMEDIATE",
    shortDesc: "Fast, flexible NoSQL database service for single-digit millisecond performance at any scale.",
    description: "Amazon DynamoDB is a fully managed, serverless, key-value and document NoSQL database designed to run high-performance applications at any scale. DynamoDB offers built-in security, continuous backups, automated multi-region replication, and data caching with DAX.",
    iconName: "Layers",
    keyConcepts: [
      "Partition Key (PK) & Sort Key (SK) Single-Table Design",
      "Global Secondary Indexes (GSI) & Local Secondary Indexes (LSI)",
      "On-Demand vs Provisioned Capacity Modes",
      "DynamoDB Streams for Real-Time Event Processing",
      "Time to Live (TTL) for Automated Record Expiration",
      "DynamoDB Accelerator (DAX) In-Memory Cache"
    ],
    cliExamples: [
      {
        command: "aws dynamodb create-table --table-name ClubRegistrations --attribute-definitions AttributeName=eventId,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=eventId,KeyType=HASH AttributeName=email,KeyType=RANGE --billing-mode PAY_PER_REQUEST",
        description: "Create an on-demand DynamoDB table with composite primary key."
      }
    ],
    labGuide: "1. Create a DynamoDB table with PK `PK` and SK `SK`.\n2. Insert item items representing Club Members and Events.\n3. Query items using Partition Key equality.\n4. Enable DynamoDB Streams and trigger a Lambda function on record insertion.",
    order: 6,
    resources: [
      { title: "Amazon DynamoDB Guide", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html", type: "DOCS" },
      { title: "Alex DeBrie's DynamoDB Book Patterns", url: "https://www.dynamodbbook.com/", type: "TUTORIAL" }
    ]
  },

  // Networking
  {
    id: "mod-vpc",
    title: "Amazon VPC & Networking",
    slug: "vpc",
    serviceCode: "VPC",
    category: "NETWORKING",
    difficulty: "INTERMEDIATE",
    shortDesc: "Provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network.",
    description: "Amazon Virtual Private Cloud (Amazon VPC) gives you complete control over your virtual networking environment, including selection of your own IP address range, creation of subnets, and configuration of route tables and network gateways. Protect and monitor connections with Security Groups, NACLs, and VPC Flow Logs.",
    iconName: "Network",
    keyConcepts: [
      "CIDR Block Subnetting (IPv4 / IPv6)",
      "Public vs. Private Subnets & Route Tables",
      "Internet Gateways (IGW) & NAT Gateways",
      "Security Groups (Stateful) vs NACLs (Stateless)",
      "VPC Peering, Transit Gateway, & PrivateLink"
    ],
    cliExamples: [
      {
        command: "aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=SXC-Main-VPC}]'",
        description: "Create a custom VPC with /16 CIDR block."
      }
    ],
    labGuide: "1. Create a custom VPC with CIDR 10.0.0.0/16.\n2. Create 2 public subnets and 2 private subnets across 2 AZs.\n3. Attach an Internet Gateway and route public subnets to it.\n4. Set up a NAT Gateway in the public subnet for private subnet internet access.",
    order: 7,
    resources: [
      { title: "Amazon VPC User Guide", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html", type: "DOCS" }
    ]
  },
  {
    id: "mod-cloudfront",
    title: "Amazon CloudFront & Route 53",
    slug: "cloudfront-route53",
    serviceCode: "CLOUDFRONT",
    category: "NETWORKING",
    difficulty: "BEGINNER",
    shortDesc: "Global Content Delivery Network (CDN) and highly available DNS web service.",
    description: "Amazon CloudFront is a fast content delivery network service that securely delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds. Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service.",
    iconName: "Globe",
    keyConcepts: [
      "Edge Locations & Regional Edge Caches",
      "Origin Access Control (OAC) for S3 Security",
      "SSL/TLS Certificates via AWS Certificate Manager (ACM)",
      "Route 53 Routing Policies (Simple, Weighted, Latency, Geolocation, Failover)",
      "CloudFront Functions & Lambda@Edge for Edge Computing"
    ],
    cliExamples: [
      {
        command: "aws cloudfront create-invalidation --distribution-id E1234567890EXAMPLE --paths \"/*\"",
        description: "Invalidate all cached objects across global Edge locations."
      }
    ],
    labGuide: "1. Request a free SSL certificate in us-east-1 via AWS ACM.\n2. Create a CloudFront distribution pointing to an S3 origin.\n3. Restrict S3 bucket access solely to CloudFront Origin Access Control (OAC).\n4. Point a Route 53 Alias record to the CloudFront distribution.",
    order: 8,
    resources: [
      { title: "Amazon CloudFront Developer Guide", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html", type: "DOCS" }
    ]
  },

  // Security
  {
    id: "mod-iam",
    title: "AWS IAM & Security",
    slug: "iam",
    serviceCode: "IAM",
    category: "SECURITY",
    difficulty: "BEGINNER",
    shortDesc: "Manage identities and access permissions across AWS services and resources securely.",
    description: "AWS Identity and Access Management (IAM) enables you to manage access to AWS services and resources securely. Using IAM, you can create and manage AWS users and groups, and use permissions to allow and deny their access to AWS resources following the Principle of Least Privilege.",
    iconName: "Shield",
    keyConcepts: [
      "Principle of Least Privilege",
      "Users, User Groups, & IAM Roles",
      "JSON Permission Policies (Identity-based vs Resource-based)",
      "Multi-Factor Authentication (MFA) & Root Account Hardening",
      "AWS Secrets Manager & Key Management Service (KMS)",
      "AWS WAF (Web Application Firewall) & Shield"
    ],
    cliExamples: [
      {
        command: "aws iam create-role --role-name LambdaS3ReaderRole --assume-role-policy-document file://trust-policy.json",
        description: "Create an IAM role with an assume-role trust policy."
      }
    ],
    labGuide: "1. Lock down the AWS Root account with hardware/virtual MFA.\n2. Create an IAM user for daily administrative duties.\n3. Create custom least-privilege JSON policies.\n4. Create an IAM Role for EC2 with S3 read permissions and attach an Instance Profile.",
    order: 9,
    resources: [
      { title: "AWS IAM Documentation", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html", type: "DOCS" }
    ]
  },

  // AI & ML
  {
    id: "mod-bedrock",
    title: "Amazon Bedrock & AI/ML",
    slug: "bedrock-sagemaker",
    serviceCode: "BEDROCK",
    category: "AIML",
    difficulty: "INTERMEDIATE",
    shortDesc: "Build and scale generative AI applications with leading Foundation Models (FMs) via a single API.",
    description: "Amazon Bedrock is a fully managed service that offers a choice of high-performing foundation models (FMs) from leading AI companies like Anthropic, Meta, AI21 Labs, Cohere, and Amazon through a single API. Build Generative AI apps with security, privacy, and responsible AI.",
    iconName: "Cpu",
    keyConcepts: [
      "Foundation Models (Claude 3.5 Sonnet, Llama 3, Amazon Titan)",
      "Retrieval-Augmented Generation (RAG) Architectures",
      "Bedrock Knowledge Bases & Vector Embeddings",
      "Bedrock Agents for Multi-Step Autonomous Workflows",
      "Amazon SageMaker Studio, Pipelines, & Endpoints",
      "Guardrails for Responsible AI Content Filtering"
    ],
    cliExamples: [
      {
        command: "aws bedrock-runtime invoke-model --model-id anthropic.claude-3-sonnet-20240229-v1:0 --body '{\"anthropic_version\":\"bedrock-2023-05-31\",\"max_tokens\":1000,\"messages\":[{\"role\":\"user\",\"content\":\"Explain AWS Lambda in 2 sentences.\"}]}' output.json",
        description: "Invoke Claude 3.5 Sonnet on Amazon Bedrock."
      }
    ],
    labGuide: "1. Enable model access for Claude 3.5 in Amazon Bedrock console.\n2. Create a Knowledge Base connected to an S3 document bucket.\n3. Test natural language queries in Bedrock playground.\n4. Connect backend Python/Next.js app to Bedrock SDK.",
    order: 10,
    resources: [
      { title: "Amazon Bedrock User Guide", url: "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html", type: "DOCS" },
      { title: "AWS Generative AI Samples", url: "https://github.com/aws-samples/amazon-bedrock-samples", type: "TUTORIAL" }
    ]
  },

  // Analytics
  {
    id: "mod-glue-athena",
    title: "AWS Glue & Amazon Athena",
    slug: "glue-athena",
    serviceCode: "ATHENA",
    category: "ANALYTICS",
    difficulty: "ADVANCED",
    shortDesc: "Serverless data integration and interactive SQL querying directly on Amazon S3 data lakes.",
    description: "AWS Glue is a serverless data integration service that makes it easy to discover, prepare, and combine data for analytics. Amazon Athena is an interactive query service that makes it easy to analyze data in Amazon S3 using standard SQL with no infrastructure to set up or manage.",
    iconName: "BarChart3",
    keyConcepts: [
      "Data Lake Architecture on Amazon S3 (Parquet, ORC, CSV)",
      "AWS Glue Data Catalog & Automated Crawlers",
      "Glue ETL Jobs (Apache Spark & Python Shell)",
      "Amazon Athena Presto / Trino SQL Queries",
      "Amazon Redshift Serverless Data Warehousing"
    ],
    cliExamples: [
      {
        command: "aws athena start-query-execution --query-string \"SELECT status, count(*) FROM club_logs GROUP BY status;\" --result-configuration \"OutputLocation=s3://sxc-athena-results/\"",
        description: "Run serverless SQL query on S3 logs with Amazon Athena."
      }
    ],
    labGuide: "1. Store web server access logs in Amazon S3.\n2. Run an AWS Glue Crawler to infer schema and register table in Glue Data Catalog.\n3. Open Amazon Athena and execute SQL queries to find top visitors and HTTP status codes.\n4. Visualize results in Amazon QuickSight.",
    order: 11,
    resources: [
      { title: "Amazon Athena User Guide", url: "https://docs.aws.amazon.com/athena/latest/ug/what-is.html", type: "DOCS" },
      { title: "AWS Glue Developer Guide", url: "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html", type: "DOCS" }
    ]
  }
];

export const INITIAL_CONTACT_MESSAGES: ContactMessageData[] = [
  {
    id: "msg-1",
    name: "Devika Roy",
    email: "devikaroy@gmail.com",
    subject: "Interested in CloudHacks 2026 Sponsorship",
    message: "Hi SXC AWS Club team! We are looking to sponsor the upcoming hackathon and provide mentor sessions on Cloud Architecture. Let us know how we can connect.",
    isRead: true,
    createdAt: "2026-08-20T11:20:00Z"
  },
  {
    id: "msg-2",
    name: "Rahul Nair",
    email: "rahul.nair@college.edu",
    subject: "How can 1st year students join the Technical Team?",
    message: "Hey there! I am a first year CS student passionate about Linux and Docker. When do recruitment drives start for the subhead roles?",
    isRead: false,
    createdAt: "2026-08-23T15:40:00Z"
  }
];
