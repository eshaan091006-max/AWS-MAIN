import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { Grain } from "@/components/ui/grain";
import { PageTransition } from "@/components/ui/page-transition";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CloudGridBackground } from "@/components/animations/CloudGridBackground";
import { NetworkNodesCanvas } from "@/components/animations/NetworkNodesCanvas";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// The programme's own typefaces, from the official AWS Student Builder Group
// brand kit, rather than the nearest lookalike from Google Fonts.
//
// Served through next/font/local: the files are subsetted and fingerprinted at
// build time and shipped as woff2 from the app's own asset path. Dropping the
// raw .ttf into public/ instead would publish licensed font files at a
// guessable URL, which is closer to redistributing them than using them.
const emberDisplay = localFont({
  src: [
    { path: "./fonts/AmazonEmberDisplay_Rg.ttf", weight: "400", style: "normal" },
    { path: "./fonts/AmazonEmberDisplay_Md.ttf", weight: "500", style: "normal" },
    { path: "./fonts/AmazonEmberDisplay_Bd.ttf", weight: "700", style: "normal" },
    // Heavy. The headline weight the site lost when Outfit went.
    { path: "./fonts/AmazonEmberDisplay_He.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const emberMono = localFont({
  src: [
    { path: "./fonts/AmazonEmberMono_Rg.ttf", weight: "400", style: "normal" },
    { path: "./fonts/AmazonEmberMono_Bd.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});


export const metadata: Metadata = {
  title: {
    default: "SXC AWS Club — Build. Deploy. Scale.",
    template: "%s | SXC AWS Club",
  },
  description: siteConfig.description,
  keywords: [
    "AWS",
    "Amazon Web Services",
    "SXC AWS Club",
    "St. Xavier's College",
    "Cloud Computing",
    "Serverless",
    "Kubernetes",
    "Terraform",
    "DevOps",
    "Generative AI",
    "Amazon Bedrock",
  ],
  authors: [{ name: "SXC AWS Student Community" }],
  creator: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "SXC AWS Club — Build. Deploy. Scale.",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "SXC AWS Club Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SXC AWS Club — Build. Deploy. Scale.",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${emberDisplay.variable} ${emberMono.variable}`}>
      {/* Inter for prose, JetBrains Mono where it is declared explicitly —
          eyebrows, stat labels, counts, metadata. Mono set everything, which
          reads as a terminal rather than a document and measurably slows
          reading at paragraph length; the 138 elements that ask for mono by
          name keep it, and that contrast is the point. */}
      <body className="min-h-screen bg-navy-950 text-zinc-100 font-sans antialiased selection:bg-aws-orange selection:text-black">
        {/* Public site chrome. Absent on /admin, which is an operator
            console with its own navigation and no need for a marketing
            navbar or two animated background canvases. */}
        <SiteChrome>
          <CloudGridBackground />
          <NetworkNodesCanvas />
          <Navbar />
        </SiteChrome>

        {/* Page Content */}
        <main className="relative z-10 min-h-[calc(100vh-200px)]">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Over everything, including the fixed navbar and footer, so the whole
            surface shares one texture rather than the chrome looking cleaner
            than the page. */}
        <Grain />

        <SiteChrome>
          <Footer />
        </SiteChrome>
      </body>
    </html>
  );
}
