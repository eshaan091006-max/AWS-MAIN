import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCached, invalidate } from "@/lib/cache";

describe("getCached", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls the loader once within the TTL", async () => {
    const load = vi.fn().mockResolvedValue(1);
    expect(await getCached("k1", 1000, load)).toBe(1);
    expect(await getCached("k1", 1000, load)).toBe(1);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads after the TTL expires", async () => {
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await getCached("k2", 1000, load)).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(await getCached("k2", 1000, load)).toBe(2);
  });

  it("reloads after invalidate", async () => {
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await getCached("k3", 60_000, load)).toBe(1);
    invalidate("k3");
    expect(await getCached("k3", 60_000, load)).toBe(2);
  });

  it("does not cache a rejected loader", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(7);
    await expect(getCached("k4", 60_000, load)).rejects.toThrow("boom");
    // The failure must not be remembered, or one blip poisons the key for the
    // whole TTL.
    expect(await getCached("k4", 60_000, load)).toBe(7);
  });

  it("keeps separate keys separate", async () => {
    await getCached("a", 60_000, async () => "A");
    await getCached("b", 60_000, async () => "B");
    expect(await getCached("a", 60_000, async () => "changed")).toBe("A");
    expect(await getCached("b", 60_000, async () => "changed")).toBe("B");
  });

  it("caches falsy values rather than treating them as a miss", async () => {
    // A seat count of 0 is a real answer; re-loading on every zero would defeat
    // the cache exactly when an event is empty.
    const load = vi.fn().mockResolvedValue(0);
    expect(await getCached("zero", 60_000, load)).toBe(0);
    expect(await getCached("zero", 60_000, load)).toBe(0);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
