"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, Sparkles, Share2, Check, Lock, Award, CheckCircle2 } from "lucide-react";
import { EventData } from "@/lib/data/initialData";
import { RegistrationModal } from "@/components/events/RegistrationModal";
import { useSeatCount } from "@/lib/hooks/useSeatCount";
import { useRegistered } from "@/lib/hooks/useRegistered";

interface Props {
  event: EventData;
  formattedDate: string;
}

export function EventDetailsClient({ event, formattedDate }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isRegistered, markRegistered } = useRegistered(event.id);

  const { registered, maxSeats, isFull, refresh: refreshSeats } = useSeatCount(
    event.id,
    event.currentRegistrations,
    event.maxSeats
  );

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const percentFull = Math.min(100, Math.round((registered / maxSeats) * 100));

  return (
    <>
      <div className="sticky top-28 p-6 rounded-3xl bg-navy-900/90 border border-aws-orange/40 backdrop-blur-2xl shadow-2xl space-y-5">
        <div className="text-xs font-mono uppercase tracking-widest text-aws-orange font-bold">
          Session Information
        </div>

        <div className="space-y-3.5 text-xs text-slate-300 font-mono">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-aws-orange shrink-0 mt-0.5" />
            <div>
              <div className="text-slate-400 text-[10px]">DATE</div>
              <div className="text-white font-sans font-semibold text-xs">{formattedDate}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-aws-orange shrink-0 mt-0.5" />
            <div>
              <div className="text-slate-400 text-[10px]">TIME</div>
              <div className="text-white font-sans font-semibold text-xs">{event.time}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-slate-400 text-[10px]">VENUE</div>
              <div className="text-white font-sans font-semibold text-xs leading-relaxed">{event.venue}</div>
            </div>
          </div>

          {event.eccPoints > 0 && (
            <div className="flex items-start gap-3">
              <Award className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-400 text-[10px]">CREDITS</div>
                <div className="text-white font-sans font-semibold text-xs">
                  {event.eccPoints} ECC on attendance
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Reserved Seats</span>
              </span>
              <span className="font-bold text-white">
                {registered} / {maxSeats} ({percentFull}%)
              </span>
            </div>
            <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? "bg-slate-500" : "bg-gradient-to-r from-amber-500 to-aws-orange"
                }`}
                style={{ width: `${percentFull}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {event.status === "UPCOMING" && isRegistered ? (
          <div className="w-full py-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Already Registered</span>
          </div>
        ) : event.status === "UPCOMING" && isFull ? (
          <div className="w-full py-3 rounded-2xl bg-navy-950 border border-slate-600/50 text-slate-300 text-center text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 grayscale">
            <Lock className="w-4 h-4" />
            <span>Slots Booked</span>
          </div>
        ) : event.status === "UPCOMING" ? (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-xs shadow-xl shadow-aws-orange/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>RSVP Free Seat Now</span>
          </button>
        ) : (
          <div className="w-full py-2.5 rounded-2xl bg-navy-950 text-slate-400 text-center text-xs font-mono border border-white/10">
            Registration Closed (Completed)
          </div>
        )}

        <button
          onClick={handleShare}
          className="w-full py-2 rounded-2xl bg-navy-950 hover:bg-navy-800 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? "Link Copied to Clipboard!" : "Share Event Link"}</span>
        </button>
      </div>

      <RegistrationModal
        event={event}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refreshSeats}
        isFull={isFull}
        onRegistered={() => markRegistered()}
      />
    </>
  );
}
