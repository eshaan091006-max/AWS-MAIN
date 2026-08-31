import React from "react";
import { Terminal, Users, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNavItems } from "@/config/navigation";
import { CinematicFooter } from "@/components/ui/motion-footer";

/**
 * The site footer, using the cinematic footer with this site's own content.
 *
 * Everything here already existed on the page: the tagline supplies the
 * marquee, the nav groups keep their headings and every link title, and the two
 * primary pills are the Meetup and Builder Center links the site already
 * points at. The App Store buttons in the original have no equivalent — this
 * club has no app.
 */
export function Footer() {
  return (
    <CinematicFooter
      heading="Build. Deploy. Scale."
      marqueeWords={["Learn", "Build", "Deploy", "Scale"]}
      wordmark="AWS SBG"
      primaryLinks={[
        {
          label: "Join the Meetup Group",
          href: siteConfig.links.meetup,
          external: true,
          icon: <Users className="w-5 h-5" />,
        },
        {
          label: "AWS Builder Center",
          href: siteConfig.links.awsBuilder,
          external: true,
          icon: <ArrowUpRight className="w-5 h-5" />,
        },
      ]}
      linkGroups={[
        { heading: "Explore", items: footerNavItems.explore },
        { heading: "AWS Learning", items: footerNavItems.learn },
        { heading: "Community", items: footerNavItems.community },
      ]}
      copyright={`© ${new Date().getFullYear()} SXC AWS Group. All rights reserved.`}
      badge={
        <>
          <Terminal className="w-3.5 h-3.5 text-aws-orange" />
          <span className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest">
            Learn. Build. Deploy. Scale.
          </span>
        </>
      }
    />
  );
}
