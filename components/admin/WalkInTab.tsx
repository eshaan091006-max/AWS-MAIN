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
      <div className="adm-panel adm-empty">
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
        className="adm-panel lg:col-span-3 p-6 space-y-4"
      >
        <div>
          <h2 className="adm-title">On-the-spot Registration</h2>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Registers the person and marks them present in one step.
          </p>
        </div>

        {error && (
          <div role="alert" className="adm-alert">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="adm-label">Event</label>
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setCanOverride(false);
              setAllowOverCapacity(false);
              setError(null);
            }}
            className="adm-select adm-mono"
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
            <label className="adm-label">Name *</label>
            <input
              ref={firstFieldRef}
              required
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              placeholder="First name"
              className="adm-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="adm-label">Surname</label>
            <input
              value={form.surname}
              onChange={(e) => set({ surname: e.target.value })}
              placeholder="Last name"
              className="adm-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="adm-label">UID *</label>
            <input
              required
              value={form.uid}
              onChange={(e) => set({ uid: e.target.value })}
              placeholder="e.g. 2609034"
              className="adm-input adm-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="adm-label">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="name@xaviers.edu"
              className="adm-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="adm-label">Academic Year</label>
            <select
              value={form.academicYear}
              onChange={(e) => set({ academicYear: e.target.value })}
              className="adm-select adm-mono"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="adm-label">Stream</label>
            <select
              value={form.stream}
              onChange={(e) => set({ stream: e.target.value })}
              className="adm-select adm-mono"
            >
              {STREAMS.map((st) => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        {canOverride && (
          <label className="adm-warnbox flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allowOverCapacity}
              onChange={(e) => setAllowOverCapacity(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-amber-500 cursor-pointer shrink-0"
            />
            <span className="leading-relaxed">
              This event is at capacity. Tick to admit this person anyway — it
              applies to this one registration only.
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={saving}
          className="adm-btn adm-btn-primary w-full"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          <span>{saving ? "Saving..." : "Register & mark present"}</span>
        </button>
      </form>

      <div className="lg:col-span-2 space-y-3">
        <div className="adm-notice flex gap-3">
          <Info className="w-4 h-4 text-aws-orange shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            If this email already registered online, they are not added twice — they
            are simply marked present. Seat limits still apply.
          </p>
        </div>

        <div className="adm-panel p-4">
          <h3 className="adm-eyebrow mb-3">
            This session
          </h3>
          {recent.length === 0 ? (
            <p className="text-[11px] font-mono text-slate-500">Nobody checked in yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {recent.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-[11px] p-2" style={{ background: "var(--adm-raised)", border: "1px solid var(--adm-line)" }}
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
