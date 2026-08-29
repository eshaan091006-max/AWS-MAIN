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
    eccPoints: event?.eccPoints ?? 0,
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
      eccPoints: Number(form.eccPoints),
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
      className="adm-panel p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="adm-title text-sm">
          {isEdit ? `Edit: ${event!.title}` : "New Event"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close editor"
          className="adm-btn adm-btn-icon"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div role="alert" className="adm-alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="adm-label">Title *</label>
          <input required value={form.title} onChange={(e) => set({ title: e.target.value })} className="adm-input" placeholder="AWS Foundations Event" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="adm-label">Short description *</label>
          <input required value={form.description} onChange={(e) => set({ description: e.target.value })} className="adm-input" placeholder="Shown on the event card" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="adm-label">About this session</label>
          <textarea
            rows={3}
            value={form.fullDetails}
            onChange={(e) => set({ fullDetails: e.target.value })}
            className="adm-textarea" style={{ resize: "vertical" }}
            placeholder="The longer text on the event page. Defaults to the short description."
          />
        </div>

        <div className="space-y-1.5">
          <label className="adm-label">Date</label>
          <input type="datetime-local" value={form.date} onChange={(e) => set({ date: e.target.value })} className="adm-input adm-mono" />
        </div>

        <div className="space-y-1.5">
          <label className="adm-label">Time (as displayed)</label>
          <input value={form.time} onChange={(e) => set({ time: e.target.value })} className="adm-input adm-mono" placeholder="02:00 PM - 05:00 PM IST" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="adm-label">Venue *</label>
          <input required value={form.venue} onChange={(e) => set({ venue: e.target.value })} className="adm-input" placeholder="Bonet Lab, St. Xavier's College" />
        </div>

        <div className="space-y-1.5">
          <label className="adm-label">Category</label>
          <select value={form.category} onChange={(e) => set({ category: e.target.value as EventData["category"] })} className="adm-select adm-mono">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="adm-label">Status</label>
          <select value={form.status} onChange={(e) => set({ status: e.target.value as EventData["status"] })} className="adm-select adm-mono">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="adm-label">Max seats</label>
          <input type="number" min={1} value={form.maxSeats} onChange={(e) => set({ maxSeats: Number(e.target.value) })} className="adm-input adm-mono" />
          <p className="adm-hint">Enforced by the database, not just here.</p>
        </div>

        <div className="space-y-1.5">
          <label className="adm-label">ECC awarded</label>
          <input
            type="number"
            min={0}
            value={form.eccPoints}
            onChange={(e) => set({ eccPoints: Number(e.target.value) })}
            className="adm-input adm-mono"
          />
          <p className="adm-hint">
            Extra Co-curricular Credits. 0 hides the badge on the event card.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input id="isFeatured" type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} className="w-4 h-4 accent-aws-orange cursor-pointer" />
          <label htmlFor="isFeatured" className="text-xs text-slate-300 cursor-pointer">Feature on the homepage</label>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="adm-label">Card image URL</label>
          <input value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} className="adm-input adm-mono" placeholder="https://images.unsplash.com/..." />
          <p className="adm-hint">
            Any https image URL. Leave blank to use the default artwork.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="adm-label">Banner image URL</label>
          <input value={form.bannerUrl} onChange={(e) => set({ bannerUrl: e.target.value })} className="adm-input adm-mono" placeholder="https://images.unsplash.com/..." />
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
          className="adm-btn adm-btn-primary"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? "Saving..." : isEdit ? "Save changes" : "Create event"}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="adm-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
