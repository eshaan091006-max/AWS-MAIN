import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("verifies a password against its own hash", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", stored)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("Correct horse battery staple", stored)).toBe(false);
    expect(await verifyPassword("", stored)).toBe(false);
  });

  it("produces a different hash each time, so equal passwords are not equal hashes", async () => {
    const a = await hashPassword("same-password-here");
    const b = await hashPassword("same-password-here");
    expect(a).not.toBe(b);
    // Both still verify — the salt is stored alongside the digest.
    expect(await verifyPassword("same-password-here", a)).toBe(true);
    expect(await verifyPassword("same-password-here", b)).toBe(true);
  });

  it("returns false for malformed stored values rather than throwing", async () => {
    for (const bad of ["", "nonsense", "scrypt:onlyonepart", "bcrypt:aa:bb", "scrypt::", "scrypt:zz:zz"]) {
      expect(await verifyPassword("whatever", bad)).toBe(false);
    }
  });

  it("stores in the documented scrypt:salt:hash shape", async () => {
    const stored = await hashPassword("shape-check-password");
    const parts = stored.split(":");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("scrypt");
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/);
    expect(parts[2]).toMatch(/^[0-9a-f]{128}$/);
  });
});
