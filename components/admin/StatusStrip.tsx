"use client";

import React, { useEffect, useState } from "react";

interface Props {
  signedInAs: string | null;
}

/**
 * The readout along the top of the console: a live clock and who is signed in.
 * Both are real values, not invented telemetry.
 */
export function StatusStrip({ signedInAs }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set on mount rather than at render: the server and the browser are in
    // different places and different seconds, and a mismatched first paint is
    // a hydration error.
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = now
    ? now.toLocaleTimeString("en-GB", { hour12: false })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase()
    : "";

  return (
    <div className="adm-status">
      <span className="adm-status-item">
        <span style={{ color: "var(--adm-ghost)" }}>{date}</span>
        <span
          className="adm-num"
          style={{ color: "var(--adm-dim)" }}
          // The clock ticks every second; announcing that would be hostile.
          aria-hidden="true"
        >
          {clock}
        </span>
      </span>

      <span className="adm-status-item hidden lg:flex" style={{ color: "var(--adm-ghost)" }}>
        /
      </span>

      <span className="adm-status-item hidden lg:flex">
        <span style={{ color: "var(--adm-accent)" }}>{signedInAs ?? "—"}</span>
      </span>
    </div>
  );
}
