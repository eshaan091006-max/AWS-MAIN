"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Shield, Trash2, X } from "lucide-react";
import { TeamMemberData } from "@/lib/data/initialData";
import { ListField } from "./ListField";

const EMPTY = {
  name: "",
  position: "",
  departmentId: "",
  departmentName: "",
  bio: "",
  photoUrl: "",
  linkedin: "",
  github: "",
  email: "",
  isExecutive: false,
  skills: [] as string[],
  order: 0,
};

export function TeamTab() {
  const [items, setItems] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<TeamMemberData | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load the team.");
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

  const openCreate = () => {
    setEditing(null);
    // A new member goes to the end of the list rather than tying with row 0.
    const nextOrder = items.reduce((max, m) => Math.max(max, m.order), 0) + 1;
    setForm({ ...EMPTY, order: nextOrder });
    setCreating(true);
  };

  const openEdit = (item: TeamMemberData) => {
    setCreating(false);
    setEditing(item);
    setForm({
      name: item.name,
      position: item.position,
      departmentId: item.departmentId,
      departmentName: item.departmentName,
      bio: item.bio,
      photoUrl: item.photoUrl,
      linkedin: item.linkedin,
      github: item.github,
      email: item.email,
      isExecutive: item.isExecutive,
      skills: [...item.skills],
      order: item.order,
    });
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save the member.");
      await load();
      close();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: TeamMemberData) => {
    if (!window.confirm(`Remove ${item.name} from the team? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/team?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not remove the member.");
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formOpen = creating || editing !== null;

  return (
    <div className="space-y-6">
      {error && <div className="adm-alert">{error}</div>}

      {formOpen && (
        <form onSubmit={save} className="adm-panel p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="adm-title text-sm">
              {editing ? `Edit: ${editing.name}` : "New team member"}
            </h3>
            <button type="button" onClick={close} className="adm-btn adm-btn-icon" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="adm-label">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="adm-input"
                placeholder="Eshaan Sinha"
              />
            </div>

            <div>
              <label className="adm-label">Position</label>
              <input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="adm-input"
                placeholder="Technicals Coordinator"
              />
            </div>

            <div>
              <label className="adm-label">Department name</label>
              <input
                value={form.departmentName}
                onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                className="adm-input"
                placeholder="Technicals"
              />
            </div>

            <div>
              <label className="adm-label">Department id</label>
              <input
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="adm-input adm-mono"
                placeholder="technicals"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="adm-label">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="adm-textarea"
                style={{ resize: "vertical" }}
                placeholder="A couple of lines about what they do."
              />
            </div>

            <div>
              <label className="adm-label">Photo URL</label>
              <input
                value={form.photoUrl}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                className="adm-input adm-mono"
                placeholder="https://…"
              />
            </div>

            <div>
              <label className="adm-label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="adm-input adm-mono"
                placeholder="name@xaviers.edu.in"
              />
            </div>

            <div>
              <label className="adm-label">LinkedIn URL</label>
              <input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="adm-input adm-mono"
                placeholder="https://linkedin.com/in/…"
              />
            </div>

            <div>
              <label className="adm-label">GitHub URL</label>
              <input
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
                className="adm-input adm-mono"
                placeholder="https://github.com/…"
              />
            </div>

            <div>
              <label className="adm-label">Display order</label>
              <input
                type="number"
                min={0}
                max={9999}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="adm-input adm-mono"
              />
              <p className="adm-hint">Lower numbers appear first.</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={form.isExecutive}
                onChange={(e) => setForm({ ...form, isExecutive: e.target.checked })}
                className="w-4 h-4 accent-aws-orange cursor-pointer"
              />
              <span className="text-xs" style={{ color: "var(--adm-dim)" }}>
                Executive committee
              </span>
            </label>
          </div>

          <ListField
            label="Skills"
            placeholder="AWS Lambda"
            values={form.skills}
            onChange={(skills) => setForm({ ...form, skills })}
            emptyHint="No skills listed yet."
          />

          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="adm-btn adm-btn-primary">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{saving ? "SAVING" : editing ? "SAVE CHANGES" : "ADD MEMBER"}</span>
            </button>
            <button type="button" onClick={close} className="adm-btn">
              CANCEL
            </button>
          </div>
        </form>
      )}

      <section className="adm-panel">
        <div className="adm-panel-head">
          <span className="adm-eyebrow">Leadership · {items.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className="adm-btn adm-btn-icon" title="Reload">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button type="button" onClick={openCreate} className="adm-btn adm-btn-primary">
              <Plus className="w-3.5 h-3.5" />
              <span>ADD MEMBER</span>
            </button>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="adm-empty">Loading team…</div>
        ) : items.length === 0 ? (
          <div className="adm-empty">No team members yet.</div>
        ) : (
          <div className="overflow-x-auto adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Order</th>
                  <th>Exec</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.name}</td>
                    <td style={{ color: "var(--adm-dim)" }}>{item.position || "—"}</td>
                    <td>
                      {item.departmentName ? (
                        <span className="adm-tag">{item.departmentName}</span>
                      ) : (
                        <span style={{ color: "var(--adm-ghost)" }}>—</span>
                      )}
                    </td>
                    <td className="adm-mono adm-num" style={{ color: "var(--adm-dim)" }}>
                      {item.order}
                    </td>
                    <td>
                      {item.isExecutive ? (
                        <Shield className="w-3.5 h-3.5" style={{ color: "var(--adm-accent)" }} />
                      ) : (
                        <span style={{ color: "var(--adm-ghost)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="adm-btn adm-btn-icon"
                          title={`Edit ${item.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="adm-btn adm-btn-icon adm-btn-danger"
                          title={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
