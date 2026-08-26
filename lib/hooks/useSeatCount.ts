"use client";

import { useCallback, useEffect, useState } from "react";

export interface SeatCount {
  /** Seats taken. Starts at the build-time number, replaced once the live count arrives. */
  registered: number;
  /** The limit the database enforces, once known; the build-time value until then. */
  maxSeats: number;
  /** True once the number above came from the database rather than the page bundle. */
  live: boolean;
  /** Every seat is taken. Only ever true against a live count — see below. */
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
 * `isFull` deliberately requires `live`. The seed number in initialData.ts is
 * demo filler; treating it as authoritative could gray out registration for an
 * event that has plenty of room. Until a real count arrives the form stays
 * open, and the database refuses the signup if it turns out to be full.
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

  return { registered, maxSeats, live, isFull: live && full, refresh };
}
