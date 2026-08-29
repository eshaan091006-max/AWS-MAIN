"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, UserPlus, Info } from "lucide-react";
import { EventData } from "@/lib/data/initialData";

interface Props {
  events: EventData[];
}

interface RosterRow {
  id: string;
  fullName: string;
  uid: string;
  attended: boolean;
}

interface Roster {
  total: number;
  present: number;
  latest: RosterRow[];
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
  // Only offered once the server has actually refused for capacity, so it is
  // a considered decision rather than a checkbox someone leaves ticked.
  const [canOverride, setCanOverride] = useState(false);
  const [allowOverCapacity, setAllowOverCapacity] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Read back from the server rather than kept in component state. An earlier
  // version logged each save into local state labelled "this session", which
  // emptied on refresh and read as though the registrations had been lost.
  // What the desk needs to see is what is actually stored.
  const [roster, setRoster] = useState<Roster | null>(null);

  const selected = upcoming.find((e) => e.id === eventId) ?? null;
  const atCapacity = Boolean(roster && selected && roster.total >= selected.maxSeats);

  const loadRoster = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/registrations?eventId=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      setRoster({
        total: json.summary?.total ?? 0,
        present: json.summary?.present ?? 0,
        latest: (json.data ?? []).slice(-6).reverse(),
      });
    } catch {
      // A missing roster must not block taking a registration.
    }
  }, []);

  useEffect(() => {
    if (!eventId && upcoming.length > 0) setEventId(upcoming[0].id);
  }, [upcoming, eventId]);

  useEffect(() => {
    setRoster(null);
    loadRoster(eventId);
  }, [eventId, loadRoster]);

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

      await loadRoster(eventId);

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
        {/* Capacity is shown before the officer types, not discovered after a
            failed submit. This event sitting over its limit is exactly why
            walk-ins were silently refused. */}
        {roster && selected && (
          <div className="adm-panel p-4">
            <div className="adm-eyebrow">Registered</div>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className="adm-num font-display font-extrabold leading-none"
                style={{
                  fontSize: 30,
                  color: atCapacity ? "var(--adm-warn)" : "var(--adm-text)",
                }}
              >
                {roster.total}
              </span>
              <span className="adm-mono text-xs" style={{ color: "var(--adm-faint)" }}>
                / {selected.maxSeats}
              </span>
              <span className="adm-tag adm-tag-ok ml-auto">
                {roster.present} present
              </span>
            </div>
            {atCapacity && (
              <p className="adm-hint" style={{ color: "var(--adm-warn)" }}>
                At capacity. Registering anyone else needs the override, which
                appears once you submit.
              </p>
            )}
          </div>
        )}

        <div className="adm-notice flex gap-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--adm-accent)" }} />
          <p className="leading-relaxed">
            Someone who already registered online is not added twice — they are
            marked present instead.
          </p>
        </div>

        <div className="adm-panel p-4">
          <h3 className="adm-eyebrow mb-3">Latest registrations</h3>
          {!roster ? (
            <p className="adm-hint">Loading…</p>
          ) : roster.latest.length === 0 ? (
            <p className="adm-hint">Nobody has registered for this event yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {roster.latest.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-2 text-[11px] p-2"
                  style={{ background: "var(--adm-raised)", border: "1px solid var(--adm-line)" }}
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: r.attended ? "var(--adm-ok)" : "var(--adm-ghost)" }}
                  />
                  <span className="font-semibold truncate">{r.fullName}</span>
                  <span className="ml-auto adm-mono text-[10px] shrink-0" style={{ color: "var(--adm-faint)" }}>
                    {r.uid}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="adm-hint">
            Read from the database, so this survives a refresh.
          </p>
        </div>
      </div>
    </div>
  );
}
