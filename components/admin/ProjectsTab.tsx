"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Star, Trash2, X } from "lucide-react";
import { ProjectData } from "@/lib/data/initialData";
import { ListField } from "./ListField";

type Member = ProjectData["members"][number];

const EMPTY = {
  title: "",
  slug: "",
  shortDesc: "",
  problem: "",
  solution: "",
  technologies: [] as string[],
  awsServices: [] as string[],
  imageUrl: "",
  githubUrl: "",
  liveDemoUrl: "",
  isFeatured: false,
  members: [] as Member[],
};

export function ProjectsTab() {
  const [items, setItems] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProjectData | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  // False when the API served seed rows because the table is missing.
  const [live, setLive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load projects.");
      setItems(json.data ?? []);
      setLive(json.live !== false);
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
    setForm({ ...EMPTY });
    setCreating(true);
  };

  const openEdit = (item: ProjectData) => {
    setCreating(false);
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      shortDesc: item.shortDesc,
      problem: item.problem,
      solution: item.solution,
      technologies: [...item.technologies],
      awsServices: [...item.awsServices],
      imageUrl: item.imageUrl,
      githubUrl: item.githubUrl,
      liveDemoUrl: item.liveDemoUrl,
      isFeatured: item.isFeatured,
      members: item.members.map((m) => ({ ...m })),
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
      const res = await fetch("/api/admin/projects", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save the project.");
      await load();
      close();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ProjectData) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not delete the project.");
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const setMember = (index: number, patch: Partial<Member>) => {
    const next = [...form.members];
    next[index] = { ...next[index], ...patch };
    setForm({ ...form, members: next });
  };

  const formOpen = creating || editing !== null;

  return (
    <div className="space-y-6">
      {error && <div className="adm-alert">{error}</div>}

      {!live && (
        <div className="adm-notice">
          <strong>Sample data — nothing here is saved yet.</strong> The{" "}
          <span className="adm-mono">projects</span> table does not exist in Supabase,
          so these rows come from the built-in seed and every add, edit and delete
          will fail. Run <span className="adm-mono">supabase/schema.sql</span> in the
          Supabase SQL Editor, then reload.
        </div>
      )}

      {formOpen && (
        <form onSubmit={save} className="adm-panel p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="adm-title text-sm">
              {editing ? `Edit: ${editing.title}` : "New project"}
            </h3>
            <button type="button" onClick={close} className="adm-btn adm-btn-icon" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="adm-label">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="adm-input"
                placeholder="Campus Energy Monitor"
              />
            </div>

            <div>
              <label className="adm-label">URL slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="adm-input adm-mono"
                placeholder="campus-energy-monitor"
              />
              <p className="adm-hint">Leave blank to build one from the title.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="adm-label">Short description</label>
              <textarea
                rows={2}
                value={form.shortDesc}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                className="adm-textarea"
                style={{ resize: "vertical" }}
                placeholder="One line, shown on the project card."
              />
            </div>

            <div>
              <label className="adm-label">Problem</label>
              <textarea
                rows={4}
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
                className="adm-textarea"
                style={{ resize: "vertical" }}
                placeholder="What was broken before this existed?"
              />
            </div>

            <div>
              <label className="adm-label">Solution</label>
              <textarea
                rows={4}
                value={form.solution}
                onChange={(e) => setForm({ ...form, solution: e.target.value })}
                className="adm-textarea"
                style={{ resize: "vertical" }}
                placeholder="How the team solved it."
              />
            </div>

            <div>
              <label className="adm-label">Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="adm-input adm-mono"
                placeholder="https://…"
              />
            </div>

            <div>
              <label className="adm-label">GitHub URL</label>
              <input
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                className="adm-input adm-mono"
                placeholder="https://github.com/…"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="adm-label">Live demo URL</label>
              <input
                value={form.liveDemoUrl}
                onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
                className="adm-input adm-mono"
                placeholder="https://…"
              />
              <p className="adm-hint">All three links are optional; https only.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ListField
              label="Technologies"
              placeholder="Next.js"
              values={form.technologies}
              onChange={(technologies) => setForm({ ...form, technologies })}
              emptyHint="No technologies listed yet."
            />
            <ListField
              label="AWS services"
              placeholder="Amazon S3"
              values={form.awsServices}
              onChange={(awsServices) => setForm({ ...form, awsServices })}
              emptyHint="No AWS services listed yet."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="adm-label">Team credits</label>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    members: [...form.members, { name: "", role: "", avatarUrl: "" }],
                  })
                }
                className="adm-btn"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {form.members.length === 0 && (
              <p className="adm-hint">Nobody credited yet.</p>
            )}

            <div className="space-y-2">
              {form.members.map((member, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={member.name}
                    onChange={(e) => setMember(index, { name: e.target.value })}
                    placeholder="Name"
                    className="adm-input flex-1"
                  />
                  <input
                    value={member.role}
                    onChange={(e) => setMember(index, { role: e.target.value })}
                    placeholder="Role"
                    className="adm-input flex-1"
                  />
                  <input
                    value={member.avatarUrl}
                    onChange={(e) => setMember(index, { avatarUrl: e.target.value })}
                    placeholder="https://avatar…"
                    className="adm-input adm-mono flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, members: form.members.filter((_, i) => i !== index) })
                    }
                    aria-label={`Remove credit ${index + 1}`}
                    className="adm-btn adm-btn-icon adm-btn-danger"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="adm-hint">Rows with no name are dropped when you save.</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4 accent-aws-orange cursor-pointer"
            />
            <span className="text-xs" style={{ color: "var(--adm-dim)" }}>
              Feature this project
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="adm-btn adm-btn-primary">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{saving ? "SAVING" : editing ? "SAVE CHANGES" : "ADD PROJECT"}</span>
            </button>
            <button type="button" onClick={close} className="adm-btn">
              CANCEL
            </button>
          </div>
        </form>
      )}

      <section className="adm-panel">
        <div className="adm-panel-head">
          <span className="adm-eyebrow">Projects · {items.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className="adm-btn adm-btn-icon" title="Reload">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button type="button" onClick={openCreate} className="adm-btn adm-btn-primary">
              <Plus className="w-3.5 h-3.5" />
              <span>ADD PROJECT</span>
            </button>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="adm-empty">Loading projects…</div>
        ) : items.length === 0 ? (
          <div className="adm-empty">No projects yet.</div>
        ) : (
          <div className="overflow-x-auto adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Stack</th>
                  <th>Team</th>
                  <th>Featured</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.title}</td>
                    <td className="adm-mono" style={{ color: "var(--adm-dim)" }}>
                      {item.slug}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {item.technologies.slice(0, 3).map((t) => (
                          <span key={t} className="adm-tag">
                            {t}
                          </span>
                        ))}
                        {item.technologies.length > 3 && (
                          <span className="adm-tag">+{item.technologies.length - 3}</span>
                        )}
                        {item.technologies.length === 0 && (
                          <span style={{ color: "var(--adm-ghost)" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="adm-mono adm-num" style={{ color: "var(--adm-dim)" }}>
                      {item.members.length}
                    </td>
                    <td>
                      {item.isFeatured ? (
                        <Star
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--adm-accent)", fill: "var(--adm-accent)" }}
                        />
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
                          title={`Edit ${item.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="adm-btn adm-btn-icon adm-btn-danger"
                          title={`Delete ${item.title}`}
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
