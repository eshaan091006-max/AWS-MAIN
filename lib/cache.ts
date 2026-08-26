/**
 * Tiny in-process TTL cache.
 *
 * ONLY for values that are safe to serve slightly stale AND carry no personal
 * data. Seat counts qualify: they are plain integers, and an events listing
 * otherwise makes one database round-trip per event card per visitor.
 *
 * Registrations and contact messages do NOT qualify and must never be stored
 * here — they hold student names, emails and UIDs, and a process-wide cache is
 * shared across every visitor to the server.
 *
 * State is per-process, so on serverless each instance keeps its own copy. That
 * is fine for a display counter; it would not be fine for anything that has to
 * be correct, which is why the seat *limit* is enforced in Postgres instead.
 */
interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

// Bounds memory if keys ever proliferate.
const MAX_KEYS = 5_000;

function sweep(now: number) {
  const expired: string[] = [];
  store.forEach((entry, key) => {
    if (entry.expiresAt <= now) expired.push(key);
  });
  expired.forEach((key) => store.delete(key));
}

export async function getCached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;

  // Checked against the entry's existence, not its truthiness: a seat count of
  // 0 is a real cached answer.
  if (hit && hit.expiresAt > now) return hit.value;

  // Awaited before storing, so a rejected load leaves nothing behind and the
  // next caller retries instead of inheriting the failure for a whole TTL.
  const value = await load();

  if (store.size >= MAX_KEYS) sweep(now);
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidate(key: string): void {
  store.delete(key);
}
