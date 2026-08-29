"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, SparklesIcon } from "lucide-react";

const KEY = "sxc-admin-motion";

/**
 * Lets this console override the OS reduced-motion setting, both ways.
 *
 * The default always follows the system — that is the accessible behaviour and
 * it stays the default. But someone who has reduced motion on system-wide may
 * still want the console's motion, and without this the only route is changing
 * an OS preference, which is a heavy thing to ask.
 *
 * The choice is per-browser and remembered.
 */
export function MotionToggle() {
  const [forced, setForced] = useState<boolean | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(KEY);
    } catch {
      // Private mode or blocked storage: fall back to the system setting.
    }
    const value = stored === "on" ? true : stored === "off" ? false : null;
    setForced(value);
    applyClass(value);
  }, []);

  const applyClass = (value: boolean | null) => {
    const root = document.documentElement;
    root.classList.toggle("adm-motion-on", value === true);
    root.classList.toggle("adm-motion-off", value === false);
  };

  const cycle = () => {
    // system -> on -> off -> system
    const next = forced === null ? true : forced === true ? false : null;
    setForced(next);
    applyClass(next);
    try {
      if (next === null) window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      // Not being able to remember it is not a reason to refuse the change.
    }
  };

  const label =
    forced === null ? "MOTION: SYSTEM" : forced ? "MOTION: ON" : "MOTION: OFF";

  return (
    <button
      type="button"
      onClick={cycle}
      className="adm-btn adm-btn-icon"
      title={`${label} — click to change`}
      aria-label={label}
    >
      {forced === false ? (
        <SparklesIcon className="w-3.5 h-3.5" style={{ opacity: 0.4 }} />
      ) : (
        <Sparkles
          className="w-3.5 h-3.5"
          style={{ color: forced ? "var(--adm-accent)" : undefined }}
        />
      )}
    </button>
  );
}
