"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Loader2, Pencil, Trash2, X } from "lucide-react";

export interface RosterRow {
  id: string;
  fullName: string;
  uid: string;
  email: string;
  academicYear: string;
  stream: string;
  attended: boolean;
}

interface Props {
  row: RosterRow;
  onSaved: () => void;
  onError: (message: string) => void;
}

/**
 * One registration in the desk roster, with in-place correction.
 *
 * Editing happens in the row rather than a modal: at a check-in desk the
 * person whose name is wrong is standing there, and a dialog that hides the
 * rest of the list makes it harder to see whether you picked the right row.
 */
export function RegistrationRow({ row, onSaved, onError }: Props) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  // The name is stored split, but shown joined; editing the two halves
  // separately is what keeps first and last in their own columns.
  const [first, ...restOfName] = row.fullName.split(" ");
  const [form, setForm] = useState({
    firstName: first ?? "",
    surname: restOfName.join(" "),
    uid: row.uid,
    email: row.email,
  });

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save the change.");
      setEditing(false);
      onSaved();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    // Names the person, because "are you sure?" on a list of 122 rows is not
    // a question anyone can answer confidently.
    if (!window.confirm(`Delete the registration for ${row.fullName} (${row.uid})? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/registrations?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not delete the registration.");
      onSaved();
    } catch (err: any) {
      onError(err.message);
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li
        className="p-2.5 space-y-2"
        style={{ background: "var(--adm-raised)", border: "1px solid var(--adm-accent)" }}
      >
        <div className="grid grid-cols-2 gap-1.5">
          <input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="First name"
            className="adm-input"
            aria-label="First name"
          />
          <input
            value={form.surname}
            onChange={(e) => setForm({ ...form, surname: e.target.value })}
            placeholder="Surname"
            className="adm-input"
            aria-label="Surname"
          />
        </div>
        <input
          value={form.uid}
          onChange={(e) => setForm({ ...form, uid: e.target.value })}
          placeholder="UID"
          className="adm-input adm-mono"
          aria-label="UID"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="adm-input"
          aria-label="Email"
        />
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={save} disabled={busy} className="adm-btn adm-btn-primary flex-1">
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            <span>SAVE</span>
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={busy}
            className="adm-btn"
          >
            CANCEL
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className="flex items-center gap-2 p-2 text-[11px]"
      style={{ background: "var(--adm-raised)", border: "1px solid var(--adm-line)" }}
    >
      <CheckCircle2
        className="w-3.5 h-3.5 shrink-0"
        style={{ color: row.attended ? "var(--adm-ok)" : "var(--adm-ghost)" }}
      />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold truncate">{row.fullName}</span>
        <span className="block adm-mono text-[10px] truncate" style={{ color: "var(--adm-faint)" }}>
          {row.uid}
        </span>
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={busy}
        className="adm-btn adm-btn-icon shrink-0"
        title={`Edit ${row.fullName}`}
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="adm-btn adm-btn-icon adm-btn-danger shrink-0"
        title={`Delete ${row.fullName}`}
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
      </button>
    </li>
  );
}
