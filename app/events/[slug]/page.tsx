import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Users, CheckCircle, ArrowLeft, ArrowUpRight, Sparkles, Mic, BookOpen, Share2 } from "lucide-react";
import { db } from "@/lib/db";
import { RegistrationModal } from "@/components/events/RegistrationModal";
import { EventDetailsClient } from "@/components/events/EventDetailsClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  const events = db.getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = db.getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} — SXC AWS Club Events`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = db.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const allEvents = db.getEvents();
  const relatedEvents = allEvents.filter((e) => e.id !== event.id).slice(0, 2);

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative pt-28 pb-20 overflow-hidden">
      {/* Back button */}
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-navy-900/80 hover:bg-navy-800 text-slate-300 hover:text-aws-orange border border-white/10 text-xs font-mono transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative rounded-3xl overflow-hidden border border-aws-orange/30 shadow-2xl h-80 sm:h-96 w-full">
          <Image
            src={event.bannerUrl || event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060A14] via-navy-950/60 to-transparent" />

          {/* Hero Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-aws-orange text-black shadow-md">
                {event.category}
              </span>
              {event.status === "UPCOMING" ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Upcoming Registration Open
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900/90 text-slate-300 border border-white/10">
                  Completed Event
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Details, Agenda, Speakers */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview / Full Details */}
            <div className="p-8 rounded-3xl bg-navy-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-aws-orange" />
                <span>About this Session</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {event.fullDetails || event.description}
              </p>
            </div>

            {/* Agenda Timeline */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="p-8 rounded-3xl bg-navy-900/70 border border-white/10 backdrop-blur-xl space-y-6 shadow-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-aws-orange" />
                  <span>Session Agenda</span>
                </h2>

                <div className="relative border-l-2 border-aws-orange/30 ml-3 space-y-6">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-navy-950 border-2 border-aws-orange" />
                      <div className="text-xs font-mono font-bold text-aws-orange-light">{item.time}</div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{item.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers / Hosts */}
            {event.speakerNames && event.speakerNames.length > 0 && (
              <div className="p-8 rounded-3xl bg-navy-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-aws-orange" />
                  <span>Keynote Speakers & Facilitators</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.speakerNames.map((speaker, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-navy-950/80 border border-white/5 flex items-center gap-3 text-slate-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-aws-orange/20 border border-aws-orange/30 text-aws-orange flex items-center justify-center font-mono font-bold text-xs">
                        {speaker[0]}
                      </div>
                      <span className="text-xs font-semibold">{speaker}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {event.prerequisites && event.prerequisites.length > 0 && (
              <div className="p-8 rounded-3xl bg-navy-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Prerequisites & Requirements</span>
                </h2>
                <ul className="space-y-2">
                  {event.prerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Key Logistics & Registration Action Widget */}
          <div className="lg:col-span-4 space-y-6">
            <EventDetailsClient event={event} formattedDate={formattedDate} />

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className="p-6 rounded-3xl bg-navy-900/70 border border-white/10 backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Other Upcoming Gatherings
                </h3>
                <div className="space-y-3">
                  {relatedEvents.map((re) => (
                    <Link
                      key={re.id}
                      href={`/events/${re.slug}`}
                      className="block p-3 rounded-2xl bg-navy-950/70 border border-white/5 hover:border-aws-orange/40 transition-colors group"
                    >
                      <span className="text-[10px] font-mono text-aws-orange block mb-1">
                        {new Date(re.date).toLocaleDateString()}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-aws-orange transition-colors truncate">
                        {re.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{re.venue}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
