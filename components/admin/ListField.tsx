"use client";

import React from "react";
import { Plus, X } from "lucide-react";

interface Props {
  label: string;
  /** Placeholder for a new row, e.g. "Dr. Rajesh Kulkarni (AWS Architect)". */
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  /** Shown when the list is empty, so an empty section is not mistaken for a bug. */
  emptyHint?: string;
}

/**
 * Editor for a list of plain strings — speakers, prerequisites.
 *
 * Rows are edited in place rather than through an "add" input, so correcting a
 * typo does not mean deleting and retyping the whole entry.
 */
export function ListField({ label, placeholder, values, onChange, emptyHint }: Props) {
  const setAt = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const removeAt = (index: number) => onChange(values.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="adm-label">{label}</label>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="adm-btn"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {values.length === 0 && emptyHint && (
        <p className="adm-hint">{emptyHint}</p>
      )}

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => setAt(index, e.target.value)}
              placeholder={placeholder}
              className="adm-input flex-1"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Remove ${label} entry ${index + 1}`}
              className="adm-btn adm-btn-icon adm-btn-danger"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
