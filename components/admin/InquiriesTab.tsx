"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen, RefreshCw, Trash2 } from "lucide-react";
import { ContactMessageData } from "@/lib/data/initialData";

export function InquiriesTab() {
  const [items, setItems] = useState<ContactMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load messages.");
      setItems(json.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (item: ContactMessageData) => {
    setBusy(item.id);
    setError(null);
    // Optimistic: the flag is a reading aid, and reverting on failure is
    // cheaper than making someone wait on a round trip to mark a note read.
    const previous = item.isRead;
    setItems((rows) =>
      rows.map((r) => (r.id === item.id ? { ...r, isRead: !previous } : r))
    );
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isRead: !previous }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not update the message.");
    } catch (err: any) {
      setItems((rows) =>
        rows.map((r) => (r.id === item.id ? { ...r, isRead: previous } : r))
      );
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: ContactMessageData) => {
    if (
      !window.confirm(
        `Delete the message from ${item.name}? This removes it from the database permanently.`
      )
    ) {
      return;
    }
    setBusy(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not delete the message.");
      setItems((rows) => rows.filter((r) => r.id !== item.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const unread = items.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {error && <div className="adm-alert">{error}</div>}

      <section className="adm-panel">
        <div className="adm-panel-head">
          <span className="adm-eyebrow">
            Contact form · {items.length}
            {unread > 0 ? ` · ${unread} unread` : ""}
          </span>
          <button type="button" onClick={load} className="adm-btn adm-btn-icon" title="Reload">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="adm-panel-body space-y-3">
          {loading && items.length === 0 ? (
            <div className="adm-empty">Loading messages…</div>
          ) : items.length === 0 ? (
            <div className="adm-empty">No messages yet.</div>
          ) : (
            items.map((m) => (
              <article
                key={m.id}
                className="p-4"
                style={{
                  background: "var(--adm-raised)",
                  border: "1px solid var(--adm-line)",
                  borderLeft: m.isRead
                    ? "3px solid var(--adm-line)"
                    : "3px solid var(--adm-accent)",
                  opacity: busy === m.id ? 0.55 : 1,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-sm">{m.name}</span>
                      <a
                        href={`mailto:${m.email}`}
                        className="adm-mono text-[11px] underline"
                        style={{ color: "var(--adm-faint)" }}
                      >
                        {m.email}
                      </a>
                      {!m.isRead && <span className="adm-tag adm-tag-accent">New</span>}
                    </div>
                    <div
                      className="adm-mono text-[11px] mt-2"
                      style={{ color: "var(--adm-dim)" }}
                    >
                      {m.subject}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="adm-mono text-[11px] mr-1"
                      style={{ color: "var(--adm-ghost)" }}
                    >
                      {new Date(m.createdAt).toLocaleDateString("en-GB")}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleRead(m)}
                      disabled={busy === m.id}
                      className="adm-btn adm-btn-icon"
                      title={m.isRead ? `Mark unread` : `Mark read`}
                    >
                      {m.isRead ? (
                        <MailOpen className="w-3.5 h-3.5" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      disabled={busy === m.id}
                      className="adm-btn adm-btn-icon adm-btn-danger"
                      title={`Delete the message from ${m.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--adm-dim)" }}>
                  {m.message}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
