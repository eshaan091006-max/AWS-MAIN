"use client";

import { useCallback, useEffect, useState } from "react";

export interface SeatCount {
  /** Seats taken. Server-resolved on first paint, refreshed from the API on mount. */
  registered: number;
  /** The limit the database enforces, once known; the build-time value until then. */
  maxSeats: number;
  /** True once the number above came from the database rather than the page bundle. */
  live: boolean;
  /** Every seat is taken. */
  isFull: boolean;
  /** Re-read the count, e.g. after a successful registration. */
  refresh: () => Promise<void>;
}

/**
 * Live seat count for an event.
 *
 * Event pages are statically generated, so the count compiled into the HTML is
 * only as fresh as the last build. This re-reads it from the database on mount
 * so the card, the detail page, and the registration form all agree.
 *
 * `isFull` is derived from whatever count is currently held, including the one
 * the server rendered with. It used to require the fetch to have landed, back
 * when the incoming number was demo filler — but listEvents resolves real
 * counts now, so waiting only produced a flash of "Register Now" on a full
 * event, which is long enough to click.
 *
 * Trusting it is safe in the other direction too: on a database outage the
 * fallback events report 0 taken, so a page can never wrongly claim an event
 * is full.
 */
export function useSeatCount(eventId: string, seedCount: number, seedMaxSeats: number): SeatCount {
  const [registered, setRegistered] = useState(seedCount);
  const [maxSeats, setMaxSeats] = useState(seedMaxSeats);
  const [live, setLive] = useState(false);
  const [full, setFull] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/register?eventId=${encodeURIComponent(eventId)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      // registered === null means the numbers could not be read — keep what is
      // on screen rather than replacing it with a guess.
      if (typeof json?.data?.registered === "number") {
        setRegistered(json.data.registered);
        // The limit is whatever the database will actually enforce, which is
        // not necessarily the number compiled into this page.
        if (typeof json.data.maxSeats === "number") setMaxSeats(json.data.maxSeats);
        setFull(Boolean(json.data.isFull));
        setLive(true);
      }
    } catch {
      // Offline or the API is unreachable; the build-time numbers stand.
    }
  }, [eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Prefer the server's verdict once it arrives — it is the same comparison,
  // but made against the row the database will actually enforce.
  const isFull = live ? full : maxSeats > 0 && registered >= maxSeats;

  return { registered, maxSeats, live, isFull, refresh };
}
