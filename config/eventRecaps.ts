/**
 * Recaps of past sessions, keyed by the event slug used in /events/[slug].
 *
 * A recap is the deck rebuilt as a page rather than a file to download: the
 * running order on one side, the slide's own artwork on the other, and a short
 * writeup of what was actually said on each.
 *
 * `image` is omitted where the slide carried no artwork — the title, the group
 * activity and the closing quote are pure typography, and the page lays those
 * out as markup instead of screenshotting text.
 *
 * `writeup` is omitted on the opening slide, the group activity and the closing
 * line. The first is a title card, the activity is the audience's own answers
 * rather than taught material, and the last is a quote that speaks for itself.
 */

export interface RecapSlide {
  /** The slide title, as it reads in the deck. */
  title: string;
  /** Artwork lifted from the slide. Absent for the text-only slides. */
  image?: string;
  /** Alt text for that artwork. */
  alt?: string;
  /** What the slide covered. Absent where a summary would be inventing one. */
  writeup?: string;
  /** The slide's own bullet points, where it had them. */
  points?: string[];
  /** Rendered instead of artwork on the text-only slides. */
  quote?: string;
  questions?: string[];
}

export interface EventRecap {
  /** Matches the event slug in the database. */
  slug: string;
  title: string;
  presenter: string;
  /** One line under the title. */
  summary: string;
  slides: RecapSlide[];
}

