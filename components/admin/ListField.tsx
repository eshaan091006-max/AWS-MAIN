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
        <label className="text-xs font-medium text-slate-300">{label}</label>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {values.length === 0 && emptyHint && (
        <p className="text-[11px] text-slate-500 font-mono">{emptyHint}</p>
      )}

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => setAt(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Remove ${label} entry ${index + 1}`}
              className="p-2 rounded-xl bg-navy-950 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
