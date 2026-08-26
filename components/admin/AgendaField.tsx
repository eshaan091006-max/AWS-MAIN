"use client";

import React from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { EventData } from "@/lib/data/initialData";

type AgendaItem = EventData["agenda"][number];

interface Props {
  values: AgendaItem[];
  onChange: (values: AgendaItem[]) => void;
}

const EMPTY: AgendaItem = { time: "", title: "", description: "" };

/**
 * Editor for the session agenda.
 *
 * Each row is three fields rather than one, because the public event page
 * renders time, title and description in distinct positions — flattening them
 * into a single string here would push the parsing problem onto the page.
 */
export function AgendaField({ values, onChange }: Props) {
  const setAt = (index: number, patch: Partial<AgendaItem>) => {
    const next = [...values];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeAt = (index: number) => onChange(values.filter((_, i) => i !== index));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300">Session Agenda</label>
        <button
          type="button"
          onClick={() => onChange([...values, { ...EMPTY }])}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add item</span>
        </button>
      </div>

      {values.length === 0 && (
        <p className="text-[11px] text-slate-500 font-mono">
          No agenda items — the section is hidden on the event page.
        </p>
      )}

      <div className="space-y-2">
        {values.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-navy-950 border border-white/10 space-y-2"
          >
            <div className="flex items-center gap-2">
              <input
                value={item.time}
                onChange={(e) => setAt(index, { time: e.target.value })}
                placeholder="09:30 AM"
                className="w-28 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs font-mono"
              />
              <input
                value={item.title}
                onChange={(e) => setAt(index, { title: e.target.value })}
                placeholder="Registration & Welcome Keynote"
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
              />
              {/* Order is what the page renders, so it has to be editable. */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move item up"
                  className="px-1 text-slate-500 hover:text-white disabled:opacity-30 text-[10px] leading-none"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === values.length - 1}
                  aria-label="Move item down"
                  className="px-1 text-slate-500 hover:text-white disabled:opacity-30 text-[10px] leading-none"
                >
                  ▼
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove agenda item ${index + 1}`}
                className="p-1.5 rounded-lg bg-navy-900 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              value={item.description}
              onChange={(e) => setAt(index, { description: e.target.value })}
              placeholder="What happens in this slot"
              className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
