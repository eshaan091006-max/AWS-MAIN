"use client";

import React, { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { EventData } from "@/lib/data/initialData";
import { ListField } from "@/components/admin/ListField";
import { AgendaField } from "@/components/admin/AgendaField";

interface Props {
  /** Null creates a new event; an event edits it in place. */
  event: EventData | null;
  onSaved: () => void;
  onCancel: () => void;
}

const CATEGORIES: EventData["category"][] = ["WORKSHOP", "HACKATHON", "SEMINAR", "BOOTCAMP"];
const STATUSES: EventData["status"][] = ["UPCOMING", "ONGOING", "COMPLETED"];

/** `datetime-local` needs `YYYY-MM-DDTHH:mm` in local time, not an ISO string. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs";

export function EventEditor({ event, onSaved, onCancel }: Props) {
  const isEdit = Boolean(event);

  const [form, setForm] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    fullDetails: event?.fullDetails ?? "",
    date: event?.date ? toLocalInput(event.date) : "",
    time: event?.time ?? "02:00 PM - 05:00 PM IST",
    venue: event?.venue ?? "",
    category: event?.category ?? "WORKSHOP",
    status: event?.status ?? "UPCOMING",
    maxSeats: event?.maxSeats ?? 100,
    isFeatured: event?.isFeatured ?? false,
    imageUrl: event?.imageUrl ?? "",
    bannerUrl: event?.bannerUrl ?? "",
  });

  const [speakerNames, setSpeakerNames] = useState<string[]>(event?.speakerNames ?? []);
  const [prerequisites, setPrerequisites] = useState<string[]>(event?.prerequisites ?? []);
  const [agenda, setAgenda] = useState<EventData["agenda"]>(event?.agenda ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Blank rows are dropped rather than saved: an empty speaker renders as an
    // empty card on the public page.
    const payload = {
      ...(isEdit ? { id: event!.id } : {}),
      title: form.title,
      description: form.description,
      fullDetails: form.fullDetails || form.description,
      date: form.date ? new Date(form.date).toISOString() : undefined,
      time: form.time,
      venue: form.venue,
      category: form.category,
      status: form.status,
      maxSeats: Number(form.maxSeats),
      isFeatured: form.isFeatured,
      imageUrl: form.imageUrl || undefined,
      bannerUrl: form.bannerUrl || undefined,
      speakerNames: speakerNames.map((s) => s.trim()).filter(Boolean),
      prerequisites: prerequisites.map((s) => s.trim()).filter(Boolean),
      agenda: agenda
        .map((a) => ({
          time: a.time.trim(),
          title: a.title.trim(),
          description: a.description.trim(),
        }))
        .filter((a) => a.time || a.title || a.description),
    };

    try {
      const res = await fetch("/api/admin/events", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save the event.");
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-navy-950 border border-aws-orange/40 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">
          {isEdit ? `Edit: ${event!.title}` : "New Event"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close editor"
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-slate-300">Title *</label>
          <input required value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} placeholder="AWS Foundations Event" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-slate-300">Short description *</label>
          <input required value={form.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} placeholder="Shown on the event card" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-slate-300">About this session</label>
          <textarea
            rows={3}
            value={form.fullDetails}
            onChange={(e) => set({ fullDetails: e.target.value })}
            className={`${inputClass} resize-y`}
            placeholder="The longer text on the event page. Defaults to the short description."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Date</label>
          <input type="datetime-local" value={form.date} onChange={(e) => set({ date: e.target.value })} className={`${inputClass} font-mono`} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Time (as displayed)</label>
          <input value={form.time} onChange={(e) => set({ time: e.target.value })} className={`${inputClass} font-mono`} placeholder="02:00 PM - 05:00 PM IST" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-slate-300">Venue *</label>
          <input required value={form.venue} onChange={(e) => set({ venue: e.target.value })} className={inputClass} placeholder="Bonet Lab, St. Xavier's College" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Category</label>
          <select value={form.category} onChange={(e) => set({ category: e.target.value as EventData["category"] })} className={`${inputClass} font-mono cursor-pointer`}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Status</label>
          <select value={form.status} onChange={(e) => set({ status: e.target.value as EventData["status"] })} className={`${inputClass} font-mono cursor-pointer`}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Max seats</label>
          <input type="number" min={1} value={form.maxSeats} onChange={(e) => set({ maxSeats: Number(e.target.value) })} className={`${inputClass} font-mono`} />
          <p className="text-[10px] text-slate-500 font-mono">Enforced by the database, not just here.</p>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input id="isFeatured" type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} className="w-4 h-4 accent-aws-orange cursor-pointer" />
          <label htmlFor="isFeatured" className="text-xs text-slate-300 cursor-pointer">Feature on the homepage</label>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-slate-300">Card image URL</label>
          <input value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} className={`${inputClass} font-mono`} placeholder="https://images.unsplash.com/..." />
          <p className="text-[10px] text-slate-500 font-mono">
            Must be https and from an allowed host (unsplash, githubusercontent, awsstatic, wikimedia).
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-slate-300">Banner image URL</label>
          <input value={form.bannerUrl} onChange={(e) => set({ bannerUrl: e.target.value })} className={`${inputClass} font-mono`} placeholder="https://images.unsplash.com/..." />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-5">
        <AgendaField values={agenda} onChange={setAgenda} />

        <ListField
          label="Keynote Speakers & Facilitators"
          placeholder="Dr. Rajesh Kulkarni (AWS Principal Architect)"
          values={speakerNames}
          onChange={setSpeakerNames}
          emptyHint="No speakers — the section is hidden on the event page."
        />

        <ListField
          label="Prerequisites & Requirements"
          placeholder="Laptop with a modern web browser"
          values={prerequisites}
          onChange={setPrerequisites}
          emptyHint="No prerequisites — the section is hidden on the event page."
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? "Saving..." : isEdit ? "Save changes" : "Create event"}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 border border-white/10 text-slate-300 text-xs font-mono transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
