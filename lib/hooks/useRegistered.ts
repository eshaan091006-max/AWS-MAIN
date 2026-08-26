"use client";

import { useCallback, useEffect, useState } from "react";

const KEY_PREFIX = "sxc-aws:registered:";

/**
 * Remembers, per browser, that this visitor already registered for an event.
 *
 * This is an affordance, NOT the enforcement. There is no login, so the site
 * cannot actually know who is looking — the real guarantee is the unique index
 * on (event_id, lower(email)) in Postgres, which rejects a second signup with
 * the same email no matter which browser it comes from.
 *
 * What this adds is the obvious part of the experience: after you sign up the
 * button should say so, rather than inviting you to sign up again and then
 * failing. Clearing site data or switching browsers resets it, and that is
 * fine — the database still refuses the duplicate.
 */
export function useRegistered(eventId: string) {
  // Starts false on both server and client so the markup matches; the real
  // value is read after mount. Rendering the stored value directly would be a
  // hydration mismatch, since the server cannot see localStorage.
  const [isRegistered, setIsRegistered] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      setIsRegistered(window.localStorage.getItem(KEY_PREFIX + eventId) !== null);
    } catch {
      // Private mode or blocked storage — fall back to "not registered".
    }
    setChecked(true);
  }, [eventId]);

  const markRegistered = useCallback(
    (email?: string) => {
      setIsRegistered(true);
      try {
        window.localStorage.setItem(
          KEY_PREFIX + eventId,
          JSON.stringify({ at: new Date().toISOString(), email: email ?? null })
        );
      } catch {
        // Nothing to do: the flag stays in memory for this page view.
      }
    },
    [eventId]
  );

  return { isRegistered, checked, markRegistered };
}
