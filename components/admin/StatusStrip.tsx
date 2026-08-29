"use client";

import React, { useEffect, useState } from "react";

interface Props {
  /** Null while the first fetch is in flight. */
  dbConnected: boolean | null;
  signedInAs: string | null;
}

/**
 * The readout along the top of the console.
 *
 * Every field is real: a live clock, the actual database reachability, and who
 * is signed in. A status strip that displays invented telemetry is worse than
 * no strip, because it trains you to ignore the one place a genuine problem
 * would appear.
 */
export function StatusStrip({ dbConnected, signedInAs }: Props) {
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
        <span
          className="adm-pulse"
          data-state={dbConnected === false ? "down" : "up"}
          aria-hidden="true"
        />
        <span>
          {dbConnected === null ? "CHECKING" : dbConnected ? "DB LINKED" : "DB DOWN"}
        </span>
      </span>

      <span className="adm-status-item hidden sm:flex" style={{ color: "var(--adm-ghost)" }}>
        /
      </span>

      <span className="adm-status-item hidden sm:flex">
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
