"use client";

import React, { useState } from "react";
import { X, CheckCircle, Sparkles, Loader2, Calendar, MapPin, User, Mail, Hash, GraduationCap, BookOpen, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { EventData } from "@/lib/data/initialData";

interface RegistrationModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Every seat is taken: the form is shown disabled rather than submittable. */
  isFull?: boolean;
  /** Called when this browser is known to have registered — on success, and
   *  also when the server reports the email is already signed up. */
  onRegistered?: (email: string) => void;
}

export function RegistrationModal({ event, isOpen, onClose, onSuccess, isFull = false, onRegistered }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    uid: "",
    email: "",
    academicYear: "FY",
    stream: "BSc IT",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The modal stays mounted between openings, so reset the success screen on
  // close — otherwise the next visitor to open it sees the previous
  // confirmation instead of a blank form.
  const handleClose = () => {
    if (submitted) {
      setSubmitted(false);
      setAlreadyRegistered(false);
      setFormData({ name: "", surname: "", uid: "", email: "", academicYear: "FY", stream: "BSc IT" });
    }
    setError(null);
    onClose();
  };

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) return;
    setLoading(true);
    setError(null);

    try {
      const fullName = `${formData.name.trim()} ${formData.surname.trim()}`.trim();

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name: fullName,
          firstName: formData.name,
          surname: formData.surname,
          uid: formData.uid,
          email: formData.email,
          academicYear: formData.academicYear,
          stream: formData.stream,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // 409 means the database rejected this email as a duplicate. That is
        // not a failure to report as one — this person IS registered, so
        // record it and show the confirmation rather than an error they can
        // do nothing about.
        if (res.status === 409 && /already registered/i.test(data.error ?? "")) {
          setAlreadyRegistered(true);
          setSubmitted(true);
          onRegistered?.(formData.email);
          if (onSuccess) onSuccess();
          return;
        }
        throw new Error(data.error || "Failed to register. Please try again.");
      }

      onRegistered?.(formData.email);
      setSubmitted(true);
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF9900", "#0073BB", "#00E5FF", "#FFFFFF"],
        });
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-xl bg-navy-900 border border-aws-orange/40 shadow-2xl shadow-aws-orange/15 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-navy-950/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-aws-orange/15 text-aws-orange border border-aws-orange/30">
              <Sparkles className="w-3 h-3" />
              <span>EVENT REGISTRATION</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight mt-1 truncate max-w-sm">
              {event.title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">{alreadyRegistered ? "You are already registered" : "Registration Confirmed!"}</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              {alreadyRegistered ? "This email is already on the list for " : "We have reserved your seat for "}<strong className="text-aws-orange">{event.title}</strong>. A confirmation has been registered for <span className="text-white font-mono">{formData.name} {formData.surname} (UID: {formData.uid})</span>.
            </p>
            <div className="p-3.5 rounded-xl bg-navy-950/80 border border-white/10 text-left text-xs space-y-1.5 font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-aws-orange" />
                <span>{new Date(event.date).toDateString()} • {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formData.academicYear} • {formData.stream}</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <div>
            {isFull && (
              <div className="mx-6 mt-6 p-4 rounded-xl bg-navy-950 border border-slate-600/50 text-center space-y-1.5">
                <div className="inline-flex items-center gap-2 text-slate-300 font-mono text-xs font-bold uppercase tracking-widest">
                  <Lock className="w-4 h-4" />
                  <span>Slots Booked</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every seat for this event has been reserved.
                  Registration is closed.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className={`p-6 transition-all ${isFull ? "grayscale opacity-40 select-none" : ""}`}
            >
            {/* A disabled fieldset disables every control inside it natively,
                so the form is genuinely unusable rather than only looking it. */}
            <fieldset disabled={isFull} className="space-y-4 border-0 p-0 m-0">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                {error}
              </div>
            )}

            {/* Name and Surname Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <User className="w-3 h-3 text-aws-orange" />
                  <span>Name *</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="First name"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <span>Surname *</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  placeholder="Last name"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
                />
              </div>
            </div>

            {/* UID and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-aws-orange" />
                  <span>UID *</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  placeholder="e.g. 238101"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-aws-orange" />
                  <span>Email *</span>
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. name@xaviers.edu"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
                />
              </div>
            </div>

            {/* Academic Year and Stream */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-aws-orange" />
                  <span>Academic Year *</span>
                </label>
                <select
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/15 text-white text-xs focus:outline-none focus:border-aws-orange font-mono cursor-pointer"
                >
                  <option value="FY">FY</option>
                  <option value="SY">SY</option>
                  <option value="TY">TY</option>
                  <option value="PG Part 1">PG Part 1</option>
                  <option value="PG Part 2">PG Part 2</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-aws-orange" />
                  <span>Stream *</span>
                </label>
                <select
                  required
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/15 text-white text-xs focus:outline-none focus:border-aws-orange font-mono cursor-pointer"
                >
                  <option value="BSc">BSc</option>
                  <option value="BSc IT">BSc IT</option>
                  <option value="BSc AI">BSc AI</option>
                  <option value="BCom">BCom</option>
                  <option value="BMS">BMS</option>
                  <option value="BA">BA</option>
                  <option value="BAF">BAF</option>
                  <option value="MSc BDA">MSc BDA</option>
                  <option value="MSc">MSc</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isFull}
              className={`w-full mt-2 py-3 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                isFull
                  ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black shadow-lg shadow-aws-orange/20 cursor-pointer"
              }`}
            >
              {isFull ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Slots Booked</span>
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Securing Seat...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.2]" />
                  <span>Confirm Free RSVP</span>
                </>
              )}
            </button>
            </fieldset>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
