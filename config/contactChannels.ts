import { siteConfig } from "@/config/site";

export interface ContactChannel {
  id: string;
  label: string;
  /** Shown under the label — what someone actually gets by clicking. */
  handle: string;
  /** Empty string means "not set up yet"; the UI skips it rather than
   *  rendering a link that goes nowhere. */
  url: string;
  /** Brand colour, used for the hover glow and the icon tint. */
  color: string;
}

/**
 * Every way to reach the club, in one list.
 *
 * Two of these ship empty on purpose. `siteConfig.links` carries a Discord
 * invite that has never been rendered anywhere public and looks like
 * scaffolding rather than a real destination (discord.gg/sxc-aws) — the same
 * shape as the github.com/sxc-aws-club placeholder sitting beside it.
 * Publishing an invite that 404s is worse than not offering the channel at
 * all, so it stays blank until someone pastes a link that has been clicked and
 * confirmed. WhatsApp is waiting on a group invite for the same reason.
 *
 * To switch one on: put the real URL in the `url` field below. It appears on
 * the contact page immediately, no other change needed.
 */
export const contactChannels: ContactChannel[] = [
  {
    id: "gmail",
    label: "Email",
    handle: siteConfig.links.email,
    url: `mailto:${siteConfig.links.email}`,
    color: "#EA4335",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@aws.sxcbom",
    url: siteConfig.links.instagram,
    color: "#E1306C",
  },
  {
    id: "meetup",
    label: "Meetup",
    handle: "AWS SBG Mumbai",
    url: siteConfig.links.meetup,
    color: "#ED1C40",
  },
  {
    id: "aws",
    label: "AWS Builder Center",
    handle: "Start building",
    url: siteConfig.links.awsBuilder,
    color: "#FF9900",
  },
  {
    id: "discord",
    label: "Discord",
    handle: "Join the server",
    // TODO: paste the real invite. siteConfig.links.discord is a placeholder.
    url: "",
    color: "#5865F2",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "SXC AWS Group",
    url: siteConfig.links.linkedin,
    color: "#0A66C2",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    handle: "Community group",
    // TODO: paste the group invite, e.g. https://chat.whatsapp.com/XXXXXXXX
    url: "",
    color: "#25D366",
  },
];
