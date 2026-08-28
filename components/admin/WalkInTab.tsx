"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, UserPlus, Info } from "lucide-react";
import { EventData } from "@/lib/data/initialData";

interface Props {
  events: EventData[];
}

interface Result {
  name: string;
  alreadyRegistered: boolean;
}

const YEARS = ["FY", "SY", "TY", "PG Part 1", "PG Part 2"];
const STREAMS = ["BSc", "BSc IT", "BSc AI", "BCom", "BMS", "BA", "BAF", "MSc BDA", "MSc"];

const EMPTY = {
  firstName: "",
  surname: "",
  uid: "",
  email: "",
  academicYear: "FY",
  stream: "BSc IT",
};

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs";

/**
 * Registering someone at the door.
 *
 * Optimised for repetition: after each save the form clears and returns focus
 * to the first field, and the chosen event stays selected, so an officer can
 * work through a queue without touching the mouse.
 */
export function WalkInTab({ events }: Props) {
  const upcoming = useMemo(
    () => events.filter((e) => e.status !== "COMPLETED"),
    [events]
  );

  const [eventId, setEventId] = useState("");
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Result[]>([]);
  // Only offered once the server has actually refused for capacity, so it is
  // a considered decision rather than a checkbox someone leaves ticked.
  const [canOverride, setCanOverride] = useState(false);
  const [allowOverCapacity, setAllowOverCapacity] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!eventId && upcoming.length > 0) setEventId(upcoming[0].id);
  }, [upcoming, eventId]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, ...form, allowOverCapacity }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.canOverride) setCanOverride(true);
        throw new Error(json.error || "Could not register.");
      }

      const name = `${form.firstName} ${form.surname}`.trim();
      // Newest first, capped — this is a working log for the current session,
      // not a record. The attendance list is the record.
      setRecent((prev) => [{ name, alreadyRegistered: json.alreadyRegistered }, ...prev].slice(0, 8));

      setForm({ ...EMPTY, academicYear: form.academicYear, stream: form.stream });
      // Reset the override every time: admitting one extra person must not
      // silently admit everyone after them.
      setCanOverride(false);
      setAllowOverCapacity(false);
      firstFieldRef.current?.focus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (upcoming.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-navy-900/80 border border-white/10 text-center">
        <p className="text-xs font-mono text-slate-400">
          No upcoming events. Create one in the Events tab before taking walk-ins.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-3 p-6 rounded-2xl bg-navy-900/80 border border-aws-orange/30 space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-white">On-the-spot Registration</h2>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Registers the person and marks them present in one step.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Event</label>
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setCanOverride(false);
              setAllowOverCapacity(false);
              setError(null);
            }}
            className={`${inputClass} font-mono cursor-pointer`}
          >
            {upcoming.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Name *</label>
            <input
              ref={firstFieldRef}
              required
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              placeholder="First name"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Surname</label>
            <input
              value={form.surname}
              onChange={(e) => set({ surname: e.target.value })}
              placeholder="Last name"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">UID *</label>
            <input
              required
              value={form.uid}
              onChange={(e) => set({ uid: e.target.value })}
              placeholder="e.g. 2609034"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="name@xaviers.edu"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Academic Year</label>
            <select
              value={form.academicYear}
              onChange={(e) => set({ academicYear: e.target.value })}
              className={`${inputClass} font-mono cursor-pointer`}
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Stream</label>
            <select
              value={form.stream}
              onChange={(e) => set({ stream: e.target.value })}
              className={`${inputClass} font-mono cursor-pointer`}
            >
              {STREAMS.map((st) => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        {canOverride && (
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 cursor-pointer">
            <input
              type="checkbox"
              checked={allowOverCapacity}
              onChange={(e) => setAllowOverCapacity(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-amber-500 cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-amber-200 leading-relaxed">
              This event is at capacity. Tick to admit this person anyway — it
              applies to this one registration only.
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          <span>{saving ? "Saving..." : "Register & mark present"}</span>
        </button>
      </form>

      <div className="lg:col-span-2 space-y-3">
        <div className="p-4 rounded-2xl bg-navy-950/80 border border-white/10 flex gap-3">
          <Info className="w-4 h-4 text-aws-orange shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            If this email already registered online, they are not added twice — they
            are simply marked present. Seat limits still apply.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900/80 border border-white/10">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-3">
            This session
          </h3>
          {recent.length === 0 ? (
            <p className="text-[11px] font-mono text-slate-500">Nobody checked in yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {recent.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-[11px] p-2 rounded-lg bg-navy-950/70 border border-white/5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-white font-semibold truncate">{r.name}</span>
                  <span className="ml-auto text-[10px] font-mono text-slate-500 shrink-0">
                    {r.alreadyRegistered ? "was registered" : "new"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
