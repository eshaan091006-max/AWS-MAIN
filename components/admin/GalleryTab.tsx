"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Star, Trash2, Upload, X } from "lucide-react";
import { GalleryImageData } from "@/lib/data/initialData";
import { cn } from "@/lib/utils";

const CATEGORIES: GalleryImageData["category"][] = [
  "WORKSHOPS",
  "HACKATHONS",
  "TEAM",
  "EVENTS",
  "COMMUNITY",
];

const EMPTY = {
  title: "",
  description: "",
  category: "EVENTS" as GalleryImageData["category"],
  imageUrl: "",
  date: new Date().toISOString().slice(0, 10),
  featured: false,
};

/** `date` inputs want YYYY-MM-DD, not an ISO timestamp. */
function toDateInput(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function GalleryTab() {
  const [items, setItems] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<GalleryImageData | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /**
   * Sends one file to the upload route and puts the returned URL in the form.
   *
   * The server does the conversion: HEIC comes off an iPhone and no browser
   * except Safari can display it, so it is decoded to JPEG before it is stored
   * rather than after someone notices the gallery is full of broken images.
   */
  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/gallery/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      setForm((prev) => ({ ...prev, imageUrl: json.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load the gallery.");
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
    setForm({ ...EMPTY });
    setCreating(true);
  };

  const openEdit = (item: GalleryImageData) => {
    setCreating(false);
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
      date: toDateInput(item.date),
      featured: item.featured,
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
      const res = await fetch("/api/admin/gallery", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save the entry.");
      await load();
      close();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: GalleryImageData) => {
    if (!window.confirm(`Delete "${item.title}"? It disappears from the public gallery.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not delete the entry.");
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
        <form onSubmit={save} className="adm-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="adm-title text-sm">
              {editing ? `Edit: ${editing.title}` : "New gallery entry"}
            </h3>
            <button type="button" onClick={close} className="adm-btn adm-btn-icon" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="adm-label">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="adm-input"
                placeholder="AWS Cloud Day keynote"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="adm-label">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="adm-textarea"
                style={{ resize: "vertical" }}
                placeholder="Shown under the photo in the lightbox."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="adm-label">Image *</label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) uploadFile(file);
                }}
                className={cn(
                  "flex items-center gap-4 p-4 border border-dashed transition-colors",
                  dragging ? "border-aws-orange bg-aws-orange/5" : "border-white/15"
                )}
              >
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="w-20 h-20 object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center border border-white/10 text-zinc-600">
                    <Upload className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="adm-btn"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{uploading ? "UPLOADING" : form.imageUrl ? "REPLACE" : "CHOOSE FILE"}</span>
                  </button>
                  <p className="adm-hint">
                    JPG, PNG or HEIC, up to 10MB. Drag one here too. HEIC is converted to
                    JPEG so every browser can show it.
                  </p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                    // Cleared so choosing the same file twice still fires change.
                    e.target.value = "";
                  }}
                />
              </div>

              <input
                required
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="adm-input adm-mono mt-2"
                placeholder="https://… or upload above"
              />
            </div>

            <div>
              <label className="adm-label">Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as GalleryImageData["category"] })
                }
                className="adm-select adm-mono"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="adm-label">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="adm-input adm-mono"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-aws-orange cursor-pointer"
              />
              <span className="text-xs" style={{ color: "var(--adm-dim)" }}>
                Feature this photo
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="adm-btn adm-btn-primary">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{saving ? "SAVING" : editing ? "SAVE CHANGES" : "ADD ENTRY"}</span>
            </button>
            <button type="button" onClick={close} className="adm-btn">
              CANCEL
            </button>
          </div>
        </form>
      )}

      <section className="adm-panel">
        <div className="adm-panel-head">
          <span className="adm-eyebrow">Gallery · {items.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className="adm-btn adm-btn-icon" title="Reload">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button type="button" onClick={openCreate} className="adm-btn adm-btn-primary">
              <Plus className="w-3.5 h-3.5" />
              <span>ADD PHOTO</span>
            </button>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="adm-empty">Loading gallery…</div>
        ) : items.length === 0 ? (
          <div className="adm-empty">No photos yet.</div>
        ) : (
          <div className="overflow-x-auto adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Featured</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.title}</td>
                    <td>
                      <span className="adm-tag">{item.category}</span>
                    </td>
                    <td className="adm-mono adm-num" style={{ color: "var(--adm-dim)" }}>
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </td>
                    <td>
                      {item.featured ? (
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
