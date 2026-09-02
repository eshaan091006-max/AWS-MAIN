import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What the SXC AWS Group collects when you register for a session or contact us, how it is used, and how to have it removed.",
};

/**
 * The date the wording last changed. Update it whenever a section is edited —
 * a policy whose "last updated" line is stale is worse than one with no date.
 */
const LAST_UPDATED = "2 September 2026";

const EMAIL = siteConfig.links.email;

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
        <span className="text-aws-orange font-mono text-sm mr-3">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="text-aws-orange/70 shrink-0">
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="relative pt-36 pb-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 lg:px-12">
        <header>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-aws-orange mb-4">
            Legal
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-[1.05]">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mt-5">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="text-sm sm:text-base text-zinc-400 mt-6 leading-relaxed">
            This policy explains how the SXC AWS Student Builder Group — the AWS student
            community at St. Xavier&rsquo;s College, Mumbai — collects, uses and protects
            your information when you browse this site or register for one of our
            sessions.
          </p>
          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
            Our sessions are free and run for students and members of the college
            community. We do not sell tickets or passes, and we take no payment
            information of any kind.
          </p>
        </header>

        <Section n={1} title="Information we collect">
          <p>When you register for an event, we ask for:</p>
          <List
            items={[
              "Your first name and surname",
              "Your college UID, so we can confirm you are a member of the college",
              "Your email address",
              "Your academic year and stream",
            ]}
          />
          <p>When you send us a message through the contact form, we collect:</p>
          <List
            items={[
              "Your name and email address",
              "The subject and content of your message",
            ]}
          />
          <p className="text-zinc-400">
            We do not collect phone numbers, dates of birth, photographs, identity
            documents or payment details. We do not run third-party analytics or
            advertising trackers on this site.
          </p>
          <p className="text-zinc-400">
            Your IP address is read momentarily to rate-limit the contact form against
            spam. It is held in server memory only, for a matter of minutes, and is never
            written to our database.
          </p>
        </Section>

        <Section n={2} title="How we use your information">
          <List
            items={[
              "To record your registration and hold your seat for a session",
              "To confirm at the door that you registered, and to keep a headcount for the venue",
              "To confirm, via your college UID, that registrations come from within the college",
              "To prevent duplicate registrations and spam submissions",
              "To reply to questions you send us through the contact form",
            ]}
          />
          <p className="text-zinc-400">
            This site does not send automated email, SMS or WhatsApp messages. Your
            registration is confirmed on screen when you submit it. If we ever need to
            contact you about a session you registered for, a committee member will write
            to you directly.
          </p>
        </Section>

        <Section n={3} title="Sharing of information">
          <p>We do not sell your personal information. It is shared only with:</p>
          <List
            items={[
              "Committee members running the session, limited to the list needed to check people in",
              "Supabase, the hosting provider that stores the data on our behalf",
              "Law enforcement or regulatory authorities, only where required by law",
            ]}
          />
        </Section>

        <Section n={4} title="Data storage and security">
          <p>
            Registrations and messages are stored on Supabase&rsquo;s managed cloud
            infrastructure. Access is restricted to committee members who sign in to our
            admin console, which is protected by a password and a session cookie and is
            never publicly listed.
          </p>
          <p>
            We take reasonable measures to protect your data, but no online system can be
            guaranteed to be completely secure.
          </p>
        </Section>

        <Section n={5} title="Your choices">
          <p>
            You can ask to see, correct or delete the information we hold about you by
            writing to{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="text-aws-orange hover:text-aws-orange-light underline underline-offset-4 transition-colors"
            >
              {EMAIL}
            </a>
            .
          </p>
          <p className="text-zinc-400">
            Deleting your registration before an event means we will no longer have a
            record of your seat, and you may not be able to be checked in at the door.
          </p>
        </Section>

        <Section n={6} title="Cookies">
          <p>
            Browsing this site and registering for an event set no cookies at all. The one
            cookie this site can set is a session cookie for committee members who sign in
            to the admin console, and it exists only to keep them signed in.
          </p>
          <p className="text-zinc-400">
            We use no advertising cookies and no third-party tracking.
          </p>
        </Section>

        <Section n={7} title="Changes to this policy">
          <p>
            We may update this policy from time to time. The date at the top of this page
            shows when it last changed, and continuing to use the site after a change
            means you accept the revised policy.
          </p>
        </Section>

        <Section n={8} title="Contact us">
          <p>
            For any privacy-related question, write to{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="text-aws-orange hover:text-aws-orange-light underline underline-offset-4 transition-colors"
            >
              {EMAIL}
            </a>{" "}
            or reach us through the{" "}
            <Link
              href="/contact"
              className="text-aws-orange hover:text-aws-orange-light underline underline-offset-4 transition-colors"
            >
              contact page
            </Link>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