const buildersLaunchpad: EventRecap = {
  slug: "the-builders-launchpad",
  title: "Introduction to Amazon Web Services",
  presenter: "Daniel Pereira",
  summary:
    "How a project outgrows the laptop it started on, and which parts of AWS take over when it does.",
  slides: [
    {
      title: "Introduction to AWS",
      quote: "Introduction to Amazon Web Services",
    },
    {
      title: "Every Builder Starts Somewhere",
      image: "/recaps/builders-launchpad/slide02.webp",
      alt: "A student at a laptop, with a lit path leading toward a cloud data centre",
      writeup:
        "The session opened on the gap between where a builder starts and where the work ends up. Everyone begins the same way — one person, one laptop, one idea worth trying. The distance from that desk to real infrastructure looks enormous from the near side and turns out to be mostly a matter of knowing which tools exist.",
    },
    {
      title: "Your Laptop Is Already a Powerful Builder Tool",
      image: "/recaps/builders-launchpad/slide03.webp",
      alt: "Icons for coding, websites, data analysis, databases, local AI models and games",
      writeup:
        "Before any argument for the cloud, a point in the laptop's favour: the machine you already own is a serious piece of equipment. Nearly everything worth building starts on it, and most projects never need anything else.",
      points: [
        "Code applications",
        "Build websites",
        "Analyse data",
        "Run databases",
        "Run local AI models",
        "Create games",
      ],
    },
    {
      title: "The Builder's Journey",
      image: "/recaps/builders-launchpad/slide04.webp",
      alt: "Five stages: idea, build locally, grow, hit a limit, scale",
      writeup:
        "The arc every project follows, drawn as five stages. What matters is the fourth: hitting a limit is not a sign the project was badly built, it is the normal consequence of it working. The loop closes back to the beginning — the cloud is where the next iteration runs, not the end of the road.",
      points: [
        "Idea — it starts with a simple idea",
        "Build locally — build using the tools you have",
        "Grow — your idea grows and so does your project",
        "Hit a limit — you run into limitations of your local machine",
        "Scale — use the cloud to scale and go further",
      ],
    },
    {
      title: "Your Laptop Has Limits",
      image: "/recaps/builders-launchpad/slide05.webp",
      alt: "Six constraints of a local machine, around a student waiting on a slow laptop",
      writeup:
        "The other half of the argument. Each limit here is one people meet in practice rather than in theory — the model that will not fit in memory, the training run left going overnight, the project that cannot be shown to anyone because it only exists on a machine that is currently shut. The slide's own summary: your idea is bigger than your machine.",
      points: [
        "Not enough power — CPU and GPU are not powerful enough",
        "Limited memory — not enough RAM to run large models or applications",
        "Storage fills up — limited storage for big files and datasets",
        "Takes too long — training or processing takes hours or even days",
        "Not always available — your laptop needs to be on and connected",
        "Can't handle more users — hard to support many users or scale your app",
      ],
    },
    {
      title: "What Is Cloud Computing?",
      image: "/recaps/builders-launchpad/slide06.webp",
      alt: "A builder connected over the internet to compute, storage, database and security",
      writeup:
        "The definition, kept deliberately plain: renting computing over the internet instead of owning it. You ask for what you need, use it for as long as you need it, and stop paying when you stop. The machines are someone else's problem to buy, cool, patch and replace.",
      points: ["Compute", "Storage", "Database", "Security"],
    },
    {
      title: "Cloud Computing Services",
      image: "/recaps/builders-launchpad/slide07.webp",
      alt: "Five categories of cloud service",
      writeup:
        "Every cloud provider organises itself around roughly the same five categories. Learn the categories and the individual product names stop mattering so much — you are looking for the compute service or the storage service, and each provider has one.",
      points: [
        "Compute Engine — powerful virtual machines to run your applications and workloads",
        "Storage — scalable and secure storage for all your files, backups and data",
        "Database — managed databases that are reliable, efficient and built for high performance",
        "Networking — fast, secure and reliable networking to connect your resources anywhere",
        "AI Services — pre-built AI capabilities to build smarter applications faster",
      ],
    },
    {
      title: "What Is Amazon Web Services?",
      image: "/recaps/builders-launchpad/slide08.webp",
      alt: "The AWS logo beside a summary and a row of popular services",
      writeup:
        "AWS is Amazon's cloud platform, and the one this group is built around. The pitch is breadth: a wide enough range of services to build, deploy and scale an application without leaving the platform, on infrastructure spread across the world.",
      points: ["Secure", "Scalable", "Reliable", "Cost-effective", "Global infrastructure"],
    },
    {
      title: "What Does AWS Offer?",
      image: "/recaps/builders-launchpad/slide09.webp",
      alt: "Five AWS pillars, each with two representative services",
      writeup:
        "The same five categories again, now with names attached — two services per pillar, which is enough to build something real without drowning in the catalogue. Worth noting that Lambda sits under compute: you can run code without running a server at all.",
      points: [
        "Compute — Amazon EC2, AWS Lambda",
        "Storage — Amazon S3, Amazon EBS",
        "Databases — Amazon RDS, Amazon DynamoDB",
        "Networking — Amazon VPC, Amazon Route 53",
        "AI & machine learning — Amazon Bedrock, Amazon SageMaker",
      ],
    },
    {
      title: "Amazon EC2 and S3",
      image: "/recaps/builders-launchpad/slide10.webp",
      alt: "EC2 as compute in the cloud beside S3 as object storage",
      writeup:
        "The two services most projects reach for first, and the cleanest illustration of the split between compute and storage. EC2 is a computer you rent by the hour and can resize when the load changes. S3 holds files — images, backups, datasets — with no capacity to plan and no disk to run out of.",
      points: [
        "EC2 — virtual servers running your applications in the cloud",
        "EC2 — scale up or down as demand changes",
        "EC2 — built-in security and networking",
        "S3 — highly durable and reliable",
        "S3 — store any amount of data",
        "S3 — encryption and access control",
      ],
    },
    {
      title: "Amazon RDS and DynamoDB",
      image: "/recaps/builders-launchpad/slide11.webp",
      alt: "RDS as a managed relational database beside DynamoDB as a managed NoSQL database",
      writeup:
        "Two databases answering two different questions. RDS runs a familiar relational database and takes the maintenance off your hands — backups, patching, monitoring, failover. DynamoDB trades tables and joins for a key-value model that keeps single-digit millisecond latency no matter how large it grows. The choice follows the shape of your data, not which is newer.",
      points: [
        "RDS — structured data with tables and relations",
        "RDS — automated backups, patching, monitoring and scaling",
        "RDS — built-in replication and failover",
        "DynamoDB — key-value and document data model",
        "DynamoDB — automatically scales to handle any workload",
        "DynamoDB — single-digit millisecond latency at any scale",
      ],
    },
    {
      title: "Amazon Bedrock",
      image: "/recaps/builders-launchpad/slide12.webp",
      alt: "The five Bedrock stages, and the model providers available through it",
      writeup:
        "Where generative AI fits. Bedrock offers foundation models from several providers — Anthropic, Meta, Mistral, Cohere, AI21 — behind one API, so switching models does not mean rewriting the application. You can adapt a model to your own data through fine-tuning or retrieval-augmented generation without training anything from scratch.",
      points: [
        "Access — high-performing foundation models through a single API",
        "Customize — fine-tuning and retrieval augmented generation on your own data",
        "Build — simple APIs and SDKs to add generative AI to your applications",
        "Deploy — enterprise-grade security and reliability",
        "Scale — go from prototype to production on managed infrastructure",
      ],
    },
    {
      title: "Group Activity",
      questions: [
        "What do you want to build?",
        "Can you start on your laptop?",
        "What limitation might you face?",
        "Which cloud capability could help?",
      ],
    },
    {
      title: "Closing Thought",
      quote:
        "Focus on the capabilities the cloud provides, not the features it has",
    },
  ],
};

export const eventRecaps: EventRecap[] = [buildersLaunchpad];

export function findRecap(slug: string): EventRecap | undefined {
  return eventRecaps.find((r) => r.slug === slug);
}

export function hasRecap(slug: string): boolean {
  return eventRecaps.some((r) => r.slug === slug);
}
