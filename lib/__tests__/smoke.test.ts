import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("AWS Foundations Event")).toBe("aws-foundations-event");
  });

  it("strips punctuation", () => {
    expect(slugify("Cloud & Code: 2026!")).toBe("cloud-code-2026");
  });
});
