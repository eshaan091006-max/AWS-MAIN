"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { EventData } from "@/lib/data/initialData";

interface Registration {
  id: string;
  fullName: string;
  uid: string;
  email: string;
  academicYear: string;
  stream: string;
  registeredAt: string;
  attended: boolean;
  attendedAt: string | null;
  attendedBy: string | null;
}

interface Props {
  event: EventData;
  onClose: () => void;
}

export function AttendanceChecklist({ event, onClose }: Props) {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Ids currently being written, so a row can show a spinner without locking
  // the whole list — an officer at the door may tick several people quickly.
  const [pending, setPending] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/registrations?eventId=${encodeURIComponent(event.id)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load registrations.");
      setRows(json.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (row: Registration) => {
    const next = !row.attended;

    // Optimistic: the tick has to feel instant with a queue at the door.
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, attended: next } : r)));
    setPending((prev) => new Set(prev).add(row.id));
    setError(null);

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, attended: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save attendance.");

      // Replace with the server's copy so attendedAt/attendedBy are real.
      setRows((prev) => prev.map((r) => (r.id === row.id ? json.data : r)));
    } catch (err: any) {
      // Roll back, or the list would claim someone was marked when they were not.
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, attended: !next } : r)));
      setError(`${row.fullName}: ${err.message}`);
    } finally {
      setPending((prev) => {
        const copy = new Set(prev);
        copy.delete(row.id);
        return copy;
      });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.uid.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const present = rows.filter((r) => r.attended).length;

  return (
    <div className="adm-panel p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="adm-eyebrow" style={{ color: "var(--adm-accent)" }}>
            Attendance
          </div>
          <h3 className="adm-title text-sm truncate">{event.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close attendance list"
          className="adm-btn adm-btn-icon shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="adm-tag adm-tag-ok">
          <Users className="w-3.5 h-3.5" />
          <span>
            {present} / {rows.length} present
          </span>
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, UID or email"
            className="adm-input"
          />
        </div>

        <button
          type="button"
          onClick={load}
          className="adm-btn adm-btn-icon"
          title="Reload the list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>

        <a
          href={`/api/admin/registrations?eventId=${encodeURIComponent(event.id)}&format=csv`}
          className="adm-btn"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV</span>
        </a>
      </div>

      {error && (
        <div role="alert" className="adm-alert">
          {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="py-10 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading registrations…</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-xs font-mono text-slate-400">
          Nobody has registered for this event yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-xs font-mono text-slate-400">
          No registration matches “{query}”.
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-[26rem] overflow-y-auto pr-1">
          {filtered.map((row) => {
            const busy = pending.has(row.id);
            return (
              <li key={row.id}>
                {/* The whole row is the control: a small checkbox is a poor
                    target on a phone at a check-in desk. */}
                <button
                  type="button"
                  onClick={() => toggle(row)}
                  disabled={busy}
                  aria-pressed={row.attended}
                  data-present={row.attended}
                  className="adm-checkrow"
                >
                  <span
                    className="adm-checkbox"
                  >
                    {busy ? (
                      <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-white truncate">
                      {row.fullName}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-400 truncate">
                      {row.uid} · {row.academicYear} {row.stream}
                    </span>
                  </span>

                  {row.attended && row.attendedBy && (
                    <span className="text-[10px] font-mono text-emerald-400/70 shrink-0 hidden sm:block">
                      by {row.attendedBy}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
