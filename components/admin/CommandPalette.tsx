"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";

export interface Command {
  id: string;
  label: string;
  /** Shown right-aligned: which area this belongs to. */
  group: string;
  /** Extra text that should match a search but is not displayed. */
  keywords?: string;
  run: () => void;
}

interface Props {
  commands: Command[];
}

/**
 * Ctrl/Cmd-K palette.
 *
 * Every tab, every event, and the actions on them, reachable from the keyboard
 * without knowing where they live in the UI. At a check-in desk the fastest
 * path to "attendance for this event" should be typing its name, not finding a
 * row and hitting the right icon.
 */
export function CommandPalette({ commands }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setCursor(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 12);
    return commands
      .filter((c) => `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [commands, query]);

  // The cursor is an index into a list that shrinks as you type; without this
  // it can point past the end and Enter does nothing.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, results.length - 1)));
  }, [results.length]);

  const runAt = (index: number) => {
    const command = results[index];
    if (!command) return;
    setOpen(false);
    command.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(cursor);
    }
  };

  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div
      className="adm-palette-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => setOpen(false)}
    >
      <div className="adm-palette" onClick={(e) => e.stopPropagation()}>
        <div className="adm-palette-field">
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--adm-faint)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump to a tab, an event, an action…"
            className="adm-palette-input"
            aria-label="Search commands"
          />
          <kbd className="adm-kbd">ESC</kbd>
        </div>

        {results.length === 0 ? (
          <div className="adm-empty">Nothing matches “{query}”.</div>
        ) : (
          <ul ref={listRef} className="adm-palette-list adm-scroll">
            {results.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  data-active={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => runAt(i)}
                  className="adm-palette-item"
                >
                  <span className="truncate">{c.label}</span>
                  <span className="adm-palette-group">{c.group}</span>
                  {i === cursor && <CornerDownLeft className="w-3 h-3 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
