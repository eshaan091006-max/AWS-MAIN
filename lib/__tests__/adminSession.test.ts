import { describe, it, expect } from "vitest";
import {
  createSessionToken,
  readSessionToken,
  isValidUsername,
} from "@/lib/adminSession";

const SECRET = "test-secret-at-least-32-characters-long!!";
const OTHER = "another-secret-also-32-chars-long-yes!!!";

function future() {
  return Date.now() + 60_000;
}

describe("session tokens", () => {
  it("reads back the username it was issued for", async () => {
    const token = await createSessionToken(SECRET, "eshaan", future());
    expect(await readSessionToken(SECRET, token)).toBe("eshaan");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(SECRET, "eshaan", future());
    expect(await readSessionToken(OTHER, token)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken(SECRET, "eshaan", Date.now() - 1);
    expect(await readSessionToken(SECRET, token)).toBeNull();
  });

  it("rejects a token whose expiry was edited to extend the session", async () => {
    const token = await createSessionToken(SECRET, "eshaan", future());
    const signature = token.split(".")[2];
    const forged = `eshaan.${Date.now() + 999_999_999}.${signature}`;
    expect(await readSessionToken(SECRET, forged)).toBeNull();
  });

  it("rejects a token whose username was swapped for someone else's", async () => {
    const token = await createSessionToken(SECRET, "eshaan", future());
    const [, expiry, signature] = token.split(".");
    const forged = `president.${expiry}.${signature}`;
    expect(await readSessionToken(SECRET, forged)).toBeNull();
  });

  it("rejects malformed input rather than throwing", async () => {
    for (const bad of ["", "nodots", "a.b", "a.b.c.d", "..", "user.notanumber.abc"]) {
      expect(await readSessionToken(SECRET, bad)).toBeNull();
    }
  });

  it("rejects an empty secret, so an unconfigured deployment cannot be entered", async () => {
    const token = await createSessionToken(SECRET, "eshaan", future());
    expect(await readSessionToken("", token)).toBeNull();
  });
});

describe("isValidUsername", () => {
  it("accepts lowercase names, digits, dash and underscore", () => {
    for (const ok of ["eshaan", "aws_lead", "core-team-1", "abc"]) {
      expect(isValidUsername(ok)).toBe(true);
    }
  });

  it("rejects anything that would make the dotted token ambiguous", () => {
    // A dot in the username would break token parsing.
    for (const bad of ["has.dot", "Uppercase", "ab", "x".repeat(33), "with space", "", "sym$bol"]) {
      expect(isValidUsername(bad)).toBe(false);
    }
  });
});
